import { CompletedShift, League, ParsedFixture } from "../types";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function fetchLeagues(): Promise<League[]>{
  const response = await fetch(`${BASE_URL}/api/leagues`);
  if (!response.ok) {
    throw new Error("Failed to fetch leagues");
  }
  return response.json() as Promise<League[]>;
}

export async function fetchFixtures(leagueId: string): Promise<ParsedFixture[]>{
  const response = await fetch(`${BASE_URL}/api/fixtures?leagueId=${leagueId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch fixtures");
  }
  return response.json() as Promise<ParsedFixture[]>;
}

export async function sendReport(shift: CompletedShift): Promise<{ success: boolean }> {
  const response = await fetch(`${BASE_URL}/api/report`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(shift),
  });

  if (!response.ok) {
    throw new Error("Failed to send report");
  }

  return response.json() as Promise<{ success: boolean }>;
}