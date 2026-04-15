// type FixtureViewItem = {
//   id: string
//   time: string
//   home: string
//   away: string
//   location: string | null
//   needsFieldReview: boolean
// }
import { League, ParsedFixture } from "../types";
import { formatShiftDate } from "../utils/dateUtils";

type FixturesPageViewProps = {
  leagues: League[];
  selectedLeague: string;
  fixtures: ParsedFixture[];
  selectedIds: string[];
  selectedCount: number;
  canContinue: boolean;
  allHaveLocations: boolean;
  knownFields: string[];
  bulkFieldValue: string;
  loadingFixtures: boolean;
  onLeagueChange: (leagueId: string) => void;
  onToggleFixtureSelection: (fixtureId: string) => void;
  onBulkFieldValueChange: (value: string) => void;
  onBulkFieldApply: () => void;
  onContinue: () => void;
  groupedFixtures: Record<string, ParsedFixture[]>;
};

function FixturesPageView({
  leagues,
  selectedLeague,
  fixtures,
  selectedIds,
  selectedCount,
  canContinue,
  allHaveLocations,
  knownFields,
  bulkFieldValue,
  loadingFixtures,
  onLeagueChange,
  onToggleFixtureSelection,
  onBulkFieldValueChange,
  onBulkFieldApply,
  onContinue,
  groupedFixtures,
}: FixturesPageViewProps) {
  return (
    <main className="fixtures-page">
      <div className="fixtures-page-header">
        <h1>Fixtures</h1>
        <p className="fixtures-subtitle">Select a league to load upcoming games</p>
      </div>

      <div className="fixtures-league-row">
        <label htmlFor="leagueSelect" className="fixtures-label">League</label>
        <select
          id="leagueSelect"
          className="fixtures-select"
          value={selectedLeague}
          onChange={(e) => onLeagueChange(e.target.value)}
        >
          <option value="">Select League</option>
          {leagues.map((league) => (
            <option key={league.id} value={league.id}>
              {league.name}
            </option>
          ))}
        </select>
      </div>

      {loadingFixtures ? (
        <p className="fixtures-muted">Loading fixtures...</p>
      ) : fixtures.length === 0 && selectedLeague ? (
        <p className="fixtures-muted">No upcoming fixtures for this league.</p>
      ) : null}

      <section className="fixtures-card">
        <div className="fixtures-row">
          {/* <h2>Parsed Fixtures</h2> */}
          <span className="fixtures-counter">
            Selected: {selectedCount}/{fixtures.length}
          </span>
        </div>


        {selectedCount > 0 && (
          <div className="fixtures-bulk-editor">
            <label htmlFor="bulkFieldSelect" className="fixtures-label compact">
              Apply Field To Selected Games
            </label>
            <div className="fixtures-bulk-row">
              <select
                id="bulkFieldSelect"
                className="fixtures-select"
                value={bulkFieldValue}
                onChange={(event) => onBulkFieldValueChange(event.target.value)}
              >
                {/* {<option value="">No field</option>} */}
                {knownFields.map((fieldName) => (
                  <option key={fieldName} value={fieldName}>
                    {fieldName}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="fixtures-button bulk-apply"
                onClick={onBulkFieldApply}
              >
                Apply Field
              </button>
            </div>
          </div>
        )}



        {Object.entries(groupedFixtures).map(([date, dateFixtures]) => (
          <div key={date} className="fixture-date-group">
            <h3 className="date-separator">{formatShiftDate(date)}</h3>
            <ul className="fixtures-list">
              {dateFixtures.map(fixture => (
                <li key={fixture.id}>
                  <button
                    type="button"
                    className={`fixture-item ${selectedIds.includes(fixture.id) ? "selected" : ""}`}
                    onClick={() => onToggleFixtureSelection(fixture.id)}
                  >
                    <span className="fixture-time">{fixture.time}</span>
                    <span className="fixture-teams">
                      {fixture.home} vs {fixture.away}
                    </span>
                    <span
                      className={`fixture-location ${fixture.needsFieldReview ? "needs-review" : ""}`}
                    >
                      {fixture.location ?? "Field not set"}
                    </span>
                    {fixture.needsFieldReview && (
                      <span className="fixture-review-tag">⚠ Review field</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {fixtures.length > 0 && (
          <div className="fixtures-continue-bar">
            {!allHaveLocations && (
              <p className="fixtures-muted">All selected games need a field assigned before continuing.</p>
            )}
            {!canContinue && (
              <p className="fixtures-muted">Select at least 1 game to continue.</p>
            )}
            <button
              type="button"
              className="fixtures-button continue"
              disabled={!canContinue || !allHaveLocations}
              onClick={onContinue}
            >
              Continue to Shift ({selectedCount} selected)
            </button>
          </div>
        )}

      </section>
    </main>
  );
}

export default FixturesPageView;
