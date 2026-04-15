import { useState } from "react";
import { useShiftHistory } from "../hooks/useShiftHistory";
import { formatShiftDate } from "../utils/dateUtils";

import { sendReport } from '../services/api'
import { CompletedShift } from '../types'
import { buildMailtoLink } from "../utils/shiftUtils";
import { useSettings } from "../hooks/useSettings";


function HistoryPage() {

  const [expandedShiftId, setExpandedShiftId] = useState<string | null>(null);

  const { history, markReported, deleteShift } = useShiftHistory();

  const [sendingId, setSendingId] = useState<string | null>(null)
  const [errorId, setErrorId] = useState<string | null>(null)
  const { settings } = useSettings()

  const [awaitingConfirm, setAwaitingConfirm] = useState<string | null>(null)



  const handleSendReport = async (shift: CompletedShift) => {
    setSendingId(shift.id)
    setErrorId(null)
    try {
      const result = await sendReport(shift)
      if (result.success) {
        markReported(shift.id)
      } else {
        setErrorId(shift.id)
      }
    } catch {
      setErrorId(shift.id)
    } finally {
      setSendingId(null)
    }
  }

  const handleToggle = (shiftId: string) => {
    setExpandedShiftId(expandedShiftId === shiftId ? null : shiftId);
  };

  return (
    <main className="history-page">
      <h1>Shift History</h1>
      {history.length === 0 ? (
        <p className="history-empty">No completed shifts yet.</p>
      ) : (
        <ul className="history-list">
          {history.map((shift) => {
            const isExpanded = shift.id === expandedShiftId;
            return (
              // Shift item container
              <li key={shift.id} className={`history-item${isExpanded ? ' expanded' : ''}`}>
                <button
                  type="button"
                  className="history-item-header"
                  onClick={() => handleToggle(shift.id)}
                >
                  <div className="history-item-header-left">
                    <span className="history-date">
                      {formatShiftDate(shift.date)}
                    </span>
                    <span className="history-game-count">{shift.games.length} games</span>
                  </div>
                  <span className={`history-badge${shift.reportSent ? ' reported' : ' unreported'}`}>
                    {shift.reportSent ? 'Reported' : 'Not Reported'}
                  </span>
                </button>

                {isExpanded && (
                  <div className="history-item-details">
                    <ul className="history-games-list">
                      {shift.games.map((fixture) => (
                        <li key={fixture.id} className="history-game-row">
                          <span className="history-game-teams">
                            {fixture.home} - {fixture.homeScore} vs {fixture.away} - {fixture.awayScore}
                          </span>

                          {fixture.incidents.length > 0 && (
                            <table className="incident-table">
                              <thead>
                                <tr>
                                  <th>Team</th>
                                  <th>Player</th>
                                  <th>Type</th>
                                  <th>Description</th>
                                </tr>
                              </thead>
                              <tbody>
                                {fixture.incidents.map((incident) => (
                                  <tr key={incident.id}>
                                    <td>{incident.team}</td>
                                    <td>{incident.name || '—'}</td>
                                    <td>{incident.type.replace(/_/g, ' ')}</td>
                                    <td>{incident.description || '—'}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}

                        </li>
                      ))}
                    </ul>
                    <div className="history-item-actions">

                      {!shift.reportSent && (
                        <>
                          <button
                            onClick={() => handleSendReport(shift)}
                            disabled={sendingId === shift.id}
                            className="btn-autosend"
                          >
                            {sendingId === shift.id ? 'Sending...' : 'Auto-Send Report'}
                          </button>
                          {errorId === shift.id && (
                            <p className="error">Failed to send. Please try again.</p>
                          )}
                        </>
                      )}

                      {!shift.reportSent && (
                        <a
                          href={buildMailtoLink(shift, settings)}
                          onClick={() => setAwaitingConfirm(shift.id)}
                          className="btn-mailto"
                        >
                          Open in Email App
                        </a>
                      )}

                      {/* // confirmation prompt — shows after clicking mailto */}
                      {awaitingConfirm === shift.id && (
                        <div className="history-confirm">
                          <p className="history-confirm-text">Did you send the email?</p>
                          <div className="history-confirm-actions">
                            <button type="button" className="history-confirm-yes" onClick={() => { markReported(shift.id); setAwaitingConfirm(null) }}>Yes, mark as reported</button>
                            <button type="button" className="history-confirm-no" onClick={() => setAwaitingConfirm(null)}>No</button>
                          </div>
                        </div>
                      )}

                      <button
                        className="btn-danger"
                        onClick={() => deleteShift(shift.id)}
                      >
                        Delete Shift
                      </button>
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