import { formatShiftReport } from "../utils/shiftUtils";
import { CompletedShift, CompletedFixture, Incident } from "../types";

// const testShift: CompletedShift = {
//   id: 'shift-1',
//   date: '2026-april-17',
//   completedAt: new Date().toISOString(),
//   reportSent: false,
//   reportSentAt: null,
//   games: [
//     {
//       id: 'game-1',
//       date: '2026-april-17',
//       time: '6:00pm',
//       home: '504 Squad',
//       away: 'Carefree FC',
//       location: 'Green',
//       leagueName: 'Thursday Coed Over 30',
//       needsFieldReview: false,
//       homeScore: 2,
//       awayScore: 1,
//       status: 'final',
//       incidents: [
//         { id: 'i1', team: '504 Squad', type: 'red_card', name: 'John Doe', description: 'Violent conduct' }
//       ]
//     }
//   ]
// }

const testShift: CompletedShift = {
  id: `shift_${Date.now()}`,
  date: "2026-04-14",
  completedAt: new Date().toISOString(),
  reportSent: false,
  reportSentAt: null,
  games: [
    {
      id: "fixture_771",
      date: "2026-04-14",
      time: "18:30",
      home: "NOLA Pelicans FC",
      away: "Crescent City Blues",
      location: "Lafreniere Park - Field 2",
      needsFieldReview: false,
      leagueName: "Coed Over 30 Thursday",
      status: "final",
      homeScore: 3,
      awayScore: 1,
      incidents: [
        {
          id: "inc_991",
          type: "yellow_card",
          description: "Persistent infringement - repeated late tackles",
          team: "NOLA Pelicans FC",
          name: "B. Simpson",
        },
        {
          id: "inc_992",
          type: "red_card", // Testing 2-minute penalty/soft card
          description: "Dissent towards official",
          team: "Crescent City Blues",
          name: "L. Miller",
        },
      ],
    },
    {
      id: "fixture_772",
      date: "2026-04-14",
      time: "19:45",
      home: "Mid-City United",
      away: "Garden District Grays",
      location: "", // Edge case: Missing location (triggers your <select> logic)
      needsFieldReview: true,
      leagueName: "Coed Over 30 Thursday", // Same league to verify grouping
      status: "final",
      homeScore: 2,
      awayScore: 2,
      incidents: [], // Edge case: Clean game
    },
    {
      id: "fixture_805",
      date: "2026-04-14",
      time: "21:00",
      home: "Bayou Bombers",
      away: "Pontchartrain Pirates",
      location: "Pan American Stadium",
      needsFieldReview: false,
      leagueName: "Men's Premier Division", // Different league to test UI headers
      status: "final",
      homeScore: 0,
      awayScore: 4,
      incidents: [
        {
          id: "inc_995",
          type: "red_card",
          description: "SFO - Spitting at opponent",
          team: "Bayou Bombers",
          name: "Unknown Player #14", // Edge case: Partial data
        },
      ],
    },
  ],
};

console.log(formatShiftReport(testShift));
