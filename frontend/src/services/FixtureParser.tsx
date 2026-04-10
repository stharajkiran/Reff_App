import { ParsedFixture } from "../types"
import KNOWN_FIELDS from '../config'


// Convert pasted multiline text into structured fixtures.
// Strategy: clean lines -> extract time -> split teams -> detect field from known values only.
function parseFixtures(rawText: string): ParsedFixture[] {
  // Remove blank lines and trim each line so parsing stays deterministic.
  const lines = rawText
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  return lines
    .map((line, index) => {
      // Reliable first step: extract the kickoff time from the start of the line.
      const timeMatch = line.match(/^(\d{1,2}:\d{2}\s*[ap]m)\s+(.+)$/i)
      if (!timeMatch) {
        return null
      }

      // Split around "v" or "vs" to separate home side from away side.
      const [leftSide, awayPart] = timeMatch[2].split(/\s+v(?:s)?\s+/i)
      if (!leftSide || !awayPart) {
        return null
      }

      let location: string | null = null
      let home = leftSide.trim()

      // Only detect a field when it matches a known field name at the start.
      // This avoids incorrectly treating team names like "Green FC" as a field.
      for (const fieldName of KNOWN_FIELDS) {
        const fieldPattern = new RegExp(`^${fieldName}(?:\\s{2,}|\\t+)(.+)$`, 'i')
        const fieldMatch = leftSide.match(fieldPattern)

        if (fieldMatch) {
          location = fieldName
          home = fieldMatch[1].trim()
          break
        }
      }

      if (!home) {
        return null
      }

      const normalizedAway = awayPart.trim()

      return {
        id: `${index}-${timeMatch[1]}-${home}-${normalizedAway}`,
        time: timeMatch[1].trim(),
        home,
        away: normalizedAway,
        location,
        needsFieldReview: location === null,
      }
    })
    // Type guard: remove nulls and tell TypeScript this is now ParsedFixture[].
    .filter((fixture): fixture is ParsedFixture => fixture !== null)
}


export { parseFixtures, KNOWN_FIELDS }