import asyncio
from datetime import datetime
from pprint import pprint
from fastapi import APIRouter, HTTPException

from app.utils import is_upcoming, process_fixture
from app.config import LEAGUE_FIELDS, LEAGUE_URLS
from app.services.parser import get_parsed_fixtures


router = APIRouter()


@router.get("/leagues")
def get_leagues():
    # returns list of {"id": key, "name": value["name"]}
    return [{"id": key, "name": value["name"]} for key, value in LEAGUE_URLS.items()]


@router.get("/fixtures")
async def get_fixtures(leagueId: str):
    # look up URL from LEAGUE_URLS in config
    league_entry = LEAGUE_URLS.get(leagueId)
    if not league_entry:
        raise HTTPException(status_code=404, detail="League not found")
    url = league_entry["url"]
    league_name = league_entry["name"]
    print(f"Fetching fixtures for {league_name} from {url}...")
    # call get_parsed_fixtures(url)
    try:
        clean_results, clean_results_list = await asyncio.wait_for(
            get_parsed_fixtures(url), timeout=25.0
        )
    except asyncio.TimeoutError:
        raise HTTPException(status_code=504, detail="Request timed out")

    now = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)

    # filter the results to only include upcoming games
    upcoming_games = [
        fix.model_copy(
            update={
                "leagueName": league_name,
                "location": (
                    fix.location
                    if fix.location
                    else LEAGUE_FIELDS.get(league_name, {}).get("location", "")
                ),
            }
        )
        for fix in clean_results_list
        # if is_upcoming(fix.date, now)
    ]


    # return the result
    return upcoming_games


