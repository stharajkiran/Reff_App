
import { useState, useMemo } from 'react';

import { useFixtures } from '../hooks/useFixtures';
import { useShiftCart } from '../context/ShiftCartContext'
import { ParsedFixture } from '../types';
import KNOWN_FIELDS from '../config';
import { normalizeTimeTo24h } from '../utils/dateUtils';
import { FixtureCartRow } from '../components/FixtureCartRow';
import { formatDateToFixture } from '../utils/dateUtils'
import { formatShiftDate } from "../utils/dateUtils";


export function ShiftBuilderPage() {
    // const navigate = useNavigate();

    // 1. Hook into your Logic Layers
    const { leagues, apiFixtures: fixtures, loadingFixtures, fetchFixturesForLeague, loadingAll, allFixtures, fetchAllFixtures } = useFixtures();
    const { addToCart, removeFromCart, isInCart } = useShiftCart();

    // 2. Local UI State
    const [selectedLeague, setSelectedLeague] = useState("");

    // Date state with default to today's date in ISO format
    const today = new Date()
    const localDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    const [selectedDate, setSelectedDate] = useState(localDate)

    // Smart filter state
    const [startTime, setStartTime] = useState('')
    const [endTime, setEndTime] = useState('')
    const [selectedField, setSelectedField] = useState('')

    // 3. Handlers
    const handleLeagueChange = (leagueId: string) => {
        setSelectedLeague(leagueId);
        if (leagueId) fetchFixturesForLeague(leagueId);

    };

    const handleFindMyGames = async () => {
        if (selectedLeague) {
            await fetchFixturesForLeague(selectedLeague)
        } else {
            await fetchAllFixtures()
        }
    }


    const filteredFixtures = useMemo(() => {
        // const sourceFixtures = selectedLeague ? fixtures : allFixtures
        const sourceFixtures = allFixtures.length > 0 ? allFixtures : fixtures
        if (sourceFixtures.length === 0) return []

        return sourceFixtures.filter(f => {
            // selectedLeague is league ID, Retrieve actal league name for comparison
            const selectedLeagueName = leagues.find(l => l.id === selectedLeague)?.name ?? ''
            const matchesLeague = !selectedLeague || f.leagueName === selectedLeagueName
            const matchesDate = !selectedDate || f.date === formatDateToFixture(selectedDate)
            const matchesField = !selectedField || f.location === selectedField
            const matchesStart = !startTime || normalizeTimeTo24h(f.time) >= normalizeTimeTo24h(startTime)
            const matchesEnd = !endTime || normalizeTimeTo24h(f.time) <= normalizeTimeTo24h(endTime)
            return matchesLeague && matchesDate && matchesField && matchesStart && matchesEnd
        })
    }, [fixtures, allFixtures, selectedLeague, selectedDate, selectedField, startTime, endTime])



    // Group the fixtures by date for easier rendering. 
    // This is a pure function of the fixtures array, so we memoize it.
    const groupedFixtures = useMemo(() => {
        const groups: Record<string, ParsedFixture[]> = {}
        filteredFixtures.forEach(fixture => {
            const date = fixture.date ?? 'unknown'
            if (!groups[date]) groups[date] = []
            groups[date].push(fixture)
        })
        // Sort each group by time ascending
        for (const date in groups) {
            groups[date].sort((a, b) => normalizeTimeTo24h(a.time) - normalizeTimeTo24h(b.time))
        }
        return groups
    }, [filteredFixtures])

    // Sort date keys chronologically: "2026-april-15" → Date
    const sortedDates = useMemo(() => {
        const toMs = (d: string) => {
            const [year, month, day] = d.split('-')
            return new Date(`${month} ${day}, ${year}`).getTime()
        }
        return Object.keys(groupedFixtures).sort((a, b) => toMs(a) - toMs(b))
    }, [groupedFixtures])

    // tracks temporary field overrides before adding to cart
    const [fieldOverrides, setFieldOverrides] = useState<Record<string, string>>({})

    const getLocation = (fixture: ParsedFixture): string | null => {
        return fieldOverrides[fixture.id] ?? fixture.location
    }

    const handleAdd = (fixture: ParsedFixture) => {
        const location = getLocation(fixture)
        addToCart({ ...fixture, location, needsFieldReview: !location })
    }


    return (
        <main className="shift-builder-page">
            <div className="shift-builder-header">
                <h1>Build Your Shift</h1>
            </div>

            {/* --------------------- Controls for Smart game selection --------------------- */}
            <section className="shift-builder-controls">


                {/* Date selection  */}
                <div className="control-group">
                    <label htmlFor="datePicker" className="control-label">Date</label>
                    <input
                        id="datePicker"
                        type="date"
                        className="control-input"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                    />
                    <button onClick={() => setSelectedDate('')}>Clear</button>

                </div>

                {/* Field selection */}
                <div className="control-group">
                    <label htmlFor="fieldSelect" className="control-label">Field</label>
                    <select
                        id="fieldSelect"
                        className="control-select"
                        value={selectedField}
                        onChange={(e) => setSelectedField(e.target.value)}
                    >
                        <option value="">Any field</option>
                        {KNOWN_FIELDS.map(field => (
                            <option key={field} value={field}>{field}</option>
                        ))}
                    </select>
                </div>

                {/* Start time selection */}
                <div className="control-group">
                    <label htmlFor="startTime" className="control-label">Start Time</label>
                    <input
                        id="startTime"
                        type="time"
                        className="control-input"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                    />
                    <button onClick={() => setStartTime('')}>Clear</button>
                </div>

                {/* End time selection */}
                <div className="control-group">
                    <label htmlFor="endTime" className="control-label">End Time</label>
                    <input
                        id="endTime"
                        type="time"
                        className="control-input"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                    />
                    <button onClick={() => setEndTime('')}>Clear</button>
                </div>

                {/* League selection  */}
                <div className="control-group">
                    <label htmlFor="leaguePicker" className="control-label">League</label>
                    <select
                        id="leaguePicker"
                        className="control-input"
                        value={selectedLeague}
                        onChange={(e) => handleLeagueChange(e.target.value)}
                    >
                        <option value="">Select a league...</option>
                        {leagues.map((league) => (
                            <option key={league.id} value={league.id}>
                                {league.name}
                            </option>
                        ))}
                    </select>
                </div>


            </section>

            <div className="find-games-row">
                <button className="find-games-btn" onClick={handleFindMyGames} disabled={loadingAll}>
                    {loadingAll ? 'Finding games...' : 'Find My Games'}
                </button>
            </div>
            {/* --------------------- Load the fixtures for Smart game selection --------------------- */}
            {
                (loadingAll || loadingFixtures) ? (
                    <p className="shift-builder-loading">Loading all fixtures...</p>
                ) : (

                    <section className="shift-builder-fixtures">
                        {
                            sortedDates.length === 0 ? (
                                <p className="shift-builder-empty">No fixtures found.</p>
                            ) : (
                                sortedDates.map(date => (
                                    <div key={date} className="fixture-date-group">
                                        <p className="date-separator">{formatShiftDate(date)}</p>
                                        {groupedFixtures[date].map((fixture) => {
                                            const inCart = isInCart(fixture.id)
                                            return (<FixtureCartRow
                                                key={fixture.id}
                                                fixture={fixture}
                                                inCart={inCart}
                                                hasLocation={!!getLocation(fixture)}
                                                fieldOverride={fieldOverrides[fixture.id] ?? ''}
                                                onFieldChange={(value) => setFieldOverrides(prev => ({ ...prev, [fixture.id]: value }))}
                                                onAdd={() => handleAdd(fixture)}
                                                onRemove={() => removeFromCart(fixture.id)}
                                            />)
                                        })}
                                    </div>
                                ))
                            )
                        }
                    </section>

                )
            }

        </main>
    );
}

export default ShiftBuilderPage
