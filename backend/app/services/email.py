from app.models import CompletedShift

from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from app.config import SENDGRID_API_KEY, SENDER_EMAIL, RECIPIENT_EMAIL
from sendgrid.helpers.mail import Cc

from datetime import datetime


def format_shift_report(completed_shift: CompletedShift) -> str:
    report = ""

    # Group by league
    games_by_league: dict[str, list] = {}
    for game in completed_shift.games:
        league = game.leagueName or "Unknown League"
        if league not in games_by_league:
            games_by_league[league] = []
        games_by_league[league].append(game)

    # Format the report with league headers and game details
    for league_name, games in games_by_league.items():
        # Add league name
        report += f"== {league_name} ==\n"
        for game in games:
            report += f"{game.time} — {game.home} - {game.homeScore} vs {game.away} - {game.awayScore}\n"
            # report += f"Field: {game.location or 'Not set'}\n"
            # if game.status == "final":
            # report += f"Score: {game.homeScore} - {game.awayScore}\n"
            if game.incidents:
                report += "**Incidents:**\n"
                for incident in game.incidents:
                    report += f"Type: {incident.type.replace('_', ' ').title()}  || Team Name: {incident.team} {f'|| Player Name: {incident.name}' if incident.name else ''}"
                    if incident.description:
                        report += f"\n Details: {incident.description}"
                    report += "\n"
                report += "\n"
            else:
                report += ""
            report += "\n"

    return report


def send_shift_report(completed_shift: CompletedShift) -> bool:
    try:
        # Format the date for the email subject
        dt_object = datetime.strptime(completed_shift.date.title(), "%Y-%B-%d")
        formatted_date = dt_object.strftime("%A-%B-%d-%Y")

        # fromat the field name
        field = (
            f"@ {completed_shift.games[0].location}" if completed_shift.games else ""
        )
        subject = f"{formatted_date}-{field}"

        # format the league names
        league_names = set(game.leagueName for game in completed_shift.games)
        if league_names:
            # (league 1)-(league 2) format if multiple leagues, otherwise just league name
            for league_name in league_names:
                subject += f" ({league_name})"

        # format the email body
        body = format_shift_report(completed_shift)

        message = Mail(
            from_email=SENDER_EMAIL,
            to_emails=RECIPIENT_EMAIL,
            subject=subject,
            plain_text_content=body,
        )
        sg = SendGridAPIClient(SENDGRID_API_KEY)
        response = sg.send(message)
        return response.status_code == 202
    except Exception as e:
        print(f"Error sending shift report: {e}")
        return False
