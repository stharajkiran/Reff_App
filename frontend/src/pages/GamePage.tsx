import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useShiftCart } from '../context/ShiftCartContext'
import { useGameResults } from "../hooks/useGameResults";
import { IncidentSection } from "../components/IncidentSection";
import { useGameTimer } from "../hooks/useGameTimer";
import { useSettings } from "../hooks/useSettings";

function GamePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { cartFixtures } = useShiftCart();
  const getFixture = (fixtureId: string) => cartFixtures.find(f => f.id === fixtureId) ?? null;
  const { getResult, updateResult, createDefaultResult } = useGameResults();

  const [showTimer, setShowTimer] = useState(false);


  const { settings } = useSettings();

  // Look up fixture and result data for this game.
  const fixture = id ? getFixture(id) : null;
  const result = id ? getResult(id) : null;
  const status = result?.status ?? "not_started";

  const { timerDisplay, isPastLimit } = useGameTimer(result, status, id ?? '', updateResult)


  // Guard: redirect to shift if id is missing or fixture doesn't exist.
  useEffect(() => {
    if (!id || !fixture) {
      navigate("/shift");
    }
  }, [id, fixture, navigate]);

  // Initialize result once on mount — must be before early return (Rules of Hooks).
  useEffect(() => {
    if (id && fixture && !getResult(id)) {
      updateResult(id, createDefaultResult(id, settings));
    }
  }, []);

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



         {(status!="final" && status!="not_started") && <button
          className={`incident-toggle-btn cancel`}
          onClick={() => updateResult(id, { status: "not_started" })}
        >
          Reset Timer
        </button>}


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

      <button className="btn-back" onClick={() => navigate("/shift")}>← Back to Schedule</button>

      <section className="incident-section-wrapper">
        <IncidentSection
          fixtureId={id}
          homeName={fixture.home}
          awayName={fixture.away}
          incidents={result?.incidents ?? []}
          onAddIncident={(incident) => {
            updateResult(id, { incidents: [...(result?.incidents ?? []), incident] });
          }}
          onRemoveIncident={(incidentId) => {
            const updatedIncidents = (result?.incidents ?? []).filter(i => i.id !== incidentId);
            updateResult(id, { incidents: updatedIncidents });
          }}
        />
      </section>
    </main>
  );
}

export default GamePage;
