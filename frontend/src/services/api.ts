import { League, ParsedFixture } from "../types";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function fetchLeagues(): Promise<League[]>{
  const response = await fetch(`${BASE_URL}/api/leagues`);
  if (!response.ok) {
    throw new Error("Failed to fetch leagues");
  }
  return response.json() as Promise<League[]>;
}

export async function fetchFixtures(leagueId: string): Promise<ParsedFixture[]>{
  const response = await fetch(`${BASE_URL}/api/fixtures?league=${leagueId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch fixtures");
  }
  return response.json() as Promise<ParsedFixture[]>;
}