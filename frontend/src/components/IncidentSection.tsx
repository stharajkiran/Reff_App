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
        setTeam('');
        setDescription('');
        setName('');
        setShowForm(false); // Keep form open for adding multiple incidents, or set to false if you want to

        // Hide form after adding

    }

    return (
        <>
            <button onClick={() => setShowForm((prev) => !prev)}>
                {showForm ? 'Cancel' : 'Add Incident'}
            </button>

            <h2>Incidents</h2>
            {showForm && (
                <div className="incident-form">
                    <label>
                        Team:
                        <select value={team} onChange={(e) => setTeam(e.target.value as Incident['team'])}>
                            <option value={homeName}>{homeName}</option>
                            <option value={awayName}>{awayName}</option>
                        </select>
                    </label>
                    <label htmlFor="incident-name">Name:</label>
                    <input id="incident-name" type="text" value={name} onChange={(e) => setName(e.target.value)} />
                    <label>
                        Type:
                        <select value={newIncidentType} onChange={(e) => setNewIncidentType(e.target.value as Incident['type'])}>
                            <option value="yellow_card">Yellow Card</option>
                            <option value="red_card">Red Card</option>
                            <option value="injury">Injury</option>
                            <option value="other">Other</option>
                        </select>
                    </label>
                    <label htmlFor="incident-description">Description:</label>
                    <input id="incident-description" type="text" value={description} onChange={(e) => setDescription(e.target.value)} />
                    <button onClick={handleAddIncident}>Add Incident</button>
                </div>
            )}
            <ul>
                {incidents.map((incident) => (
                    <li key={incident.id}>
                        <strong>{incident.team}</strong> - Name: {incident.name} - {incident.type.replace('_', ' ')}: {incident.description}
                        <button onClick={() => onRemoveIncident(incident.id)}>Remove</button>
                    </li>
                ))}
            </ul>
        </>
    )

}