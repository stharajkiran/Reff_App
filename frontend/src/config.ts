const KNOWN_FIELDS = ['Green', 'Wheatley'] as const
export default KNOWN_FIELDS

// League rules — defaults applied to every new game.
export const HALF_DURATION_MINUTES = 0.05
export const BREAK_DURATION_SECONDS = 2  // 2.5 minutes

export const STORAGE_KEY = 'shiftFixtures'
export const SHIFT_KEY = 'activeShift'