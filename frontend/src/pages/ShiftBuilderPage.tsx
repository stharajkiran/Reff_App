
import { useState, useEffect } from 'react';

import { useFixtures } from '../hooks/useFixtures';
import { useShiftCart } from '../context/ShiftCartContext'
import { ParsedFixture } from '../types';
import KNOWN_FIELDS, { LEAGUE_FIELDS } from '../config';
import { normalizeTimeTo24h } from '../utils/dateUtils';

const formatDateToFixture = (isoDate: string): string => {
    const [year, _, day] = isoDate.split('-')
    const monthName = new Date(isoDate).toLocaleString('en-US', { month: 'long' }).toLowerCase()
    const dayNum = parseInt(day).toString() // removes leading zero
    return `${year}-${monthName}-${dayNum}`
}
export function ShiftBuilderPage() {
    // const navigate = useNavigate();

    // 1. Hook into your Logic Layers
    const { leagues, apiFixtures: fixtures, loadingFixtures, fetchFixturesForLeague, loadingAll, allFixtures, fetchAllFixtures } = useFixtures();
    const { addToCart, removeFromCart, isInCart } = useShiftCart();

    // 2. Local UI State
    const [selectedLeague, setSelectedLeague] = useState("");
    const today = new Date()
    const localDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    const [selectedDate, setSelectedDate] = useState(localDate)

    // Smart filter state
    const [startTime, setStartTime] = useState('18:00')
    const [endTime, setEndTime] = useState('22:00')
    const [selectedField, setSelectedField] = useState('')
    const [smartResults, setSmartResults] = useState<ParsedFixture[]>([])

    // 3. Handlers
    const handleLeagueChange = (leagueId: string) => {
        setSelectedLeague(leagueId);
        if (leagueId) fetchFixturesForLeague(leagueId);
    };

    const handleFindMyGames = async () => {
        await fetchAllFixtures()
    }
    useEffect(() => {

        if (allFixtures.length === 0) return

        const startHrs = normalizeTimeTo24h(startTime)
        const endHrs = normalizeTimeTo24h(endTime)
        const filtered = allFixtures.filter(f => {
            const fixtureHrs = normalizeTimeTo24h(f.time)
            const matchesDate = f.date === formatDateToFixture(selectedDate)
            const matchesTime = fixtureHrs >= startHrs && fixtureHrs <= endHrs
            // get effective location — use fixture location or fall back to league default
            // const effectiveLocation = resolveLocation(f)
            // console.log('league name:', f.leagueName, 'location:', f.location, " effective location: ", effectiveLocation)
            const matchesField = !selectedField || f.location === selectedField
            return matchesDate && matchesTime && matchesField
        })

        setSmartResults(filtered)
    }, [allFixtures])

    // tracks temporary field overrides before adding to cart
    const [fieldOverrides, setFieldOverrides] = useState<Record<string, string>>({})

    const getLocation = (fixture: ParsedFixture): string | null => {
        return fieldOverrides[fixture.id] ?? fixture.location
    }

    const handleAdd = (fixture: ParsedFixture) => {
        const location = getLocation(fixture)
        addToCart({ ...fixture, location, needsFieldReview: !location })
    }


    const filteredFixtures = fixtures.filter(fixture => fixture.date === formatDateToFixture(selectedDate));

    return (
        <main className="shift-builder-page">
            <div className="shift-builder-header">
                <h1>Build Your Shift</h1>
            </div>
            {/* --------------------- Controls for league and date selection --------------------- */}
            <section className="shift-builder-controls">
                <div className="control-group">
                    <label htmlFor="leagueSelect" className="control-label">League</label>
                    <select
                        id="leagueSelect"
                        className="control-select"
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

                <div className="control-group">
                    <label htmlFor="datePicker" className="control-label">Date</label>
                    <input
                        id="datePicker"
                        type="date"
                        className="control-input"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                    />
                </div>
            </section>
            {/* --------------------- Load the fixtures --------------------- */}
            {loadingFixtures ? (
                <p className="shift-builder-loading">Loading fixtures...</p>
            ) : (
                <section className="shift-builder-fixtures">
                    {
                        filteredFixtures.length === 0 ? (
                            <p className="shift-builder-empty">No fixtures found for this date.</p>
                        ) : (
                            filteredFixtures.map((fixture) => {
                                const inCart = isInCart(fixture.id)
                                return (
                                    <div key={fixture.id} className={`sb-fixture-row${inCart ? ' in-cart' : ''}`}>
                                        <div className="sb-fixture-info">
                                            <span className="sb-fixture-time">{fixture.time}</span>
                                            <span className="sb-fixture-teams">{fixture.home} vs {fixture.away}</span>
                                            <span className="sb-fixture-location">{fixture.location ?? 'Field TBD'}</span>
                                        </div>
                                        {!inCart && !getLocation(fixture) && (
                                            <span className="field-hint">Select a field to enable</span>
                                        )}

                                        {(fixture.needsFieldReview || !fixture.location) && (
                                            <select
                                                value={fieldOverrides[fixture.id] ?? ''}
                                                aria-label={`Set field location for ${fixture.home} vs ${fixture.away}`} // Correct attribute
                                                onChange={(e) => setFieldOverrides(prev => ({
                                                    ...prev,
                                                    [fixture.id]: e.target.value
                                                }))}
                                            >
                                                <option value="">Set field</option>
                                                {KNOWN_FIELDS.map(field => (
                                                    <option key={field} value={field}>{field}</option>
                                                ))}
                                            </select>
                                        )}

                                        <button
                                            className={`sb-cart-btn${inCart ? ' remove' : ' add'}`}
                                            onClick={() => inCart ? removeFromCart(fixture.id) : handleAdd(fixture)}
                                            disabled={!inCart && !getLocation(fixture)}
                                        >
                                            {inCart ? 'Remove' : '+ Add'}
                                        </button>
                                    </div>
                                )
                            })

                        )
                    }
                </section>
            )}

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



                <div>
                    <button className="find-games-btn" onClick={handleFindMyGames} disabled={loadingAll}>
                        {loadingAll ? 'Finding games...' : 'Find My Games'}
                    </button>
                </div>
            </section>
            {/* --------------------- Load the fixtures for Smart game selection --------------------- */}
            {
                loadingAll ? (
                    <p className="shift-builder-loading">Loading all fixtures...</p>
                ) : (

                    <section className="shift-builder-fixtures">
                        {
                            smartResults.length === 0 ? (
                                <p className="shift-builder-empty">No fixtures found for this date.</p>
                            ) : (
                                smartResults.map((fixture) => {
                                    const inCart = isInCart(fixture.id)
                                    return (
                                        <div key={fixture.id} className={`sb-fixture-row${inCart ? ' in-cart' : ''}`}>
                                            <div className="sb-fixture-info">
                                                <span className="sb-fixture-time">{fixture.time}</span>
                                                <span className="sb-fixture-teams">{fixture.home} vs {fixture.away}</span>
                                                <span className="sb-fixture-location">{fixture.location ?? 'Field TBD'}</span>
                                            </div>
                                            {!inCart && !getLocation(fixture) && (
                                                <span className="field-hint">Select a field to enable</span>
                                            )}

                                            {(fixture.needsFieldReview || !fixture.location) && (
                                                <select
                                                    value={fieldOverrides[fixture.id] ?? ''}
                                                    aria-label={`Set field location for ${fixture.home} vs ${fixture.away}`} // Correct attribute
                                                    onChange={(e) => setFieldOverrides(prev => ({
                                                        ...prev,
                                                        [fixture.id]: e.target.value
                                                    }))}
                                                >
                                                    <option value="">Set field</option>
                                                    {KNOWN_FIELDS.map(field => (
                                                        <option key={field} value={field}>{field}</option>
                                                    ))}
                                                </select>
                                            )}

                                            <button
                                                className={`sb-cart-btn${inCart ? ' remove' : ' add'}`}
                                                onClick={() => inCart ? removeFromCart(fixture.id) : handleAdd(fixture)}
                                                disabled={!inCart && !getLocation(fixture)}
                                            >
                                                {inCart ? 'Remove' : '+ Add'}
                                            </button>
                                        </div>
                                    )
                                })

                            )
                        }
                    </section>

                )
            }

        </main>
    );
}

export default ShiftBuilderPage
