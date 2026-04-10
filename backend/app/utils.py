from datetime import datetime


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