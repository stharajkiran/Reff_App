// type FixtureViewItem = {
//   id: string
//   time: string
//   home: string
//   away: string
//   location: string | null
//   needsFieldReview: boolean
// }
import { League, ParsedFixture } from "../types";

type FixturesPageViewProps = {
  leagues: League[];
  selectedLeague: string;
  fixtures: ParsedFixture[];
  selectedIds: string[];
  selectedCount: number;
  canContinue: boolean;
  knownFields: string[];
  bulkFieldValue: string;
  loadingFixtures: boolean;
  error: string | null;
  onLeagueChange: (leagueId: string) => void;
  onToggleFixtureSelection: (fixtureId: string) => void;
  onBulkFieldValueChange: (value: string) => void;
  onBulkFieldApply: () => void;
  onContinue: () => void;
};

function FixturesPageView({
  leagues,
  selectedLeague,
  fixtures,
  selectedIds,
  selectedCount,
  canContinue,
  knownFields,
  bulkFieldValue,
  loadingFixtures,
  error,
  onLeagueChange,
  onToggleFixtureSelection,
  onBulkFieldValueChange,
  onBulkFieldApply,
  onContinue,
}: FixturesPageViewProps) {
  return (
    <main className="fixtures-page">
      <h1>Referee Score Tracker</h1>
      {/* Create dropdown for leagues */}
      {/* <label htmlFor="leagueSelect">Select League</label> */}
      <select
        id="leagueSelect"
        aria-label="League Selection" // This satisfies the linter
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

      {/* Loading fixtures or no fixtures message */}
      {loadingFixtures ? (
        <p className="fixtures-muted">Loading fixtures...</p>
      ) : fixtures.length === 0 ? (
        <p className="fixtures-muted">No fixtures parsed yet.</p>
      ) : (
        <h2>Parsed Fixtures</h2>
      )}

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

        {fixtures.length === 0 ? (
          <p className="fixtures-muted">No fixtures parsed yet.</p>
        ) : (
          <ul className="fixtures-list">
            {fixtures.map((fixture) => {
              const isSelected = selectedIds.includes(fixture.id);

              return (
                <li key={fixture.id}>
                  <button
                    type="button"
                    className={`fixture-item ${isSelected ? "selected" : ""}`}
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
                      <span className="fixture-review-tag">Review field</span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        <button
          type="button"
          className="fixtures-button continue"
          disabled={!canContinue}
          onClick={onContinue}
        >
          Continue to Shift
        </button>
        {!canContinue && fixtures.length > 0 && (
          <p className="fixtures-muted">
            Select at least 1 game to continue.
          </p>
        )}
      </section>
    </main>
  );
}

export default FixturesPageView;
