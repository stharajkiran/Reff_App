import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FixturesPageView from '../views/FixturesPageView'
import { parseFixtures } from '../services/FixtureParser'
import KNOWN_FIELDS from '../config'
import { ParsedFixture } from '../types'


function FixturesPage() {
  const navigate = useNavigate()

  // fixtureText: raw paste input from textarea.
  // Pre-filled with sample data for development — clear before production.
  const [fixtureText, setFixtureText] = useState('April 11th\n3:00pm  Juniors FC v Rougaroux FC\n4:00pm  Plumbers FC v Azul United\n5:00pm  Razz FC v Faubourg FC\n6:00pm  Los Jefes FC v Napoli FC\n7:00pm  Pelican FC v Real Federacion')
  // fixtures: parsed fixtures shown to user.
  const [fixtures, setFixtures] = useState<ParsedFixture[]>([])
  // selectedIds: which fixtures are currently selected for this shift.
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [bulkFieldValue, setBulkFieldValue] = useState<(typeof KNOWN_FIELDS)[number] | ''>(KNOWN_FIELDS[0])

  const selectedCount = selectedIds.length
  // Business rule: allow continuing when selection is between 1 and 4.
  const canContinue = selectedCount >= 1 

  // Derived data: map selected ids to full fixture objects for the next page.
  const selectedFixtures = useMemo(
    () => fixtures.filter((fixture) => selectedIds.includes(fixture.id)),
    [fixtures, selectedIds],
  )

  const handleParseFixtures = () => {
    // Re-parse current text and reset old selections to avoid stale state.
    const parsed = parseFixtures(fixtureText)
    setFixtures(parsed)
    setSelectedIds([])
    setBulkFieldValue(KNOWN_FIELDS[0])
  }

  const toggleFixtureSelection = (fixtureId: string) => {
    const alreadySelected = selectedIds.includes(fixtureId)

    // Click selected fixture again to unselect it.
    if (alreadySelected) {
      setSelectedIds((prev) => prev.filter((id) => id !== fixtureId))
      return
    }

    // Prevent selecting more than 4 fixtures.
    // if (selectedIds.length >= 4) {
    //   return
    // }

    setSelectedIds((prev) => [...prev, fixtureId])
  }

  const handleBulkFieldApply = () => {
    if (selectedIds.length === 0) {
      return
    }

    setFixtures((prev) =>
      prev.map((fixture) => {
        if (!selectedIds.includes(fixture.id)) {
          return fixture
        }

        return {
          ...fixture,
          location: bulkFieldValue || null,
          needsFieldReview: bulkFieldValue === '',
        }
      }),
    )
  }

  const handleBulkFieldValueChange = (value: string) => {
    if (value === '' || KNOWN_FIELDS.includes(value as (typeof KNOWN_FIELDS)[number])) {
      setBulkFieldValue(value as (typeof KNOWN_FIELDS)[number] | '')
    }
  }

  const handleContinue = () => {
    // Safety guard: do not navigate if selection rule is not satisfied.
    if (!canContinue) {
      return
    }

    // Send selected fixtures to Shift page through route state.
    navigate('/shift', {
      state: {
        selectedFixtures,
      },
    })
  }

  return (
    <FixturesPageView
      fixtureText={fixtureText}
      fixtures={fixtures}
      selectedIds={selectedIds}
      selectedCount={selectedCount}
      canContinue={canContinue}
      knownFields={[...KNOWN_FIELDS]}
      bulkFieldValue={bulkFieldValue}
      onFixtureTextChange={setFixtureText}
      onParseFixtures={handleParseFixtures}
      onToggleFixtureSelection={toggleFixtureSelection}
      onBulkFieldValueChange={handleBulkFieldValueChange}
      onBulkFieldApply={handleBulkFieldApply}
      onContinue={handleContinue}
    />
  )
}

export default FixturesPage