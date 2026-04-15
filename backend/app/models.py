from pydantic import BaseModel
from typing import Optional

from enum import Enum


class ParsedFixture(BaseModel):
    id: str
    date: str
    time: str
    home: str
    away: str
    location: Optional[str] = None
    leagueName: str
    needsFieldReview: bool


# Game status
class GameStatus(str, Enum):
    NOT_STARTED = "not_started"
    FIRST_HALF = "first_half"
    HALF_TIME = "half_time"
    SECOND_HALF = "second_half"
    FINAL = "final"


# Incident
class Incident(BaseModel):
    id: str
    type: str
    description: Optional[str] = None
    team: str
    name: Optional[str] = None


class CompletedFixture(ParsedFixture):
    status: GameStatus
    homeScore: int
    awayScore: int
    incidents: Optional[list[Incident]] = []


class CompletedShift(BaseModel):
    id: str
    date: str
    completedAt: str
    games: list[CompletedFixture]
    reportSent: bool
    reportSentAt: Optional[str] = None
