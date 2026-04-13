
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFixtures } from '../hooks/useFixtures';
import { useShiftCart } from '../hooks/useShiftCart';
// import FixtureCard from '../components/FixtureCard';

const formatDateToFixture = (isoDate: string): string => {
    const [year, month, day] = isoDate.split('-')
    const monthName = new Date(isoDate).toLocaleString('en-US', { month: 'long' }).toLowerCase()
    const dayNum = parseInt(day).toString() // removes leading zero
    return `${year}-${monthName}-${dayNum}`
}
export function ShiftBuilderPage() {
    const navigate = useNavigate();

    // 1. Hook into your Logic Layers
    const { leagues, apiFixtures: fixtures, loadingFixtures, fetchFixturesForLeague } = useFixtures();
    const { cartFixtures, addToCart, removeFromCart, isInCart } = useShiftCart();

    // 2. Local UI State
    const [selectedLeague, setSelectedLeague] = useState("");
    const today = new Date()
    const localDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    const [selectedDate, setSelectedDate] = useState(localDate)

    // 3. Handlers
    const handleLeagueChange = (leagueId: string) => {
        setSelectedLeague(leagueId);
        if (leagueId) fetchFixturesForLeague(leagueId);
    };


    const filteredFixtures = fixtures.filter(fixture => fixture.date === formatDateToFixture(selectedDate));

    console.log('cartFixtures:', cartFixtures)

    return (
        <div className="shift-builder">
            {/* League dropdown */}
            <select
                id="leagueSelect"
                aria-label="League Selection" // This satisfies the linter
                value={selectedLeague}
                onChange={(e) => handleLeagueChange(e.target.value)}
            >
                <option value="">Select League</option>
                {leagues.map((league) => (
                    <option key={league.id} value={league.id}>
                        {league.name}
                    </option>
                ))}
            </select>

            {/* - Date picker defaulting to today */}
            <input
                type="date"
                aria-label="Date Picker"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
            />

            {/* - Filtered fixtures list
            each row: time, home vs away, location, Add/Remove button */}
            {loadingFixtures ? (
                <p>Loading fixtures...</p>
            ) : (
                <div className="fixtures-list">
                    {filteredFixtures.length === 0 ? (
                        <p>No fixtures found for this date.</p>
                    ) : (
                        filteredFixtures.map((fixture) => (
                            <div key={fixture.id} className="fixture-row">
                                <span>{fixture.time}</span>
                                <span>{fixture.home} vs {fixture.away}</span>
                                <span>{fixture.location}</span>
                                <button className='fixtures-button bulk-apply' onClick={() => isInCart(fixture.id) ? removeFromCart(fixture.id) : addToCart(fixture)}>
                                    {isInCart(fixture.id) ? 'Remove' : 'Add'}
                                </button>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

export default ShiftBuilderPage
