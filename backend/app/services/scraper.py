import httpx
from bs4 import BeautifulSoup
import re


async def fetch_fixture_lines(url: str) -> list[str]:
    """Fetches the fixture lines from the given URL."""
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        # Ensure we handle potential request errors
        response.raise_for_status()
    soup = BeautifulSoup(response.text, "html.parser")

    blocks = []
    for p in soup.find_all("p"):
        # 2. Flatten all internal spans into one string
        line = p.get_text(separator=" ", strip=True)

        # 3. Clean up extra spaces caused by the separator
        line = " ".join(line.split())

        # 4. Now run your fixture and date checks
        if " v " in line.lower() or ":" in line or re.search(r"\d+(st|nd|rd|th)", line.lower()):
            blocks.append(line)

    return blocks

