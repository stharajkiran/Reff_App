import { Incident } from "../types";
import { useState } from "react";

type IncidentSectionProps = {
    fixtureId: string
    homeName: string
    awayName: string
    incidents: Incident[]
    onAddIncident: (incident: Incident) => void
    onRemoveIncident: (incidentId: string) => void
}


export function IncidentSection({
    homeName,
    awayName,
    incidents,
    onAddIncident,
    onRemoveIncident,
}: IncidentSectionProps) {

    //Local state for new incident form
    const [newIncidentType, setNewIncidentType] = useState<Incident['type']>('yellow_card');
    const [showForm, setShowForm] = useState(false);
    const [team, setTeam] = useState<string>(homeName);
    const [description, setDescription] = useState('');
    const [name, setName] = useState('');

    function handleAddIncident() {
        const newIncident: Incident = {
            id: crypto.randomUUID(),
            team: team,
            type: newIncidentType,
            description: description,
            name: name || '',
        };
        onAddIncident(newIncident);
        // Reset form
        setNewIncidentType('yellow_card');
        setTeam(homeName);
        setDescription('');
        setName('');
        setShowForm(false); // Keep form open for adding multiple incidents, or set to false if you want to

        // Hide form after adding

    }

    return (
        <div className="incident-section">
            <div className="incident-section-header">
                <h2 className="incident-section-title">Incidents</h2>
                <button
                    className={`incident-toggle-btn${showForm ? ' cancel' : ''}`}
                    onClick={() => setShowForm((prev) => !prev)}
                >
                    {showForm ? 'Cancel' : '+ Add Incident'}
                </button>
            </div>

            {showForm && (
                <div className="incident-form">
                    <label>
                        Team
                        <select value={team} onChange={(e) => setTeam(e.target.value)}>
                            <option value={homeName}>{homeName}</option>
                            <option value={awayName}>{awayName}</option>
                        </select>
                    </label>
                    <label>
                        Player Name
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Optional" />
                    </label>
                    <label>
                        Type
                        <select value={newIncidentType} onChange={(e) => setNewIncidentType(e.target.value as Incident['type'])}>
                            <option value="yellow_card">Yellow Card</option>
                            <option value="red_card">Red Card</option>
                            <option value="injury">Injury</option>
                            <option value="other">Other</option>
                        </select>
                    </label>
                    <label>
                        Description
                        <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional" />
                    </label>
                    <button onClick={handleAddIncident}>Add Incident</button>
                </div>
            )}

            {incidents.length > 0 && (() => {
                const byTeam: Record<string, Incident[]> = {}
                incidents.forEach(i => {
                    if (!byTeam[i.team]) byTeam[i.team] = []
                    byTeam[i.team].push(i)
                })
                return Object.entries(byTeam).map(([teamName, teamIncidents]) => (
                    <div key={teamName} className="incident-team-group">
                        <h3 className="incident-team-name">{teamName}</h3>
                        <table className="incident-table">
                            <thead>
                                <tr>
                                    <th>Player</th>
                                    <th>Type</th>
                                    <th>Description</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {teamIncidents.map(incident => (
                                    <tr key={incident.id}>
                                        <td>{incident.name || '—'}</td>
                                        <td>{incident.type.replace(/_/g, ' ')}</td>
                                        <td>{incident.description || '—'}</td>
                                        <td>
                                            <button className="incident-remove-btn" onClick={() => onRemoveIncident(incident.id)}>✕</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ))
            })()}
        </div>
    )

}