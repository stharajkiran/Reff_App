import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useShiftCart } from '../context/ShiftCartContext'
import { useGameResults } from "../hooks/useGameResults";
import { HALF_DURATION_MINUTES, BREAK_DURATION_SECONDS } from "../config";

function GamePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { cartFixtures } = useShiftCart();
  const getFixture = (fixtureId: string) => cartFixtures.find(f => f.id === fixtureId) ?? null;
  const { getResult, updateResult, createDefaultResult } = useGameResults();

  // Look up fixture and result data for this game.
  const fixture = id ? getFixture(id) : null;
  const result = id ? getResult(id) : null;
  const status = result?.status ?? "not_started";


  // time
  const [now, setNow] = useState(Date.now());

  const alertSound = new Audio("/alert.mp3");

  const isActive = ["first_half", "half_time", "second_half"].includes(status);
  // Determine which start time to use based on status
  const startedAt = status === "first_half" ? result?.firstHalfStartedAt
    : status === "second_half" ? result?.secondHalfStartedAt
      : status === "half_time" ? result?.halfTimeStartedAt
        : null;

  // Time limit is based on the current phase's duration setting.
  // Fallbacks match config defaults in case result hasn't initialized yet.
  const limitSeconds = status === "half_time"
    ? (result?.breakDurationSeconds ?? BREAK_DURATION_SECONDS)
    : (result?.halfDurationMinutes ?? HALF_DURATION_MINUTES) * 60

  // 2. Calculate elapsed seconds based on the active period.
  const elapsedSeconds = startedAt ? Math.floor((now - startedAt) / 1000) : 0;
  // Visual indicator: are we past the expected duration?
  const isPastLimit = elapsedSeconds > limitSeconds;

  const mins = Math.floor(elapsedSeconds / 60);
  const secs = elapsedSeconds % 60;
  const timerDisplay = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  // Guard: redirect to shift if id is missing or fixture doesn't exist.
  useEffect(() => {
    if (!id || !fixture) {
      navigate("/shift");
    }
  }, [id, fixture, navigate]);

  // Initialize result once on mount — must be before early return (Rules of Hooks).
  useEffect(() => {
    if (id && fixture && !getResult(id)) {
      updateResult(id, createDefaultResult(id));
    }
  }, []);

  // Timer: ticks every second during first_half, auto-transitions when time is up.
  useEffect(() => {
    // Guard: Make sure result exists and we are in a running state
    if (!result || !id) return;

    if (isActive && startedAt) {
      const interval = setInterval(() => {
        const currentTime = Date.now();
        setNow(currentTime);
        // Time in seconds since the current phase started
        const elapsed = Math.floor((currentTime - startedAt) / 1000)
        // ONLY auto-transition if we are in a LIVE half
        if (status === "first_half" || status === "second_half") {
          if (elapsed >= limitSeconds) {
            const nextStatus = status === "first_half" ? "half_time" : "final";
            updateResult(id!, {
              status: nextStatus,
              halfTimeStartedAt: status === "first_half" ? currentTime : undefined
            });
          }
        }
        if (status === "half_time" && elapsed === limitSeconds) {
          alertSound.play().catch(e => console.log("Audio play blocked", e));
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [status, result]);

  // Return null while the redirect fires — prevents rendering with bad data.
  if (!id || !fixture) return null;

  // Score Handlers
  const handleHomeScore = (delta: number) => {
    const currentScore = result?.homeScore ?? 0;
    updateResult(id, {
      homeScore: Math.max(0, currentScore + delta),
    });
  };

  const handleAwayScore = (delta: number) => {
    const currentScore = result?.awayScore ?? 0;
    updateResult(id, {
      awayScore: Math.max(0, currentScore + delta),
    });
  };

  // Handlers for starting/ending halves and the game would go here
  const handleStartFirstHalf = () => {
    if (status === "not_started") {
      updateResult(id, {
        status: "first_half",
        firstHalfStartedAt: Date.now(),
      });
    }
  };

  const handleStartSecondHalf = () => {
    if (status === "half_time") {
      updateResult(id, {
        status: "second_half",
        secondHalfStartedAt: Date.now(),
      });
    }
  };

  return (
    <main className="game-page">
      <header className="game-header">
        <h1>Match Tracker</h1>
        <div className="meta-info">
          <span>{fixture.time}</span>
          <span className="dot">•</span>
          <span>{fixture.location ?? "Field not set"}</span>
        </div>
      </header>

      <div className="status-control">
        {/* 1. PRIMARY ACTION BUTTONS (Only show when user needs to act) */}
        {status === "not_started" && (
          <button className="start-btn" onClick={handleStartFirstHalf}>
            Start First Half
          </button>
        )}

        {status === "half_time" && (
          <button className="start-btn" onClick={handleStartSecondHalf}>
            Start Second Half
          </button>
        )}

        {/* 2. THE LIVE STATUS BADGE (Shows for any active or paused state) */}
        {["first_half", "half_time", "second_half"].includes(status) && (
          <div className={`status-badge ${isPastLimit ? "timer-overtime" : ""}`}>
            <span className="live-icon">●</span>
            {status.replace(/_/g, ' ').toUpperCase()}
            <div className="match-timer">
              <span className="clock-icon">⏱</span>
              <span className={`time-digits`}>
                {timerDisplay}
                {isPastLimit && <span className="plus-sign">+</span>}
              </span>
            </div>
          </div>
        )}

        {/* 3. THE FINAL STATE */}
        {status === "final" && (
          <>
            <div className="final-badge">
              <span className="check-icon">✓</span>
              Final Score
            </div>
            <button className="secondary-btn" onClick={() => navigate("/shift")}>
              Return to Schedule
            </button>
          </>
        )}
      </div>

      <section className="score-dashboard">
        {/* Home Team Card */}
        <div className="score-card-container">
          <button
            className="score-card home"
            onClick={() => handleHomeScore(1)}
          >
            <span className="team-name">{fixture.home}</span>
            <span className="score-value">{result?.homeScore ?? 0}</span>
          </button>
          <button className="undo-btn" onClick={() => handleHomeScore(-1)}>
            Reduce score
          </button>
        </div>

        <div className="vs-label">VS</div>

        {/* Away Team Card */}
        <div className="score-card-container">
          <button
            className="score-card away"
            onClick={() => handleAwayScore(1)}
          >
            <span className="team-name">{fixture.away}</span>
            <span className="score-value">{result?.awayScore ?? 0}</span>
          </button>
          <button className="undo-btn" onClick={() => handleAwayScore(-1)}>
            Reduce score
          </button>
        </div>
      </section>
    </main>
  );
}

export default GamePage;
