import { ParsedFixture } from '../types';
import KNOWN_FIELDS from '../config';

type FixtureCartRowProps = {
    fixture: ParsedFixture
    inCart: boolean
    hasLocation: boolean
    fieldOverride: string | null          // just this fixture's override value
    onFieldChange: (value: string) => void  // a function that takes a string  onAdd: () => void
    onAdd: () => void
    onRemove: () => void
}


export function FixtureCartRow({
    fixture,
    inCart,
    hasLocation,
    fieldOverride,
    onFieldChange,
    onAdd,
    onRemove
}: FixtureCartRowProps) {

    return (

        <div className={`sb-fixture-row${inCart ? ' in-cart' : ''}`}>
            <div className="sb-fixture-info">
                <span className="sb-fixture-time">{fixture.time}</span>
                <span className="sb-fixture-teams">{fixture.home} vs {fixture.away}</span>
                <span className="sb-fixture-location">{fixture.location ?? 'Field TBD'}</span>
            </div>
            {!inCart && !hasLocation && (
                <span className="field-hint">Select a field to enable</span>
            )}

            {(fixture.needsFieldReview || !fixture.location) && (
                <select
                    value={fieldOverride ?? ''}
                    aria-label={`Set field location for ${fixture.home} vs ${fixture.away}`} // Correct attribute
                    onChange={(e) => onFieldChange(e.target.value)}

                >
                    <option value="">Set field</option>
                    {KNOWN_FIELDS.map(field => (
                        <option key={field} value={field}>{field}</option>
                    ))}
                </select>
            )}

            <button
                className={`sb-cart-btn${inCart ? ' remove' : ' add'}`}
                onClick={() => inCart ? onRemove() : onAdd()}
                disabled={!inCart && !hasLocation}
            >
                {inCart ? 'Remove' : '+ Add'}
            </button>
        </div>


    )

}

