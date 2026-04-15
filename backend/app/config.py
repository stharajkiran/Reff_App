import os
from dotenv import load_dotenv

load_dotenv()

SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY")
SENDER_EMAIL = os.getenv("SENDER_EMAIL")
RECIPIENT_EMAIL = os.getenv("RECIPIENT_EMAIL")


LEAGUE_URLS = {
    "sunday-coed-division-3": {
        "name": "Sunday Coed Division 3",
        "url": "https://crescentcitysoccer.com/leagues/coed-division-3-sunday/",
    },
    "sunday-coed-division-4": {
        "name": "Sunday Coed Division 4",
        "url": "https://crescentcitysoccer.com/leagues/coed-division-4-sunday/",
    },
    "monday-division-2": {
        "name": "Monday Division 2",
        "url": "https://crescentcitysoccer.com/leagues/monday/",
    },
    "tuesday-coed": {
        "name": "Tuesday Coed",
        "url": "https://crescentcitysoccer.com/leagues/coed-tuesday/",
    },
    "tuesday-division-1": {
        "name": "Tuesday Division 1",
        "url": "https://crescentcitysoccer.com/leagues/tuesday/",
    },
    "wednesday-division-3": {
        "name": "Wednesday Division 3",
        "url": "https://crescentcitysoccer.com/leagues/wednesday/",
    },
    "thursday-coed-over-30": {
        "name": "Thursday Coed Over 30",
        "url": "https://crescentcitysoccer.com/leagues/coed-over-30-thursday/",
    },
    "friday-over-40": {
        "name": "Friday Over 40",
        "url": "https://crescentcitysoccer.com/leagues/over-40-friday/",
    },
    "saturday-division-3": {
        "name": "Saturday Division 3",
        "url": "https://crescentcitysoccer.com/leagues/division-3-saturday/",
    },
}

LEAGUE_FIELDS = {
  "Sunday Coed Division 3": {
    "location": "Green",
  },
  "Sunday Coed Division 4": {
    "location": "Green",
  },
  "Monday Division 2": {
    "location": "Green",
  },
  "Tuesday Coed": {
    "location": "Wheatley",
  },
  "Tuesday Division 1": {
    "location": "Green",
  },

  "Wednesday Division 3": {
    "location": "Green",
  },
  "Friday Over 40": {
    "location": "Green",
  },

  "Saturday Division 3": {
    "location": "Green",
  },
}


KNOWN_FIELDS = ["Green", "Wheatley"]
