import { useState, useEffect } from "react";
import { fetchLeagues, fetchFixtures } from "../services/api";
import { League, ParsedFixture } from "../types";

export const useFixtures = () => {
  // 1. Declare your states here...
  // --- MEMORY (State) ---
  const [leagues, setLeagues] = useState<League[]>([]);
  const [fixtures, setFixtures] = useState<ParsedFixture[]>([]);
  const [loadingLeagues, setLoadingLeagues] = useState<boolean>(true);
  const [loadingFixtures, setLoadingFixtures] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 2. Write the useEffect for initial league loading...
  // --- AUTOMATIC LOGIC ---
  useEffect(() => {
    async function loadLeagues() {
      try {
        const data = await fetchLeagues();
        setLeagues(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoadingLeagues(false);
      }
    }
    loadLeagues();
  }, []);

  // 3. Define the fetchFixturesForLeague function...
  // --- MANUAL LOGIC (The "Tool") ---
  const fetchFixturesForLeague = async (leagueId: string) => {
    if (!leagueId) return;

    setLoadingFixtures(true);
    try {
      const data = await fetchFixtures(leagueId);
      setFixtures(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoadingFixtures(false);
    }
  };

  // 4. Return the pieces the component needs...
  // --- THE CONTROL PANEL ---
  // We return the state AND the manual function
  return {
    leagues,
    fixtures,
    loadingLeagues,
    loadingFixtures,
    error,
    fetchFixturesForLeague,
  };
};
