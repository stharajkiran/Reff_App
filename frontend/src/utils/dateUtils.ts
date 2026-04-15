// "2026-april-16" → "Wednesday, April 16, 2026"
export function formatShiftDate(date: string): string {
  const parsed = new Date(date);
  if (isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// "2026-04-16" → "2026-april-16" (for date input conversion)
export function formatDateToFixture(isoDate: string): string {
  const [year, month, day] = isoDate.split("-");
  const monthName = new Date(isoDate)
    .toLocaleString("en-US", { month: "long" })
    .toLowerCase();
  const dayNum = parseInt(day).toString();
  return `${year}-${monthName}-${dayNum}`;
}

export function normalizeTimeTo24h(time: string): number {
  const lower = time.toLowerCase();
  const [timePart, meridiem] = lower.split(/(am|pm)/).filter(Boolean);

  if (!meridiem) {
    const hours = parseInt(timePart.split(":")[0]);
    // if hour >= 12 it's already in 24h format
    if (hours >= 12) return hours;
    // otherwise assume pm
    return hours + 12;
  }

  let hours = parseInt(timePart.split(":")[0]);
  if (meridiem === "pm" && hours < 12) hours += 12;
  else if (meridiem === "am" && hours === 12) hours = 0;

  return hours;
}
