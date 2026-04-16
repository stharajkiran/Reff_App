const KNOWN_FIELDS = ["Green", "Wheatley"] as const;
export default KNOWN_FIELDS;

// League rules — defaults applied to every new game.
// export const HALF_DURATION_MINUTES = 0.05;
// export const BREAK_DURATION_SECONDS = 2; // 2.5 minutes

export const STORAGE_KEY = "shiftFixtures";
export const SHIFT_KEY = "activeShift";

export const LEAGUE_FIELDS = {
  "Sunday Coed Division 3": {
    location: "Green",
  },
  "Sunday Coed Division 4": {
    location: "Green",
  },
  "Monday Division 2": {
    location: "Green",
  },
  "Tuesday Coed": {
    location: "Wheatley",
  },
  "Tuesday Division 1": {
    location: "Green",
  },

  "Wednesday Division 3": {
    location: "Green",
  },
  "Friday Over 40": {
    location: "Green",
  },

  "Saturday Division 3": {
    location: "Green",
  },
};
