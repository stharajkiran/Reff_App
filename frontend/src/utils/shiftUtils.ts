import type {
  CompletedFixture,
  CompletedShift,
  GameResult,
  ParsedFixture,
} from "../types";

import { Settings } from "../types";
import { formatShiftDate } from "./dateUtils";

export function buildCompletedShift(
  fixtures: ParsedFixture[],
  getResult: (id: string) => GameResult | null,
  shiftDate: string | null,
): CompletedShift {
  const completedGames: CompletedFixture[] = fixtures.map((fixture) => {
    const result = getResult(fixture.id);
    return {
      ...fixture,
      homeScore: result?.homeScore ?? 0,
      awayScore: result?.awayScore ?? 0,
      status: result?.status ?? "not_started",
      incidents: result?.incidents ?? [],
    };
  });

  return {
    id: `shift-${Date.now()}`,
    date: shiftDate ?? new Date().toISOString(),
    completedAt: new Date().toISOString(),
    games: completedGames,
    reportSent: false,
    reportSentAt: null,
  };
}

export function formatShiftReport(completedShift: CompletedShift): string {
  const reportLines: string[] = [];

  // 1. Group by league using a Record
  const gamesByLeague: Record<string, CompletedFixture[]> = {};

  completedShift.games.forEach((game) => {
    const league = game.leagueName || "Unknown League";
    if (!gamesByLeague[league]) {
      gamesByLeague[league] = [];
    }
    gamesByLeague[league].push(game);
  });

  // 2. Format the report
  // Object.entries gives us [key, value] pairs to iterate over
  Object.entries(gamesByLeague).forEach(([leagueName, games]) => {
    reportLines.push("--".repeat(20)); // Blank line after league header
    reportLines.push(`== ${leagueName} ==`);
    reportLines.push("--".repeat(20)); // Blank line after league header

    games.forEach((game) => {
      reportLines.push(
        `${game.time} — ${game.home}: ${game.homeScore} vs ${game.away}: ${game.awayScore}`,
      );

      if (game.incidents && game.incidents.length > 0) {
        reportLines.push("-----Incidents-----");

        game.incidents.forEach((incident) => {
          const type = incident.type.replace(/_/g, " ").toUpperCase(); // Mimicking title()
          const playerName = incident.name
            ? ` || Player Name: ${incident.name}`
            : "";

          reportLines.push(
            `Type: ${type} || Team Name: ${incident.team}${playerName}`,
          );

          if (incident.description) {
            reportLines.push(` Details: ${incident.description}`);
          }
          // add a newline after each incident for readability
          reportLines.push("");
        });
      }
      // Add an extra newline between games
      reportLines.push("");
    });
  });

  return reportLines.join("\n");
}

export function buildMailtoLink(
  shift: CompletedShift,
  settings: Settings,
): string {
  // 1. Format the Date
  const formatted_date = formatShiftDate(shift.date);
  // 2. Format the Field Name
  const firstGame = shift.games[0];
  const fieldName = firstGame?.location ? ` @ ${firstGame.location}` : "";

  let _subject = `${formatted_date}-${fieldName}`;

  // 3. Format the League Names (using a Set for uniqueness)
  const leagueNames = Array.from(new Set(shift.games.map((g) => g.leagueName)));
  if (leagueNames.length > 0) {
    const leaguesString = leagueNames.map((name) => `(${name})`).join("-");
    _subject += ` - ${leaguesString}`;
  }

  const subject = encodeURIComponent(_subject);
  const body = encodeURIComponent(formatShiftReport(shift));
  const cc = settings.ccEmail ? `&cc=${settings.ccEmail}` : "";
  return `mailto:${settings.recipientEmail}?subject=${subject}${cc}&body=${body}`;
}
