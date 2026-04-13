import { useState } from "react";
import { useShiftHistory } from "../hooks/useShiftHistory";

function HistoryPage() {

  const [expandedShiftId, setExpandedShiftId] = useState<string | null>(null);

  const { history, markReported, deleteShift } = useShiftHistory();

  const handleToggle = (shiftId: string) => {
    setExpandedShiftId(expandedShiftId === shiftId ? null : shiftId);
  };


  return (
    <main className="history-page">
      <h1>Shift History</h1>
      {history.length === 0 ? (
        <p>No completed shifts yet.</p>
      ) : (
        <ul className="history-list">
          {history.map((shift) => {
            // Determine if this shift is currently expanded to show details.
            const isExpanded = shift.id === expandedShiftId;
            return (
              <li key={shift.id} className="history-item">
                <div className="history-item-header" onClick={() => handleToggle(shift.id)}>
                  <span>
                    {new Date(shift.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      weekday: 'long',
                    })}
                  </span>
                  <span> {shift.games.length} games</span>
                  <span>{shift.reportSent ? "✅ Reported" : " ❌ Not Reported"}</span>
                </div>

                {/* If this shift is expanded, show the list of games and action buttons. */}
                {isExpanded && (
                  <div className="history-item-details">
                    <ul className="history-games-list">
                      {shift.games.map((fixture) => (
                        <li key={fixture.id}>
                          <span>{fixture.home} vs {fixture.away}</span>
                          <span> {fixture.homeScore} – {fixture.awayScore}</span>
                          <span> {fixture.status.replace(/_/g, ' ')}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="history-item-actions">
                      {!shift.reportSent && (
                        <button onClick={() => markReported(shift.id)} disabled={shift.reportSent}>Mark as Reported</button>
                      )}
                      <button onClick={() => deleteShift(shift.id)}>Delete Shift</button>
                    </div>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </main>
  )
}
export default HistoryPage