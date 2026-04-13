import type { CompletedFixture, CompletedShift, GameResult, ParsedFixture } from "../types";


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


