import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import KNOWN_FIELDS from '../config'
import { ParsedFixture } from '../types'

import FixturesPageView from '../views/FixturesPageView'
import { useFixtures } from '../hooks/useFixtures'



function FixturesPage() {
  // Router hooks
  const navigate = useNavigate()

  // Custom hooks
  const { leagues, apiFixtures, loadingLeagues, loadingFixtures, error, fetchFixturesForLeague } = useFixtures()


  // useState
  const [fixtures, setFixtures] = useState<ParsedFixture[]>([])
  const [selectedLeague, setSelectedLeague] = useState<string>('')
  // selectedIds: which fixtures are currently selected for this shift.
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [bulkFieldValue, setBulkFieldValue] = useState<(typeof KNOWN_FIELDS)[number] | ''>(KNOWN_FIELDS[0])

  //useEffect

  // sync once when API data arrives
  useEffect(() => {
    if (apiFixtures.length > 0) {
      setFixtures(apiFixtures)
    }
  }, [apiFixtures])

  //useMemo / useCallback

  // Derived data: map selected ids to full fixture objects for the next page.
  const selectedFixtures = useMemo(
    () => fixtures.filter((fixture) => selectedIds.includes(fixture.id)),
    [fixtures, selectedIds],
  )

  // Handlers

  // Assign field location and review status in bulk for all selected fixtures.
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

  const handleLeagueChange = (leagueId: string) => {
    setSelectedLeague(leagueId)
    setSelectedIds([])
    fetchFixturesForLeague(leagueId)
  }

  const toggleFixtureSelection = (fixtureId: string) => {
    const alreadySelected = selectedIds.includes(fixtureId)
    // Click selected fixture again to unselect it.
    if (alreadySelected) {
      setSelectedIds((prev) => prev.filter((id) => id !== fixtureId))
      return
    }
    setSelectedIds((prev) => [...prev, fixtureId])
  }

  const selectedCount = selectedIds.length
  // Business rule: allow continuing when selection is between 1 and 4.
  const canContinue = selectedCount >= 1

  return (
    <FixturesPageView
      leagues={leagues}
      selectedLeague={selectedLeague}
      fixtures={fixtures}
      selectedIds={selectedIds}
      selectedCount={selectedCount}
      canContinue={canContinue}
      knownFields={[...KNOWN_FIELDS]}
      bulkFieldValue={bulkFieldValue}
      loadingFixtures={loadingFixtures}
      error={error}
      onLeagueChange={handleLeagueChange}
      onToggleFixtureSelection={toggleFixtureSelection}
      onBulkFieldValueChange={handleBulkFieldValueChange}
      onBulkFieldApply={handleBulkFieldApply}
      onContinue={handleContinue}
    />
  )
}

export default FixturesPage