from pydantic import BaseModel
from typing import Optional

class ParsedFixture(BaseModel):
    id: str
    date:str
    time: str
    home: str
    away: str
    location: Optional[str] = None
    needsFieldReview: bool