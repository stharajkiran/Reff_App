import asyncio
from datetime import datetime
from pprint import pprint
from fastapi import APIRouter, HTTPException

from app.utils import is_upcoming
from app.config import LEAGUE_URLS
from app.services.parser import get_parsed_fixtures


router = APIRouter()

@router.get("/leagues")
def get_leagues():
    # returns list of {"id": key, "name": value["name"]}
    return [{"id": key, "name": value["name"]} for key, value in LEAGUE_URLS.items()]


@router.get("/fixtures")
async def get_fixtures(league: str):
    # look up URL from LEAGUE_URLS in config
    league_entry = LEAGUE_URLS.get(league)
    if not league_entry:
        raise HTTPException(status_code=404, detail="League not found")
    url = league_entry["url"]
    # call get_parsed_fixtures(url)
    clean_results, clean_results_list = await get_parsed_fixtures(url)

    now = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)

    # filter the results to only include upcoming games
    upcoming_games = [fix for fix in clean_results_list if is_upcoming(fix.date, now)]

    # Filter the results to only include upcoming games
    # upcoming_games = {date: games for date, games in clean_results.items() if is_upcoming(date, now)}

    # return the result
    return upcoming_games


if __name__ == "__main__":
    games = asyncio.run(get_fixtures("over-40-friday"))
    for game in games:
        print(game)
