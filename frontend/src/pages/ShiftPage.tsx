import { useNavigate } from 'react-router-dom'
import { useGameResults } from '../hooks/useGameResults'
import { useShiftCart } from '../hooks/useShiftCart'


// ShiftPage is the referee's overview of all games in the current shift.
// It shows every selected fixture with its live score and status.
// Tapping a fixture navigates to GamePage for that specific game.
function ShiftPage() {
  const navigate = useNavigate()
  const { cartFixtures, removeFromCart } = useShiftCart();

  // On a fresh shift, FixturesPage sends selectedFixtures via navigation state.
  // On a cold start (app killed and reopened), navigation state is null —
  // useShiftFixtures falls back to localStorage to recover the shift.


  // useGameResults reads scores and game status from localStorage.
  // Each fixture may or may not have a result yet — getResult returns null
  // for games that haven't started, so we fall back to safe defaults below.
  const { getResult } = useGameResults()

  // Navigate to GamePage, passing only the fixtureId in the URL.
  // GamePage looks up fixture details from localStorage — not navigation state —
  // so it survives cold starts and direct URL access.
  const handleOpenGame = (fixtureId: string) => {
    navigate(`/game/${fixtureId}`)
  }

  return (
    <main className="shift-page">

      <h1>Current Shift</h1>
      <ul className="shift-list">
        {cartFixtures.map((fixture) => {
          // result is null if the game hasn't been opened yet.
          const result = getResult(fixture.id)
          const status = result?.status ?? 'not_started'
          const homeScore = result?.homeScore ?? 0
          const awayScore = result?.awayScore ?? 0

          // Convert status to a CSS-friendly class name.
          const statusClass = status.replace(/_/g, '-') // used in className below

          return (
            <li key={fixture.id} className="shift-game-item">
              <button
                type="button"
                className="shift-game-button"
                onClick={() => handleOpenGame(fixture.id)}
              >
                <span className="shift-game-meta">{fixture.time} · {fixture.location ?? 'Field not set'}</span>
                <span className="shift-game-teams">{fixture.home} vs {fixture.away}</span>
                <span className="shift-game-score">{homeScore} – {awayScore}</span>
                <span className={`shift-game-status status-${statusClass}`}>{status.replace(/_/g, ' ')}</span>
                <button
                  type="button"
                  className='fixtures-button'
                  onClick={() => removeFromCart(fixture.id)}
                >
                  Remove
                </button>
              </button>

            </li>
          )
        })}
      </ul>
    </main>
  )
}

export default ShiftPage