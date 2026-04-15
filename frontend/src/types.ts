// ParsedFixture is the normalized shape the UI uses after converting raw pasted text.
export type ParsedFixture = {
  id: string
  date: string
  time: string
  home: string
  away: string
  location: string | null
  leagueName : string
  needsFieldReview: boolean
}

// The order is: not_started → first_half → half_time → second_half → final
export type GameStatus =
  | 'not_started'
  | 'first_half'
  | 'half_time'
  | 'second_half'
  | 'final'

  // GameResult is the durable record for one game across the entire shift.
// Timer design: we store WHEN each phase started (Unix ms timestamp), not
// how many seconds have elapsed. This way, elapsed time can always be
// reconstructed as (Date.now() - startedAt), even after an app kill.
export type GameResult = {
  fixtureId: string
  homeScore: number
  awayScore: number
  status: GameStatus
  // Wall-clock timestamps — null means that phase hasn't started yet.
  firstHalfStartedAt: number | null
  halfTimeStartedAt: number | null
  secondHalfStartedAt: number | null
  // Configurable per game before kick-off.
  halfDurationMinutes: number
  breakDurationSeconds: number
  // Populated during or after the game.
  incidents: Incident[]
}



// An incident is anything worth reporting: red cards, injuries, disputes.
export type Incident = {
  id: string
  team: string
  type: 'red_card' | 'yellow_card' | 'injury' | 'other'
  description: string
  name: string
}


// League is the shape of each league object returned by the backend /api/leagues route.
export interface League {
  id: string;
  name: string;
}

// Shift builder phase
export type ActiveShift = {
  date: string
  games: ParsedFixture[]  // with live scores
}

export type CompletedShift = {
  id: string
  date: string
  completedAt: string
  games: CompletedFixture[]
  reportSent: boolean
  reportSentAt: string | null
}

export type CompletedFixture = ParsedFixture & {
  homeScore: number
  awayScore: number
  status: GameStatus
  incidents: Incident[]
}



export type Settings = {
  recipientEmail: string;
  senderName: string;
  ccEmail: string; // optional field
};