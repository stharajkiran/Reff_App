import asyncio
import re
from pprint import pprint
from app.services.scraper import fetch_fixture_lines

import re
from app.config import KNOWN_FIELDS, LEAGUE_FIELDS, LEAGUE_URLS
from app.models import ParsedFixture
from app.utils import get_smart_year


# Fetch raw fixture lines from the webpage
def split_by_date(raw_text: str) -> dict[str, str]:
    # 1. Regex to find dates: Month Name + Number + Suffix (th/st/nd/rd)
    # This matches "February 5th", "March 12th", etc.
    date_pattern = r"([A-Z][a-z]+\s+\d{1,2}\s*(?:st|nd|rd|th))"

    # 2. Split the text, keeping the dates in the list
    parts = re.split(date_pattern, raw_text)

    # After split: parts[0] is usually empty or junk header
    # parts[1] is "February 5th", parts[2] is the games for that day

    daily_schedule = {}

    for i in range(1, len(parts), 2):
        date_header = parts[i].strip()
        games_blob = parts[i + 1].strip() if i + 1 < len(parts) else ""

        # Store in a dictionary: { "February 19th": "6:00 Green... 7:00 Green..." }
        daily_schedule[date_header] = games_blob

    return daily_schedule


# convert the key (date and day) into a consistent format like "february19" for easier lookup later
def normalize_date_key(raw_date: str) -> str:
    # 1. Capture Month and Day, ignore the suffix/spaces
    # Pattern: Month + space + Day + optional space + suffix
    match = re.search(r"([A-Za-z]+)\s+(\d{1,2})\s*(?:st|nd|rd|th)?", raw_date)

    if match:
        month = match.group(1).lower()
        day = match.group(2)
        target_year = get_smart_year(month)
        return f"{target_year}-{month}-{day}"

    return raw_date.lower().replace(" ", "")


# Clean up the fixture line by removing parenthetical info and BYE WEEK details
def clean_fixture_line(text):
    # 1. Remove text in parentheses (e.g., '(Fall Championship)')
    text = re.sub(r"\s*\(.*?\)", "", text)

    # 2. Remove BYE WEEK info and everything after it
    text = re.sub(r"\s*bye\s*week:.*", "", text, flags=re.IGNORECASE)

    # 3. Clean up any trailing quotes or extra whitespace
    return text.strip(" '")


def parse_fixtures(line: str) -> ParsedFixture:

    # 1. Extract Time: Matches "6:00pm" or "6:00 am" at the start
    time_match = re.match(r"^(\d{1,2}:\d{2}\s*(?:[ap]m)?)\s+(.+)$", line, re.IGNORECASE)
    if not time_match:
        return

    kickoff_time = time_match.group(1).strip()
    remaining_text = time_match.group(2).strip()

    # 2. Split into Home and Away parts around " v " or " vs "
    sides = re.split(r"\s+v(?:s)?\s+", remaining_text, flags=re.IGNORECASE)
    if len(sides) < 2:
        return

    left_side, away_part = sides[0].strip(), sides[1].strip()

    # Default location from config if available
    location = None
    leagueName = ""
    home = left_side

    # 3. Detect Field from Known Values
    # We check if the left_side starts with a known field name
    for field in KNOWN_FIELDS:
        # Matches field name followed by a space and then the team name
        field_pattern = rf"^{field}\s+(.+)$"
        field_match = re.match(field_pattern, left_side, re.IGNORECASE)

        if field_match:
            location = field
            home = field_match.group(1).strip()
            break

    # 4. Construct the Object
    fixture_id = f"{home}-{away_part}".replace(" ", "-").lower()

    return ParsedFixture(
        id=fixture_id,
        date="",  # Date will be filled in later when we have the normalized date key
        time=kickoff_time,
        home=home,
        away=away_part,
        location=location,
        leagueName=leagueName,
        needsFieldReview=(location is None),
    )


# Split the games blob into individual games based on time patterns (e.g., "6:00", "7:15")
def get_individual_games(games_blob: str, normalized_date: str) -> list[ParsedFixture]:
    """
    -Returns list of Parsed fixtures where each element is a ParsedFixture object
    - The list is group of fixtures for that given date
    Args:
        games_blob (str): Group of games for that day
        normalized_date (str): Normalized date string for the fixtures (2025-10-10)

    Returns:
        list[ParsedFixture]: List of ParsedFixture objects for the given date
    """
    # Split by the time (e.g., 6:00, 7:15)
    time_pattern = r"(\d{1,2}:\d{2})"
    parts = re.split(time_pattern, games_blob)
    games = []
    # Iterate through each game blob, that means each group of games for that day
    for i in range(1, len(parts), 2):
        game_text = f"{parts[i]}{parts[i+1]}".strip()
        # if " v " in game_text.lower() or " vs " in game_text.lower():
        game_text = clean_fixture_line(game_text)
        # convert the list into ParsedFixture
        parsed_fixtures = parse_fixtures(game_text)
        if parsed_fixtures:
            parsed_fixtures.id = f"{normalized_date}-{parsed_fixtures.id}"
            parsed_fixtures.date = normalized_date
            games.append(parsed_fixtures)
    return games


async def get_parsed_fixtures(
    url: str,
) -> tuple[dict[str, list[ParsedFixture]], list[ParsedFixture]]:
    # url = "https://crescentcitysoccer.com/leagues/coed-over-30-thursday/"
    # url = "https://crescentcitysoccer.com/leagues/coed-division-4-sunday/"
    # url = "https://crescentcitysoccer.com/leagues/division-3-saturday/"
    # url = "https://crescentcitysoccer.com/leagues/coed-division-3-sunday/"
    # url = "https://crescentcitysoccer.com/leagues/over-40-friday/"

    # 1. Fetch the raw fixture lines from the webpage
    results = await fetch_fixture_lines(url)

    # dictionary with keys like "February 19th" and values like "6:00 Green v Wheatley 7:15 Green v Wheatley"
    results = split_by_date("\n".join(results))

    # 2. Normalize the date keys and split the games into individual entries
    clean_results = {}
    clean_results_list = []
    for date, blob in results.items():
        # like 2026-february-19, which is easier to work with for lookups later on
        normalized_date = normalize_date_key(date)
        # list of ParsedFixture objects for that date
        games = get_individual_games(blob, normalized_date)
        if games:  # This skips any dates that have 0 games
            clean_results[normalized_date] = games
            clean_results_list.extend(games)

    return clean_results, clean_results_list


if __name__ == "__main__":
    print("Starting scraper...")
    url = "https://crescentcitysoccer.com/leagues/over-40-friday/"
    league_name = "Over 40 Friday"
    # Capture the return value here
    clean_results, clean_results_list = asyncio.run(
        get_parsed_fixtures(url, league_name)
    )

    # Now you can use clean_results outside of the async functions
    pprint(clean_results, sort_dicts=False)
