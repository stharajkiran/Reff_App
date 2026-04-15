from datetime import datetime

from app.config import LEAGUE_FIELDS

def get_todays_games(clean_results: dict[str, list[str]]) -> list[str]:
    # Use this instead of print()
    # pprint(clean_results, sort_dicts=False)

    # Get the month name in lowercase
    month = datetime.now().strftime("%B").lower()
    # Get the day without the leading zero
    # In Python, .lstrip("0") is the safest way to remove that padding
    day = datetime.now().strftime("%d").lstrip("0")
    today_key = f"{month}{day}"
    # 2. Grab today's games from your clean dictionary
    todays_games = clean_results.get(today_key, [])

    return todays_games

def print_todays_games(clean_results: dict[str, list[str]]) -> None:
    todays_games = get_todays_games(clean_results)
    if not todays_games:
        print(f"No games scheduled for today . Enjoy the day off in NOLA!")
    else:
        print(f"Today's games:")
        for game in todays_games:
            print(f"- {game}")


def is_upcoming(date_str, current_limit):
    try:
        # Normalize: '2026-april-9' -> '2026-April-9'
        parts = date_str.split('-')
        parts[1] = parts[1].capitalize()
        clean_date = "-".join(parts)
        
        # Convert to datetime object
        dt = datetime.strptime(clean_date, "%Y-%B-%d")
        return dt >= current_limit
    except ValueError:
        return False
    

def get_smart_year(fixture_month_name: str) -> int:
    now = datetime.now()
    current_month = now.month
    current_year = now.year
    
    # Map month names to numbers
    months = {
        "january": 1, "february": 2, "march": 3, "april": 4,
        "may": 5, "june": 6, "july": 7, "august": 8,
        "september": 9, "october": 10, "november": 11, "december": 12
    }
    
    fixture_month_num = months.get(fixture_month_name.lower(), current_month)
    
    # If we are in the second half of the year (Oct-Dec) 
    # and the game is in the first half (Jan-Mar), it's next year.
    if current_month > 9 and fixture_month_num < 4:
        return current_year + 1
        
    return current_year

def process_fixture(fix, league_name):
    # 1. Start with a copy
    updated_fix = fix.model_copy(update={"leagueName": league_name})
    
    # 2. Apply your location logic
    if not updated_fix.location:
        updated_fix.location = LEAGUE_FIELDS.get(league_name)
        
    return updated_fix