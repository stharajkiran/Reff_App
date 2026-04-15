from fastapi import APIRouter

from app.models import CompletedFixture, CompletedShift, Incident
from app.services.email import send_shift_report


router = APIRouter()


@router.post("/report")
async def send_report(shift: CompletedShift):  # FastAPI converts here
    success = send_shift_report(shift)  # passes object to email service
    if success:
        return {"success": True}
    return {"success": False, "error": "Failed to send email. Please try again."}


if __name__ == "__main__":
    from app.services.email import send_shift_report

    shift = CompletedShift(
        id="shift1",
        date="2024-06-01",
        completedAt="2024-06-01T18:00:00Z",
        games=[
            CompletedFixture(
                id="game1",
                date="2024-06-01",
                time="18:00",
                home="Team A",
                away="Team B",
                location="Stadium 1",
                needsFieldReview=False,
                leagueName="Friday Over 40",
                status="final",
                homeScore=2,
                awayScore=1,
                incidents=[
                    Incident(
                        id="incident1",
                        type="Red Card",
                        description="Player received a red card",
                        team="Team A",
                        name="Player 1",
                    )
                ],
            )
        ],
        reportSent=False,
    )
    result = send_shift_report(shift)
    print(result)

    # games = asyncio.run(send_report())
    # for game in games:
    #     print(game)
