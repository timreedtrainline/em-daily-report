const localDateFormatter = new Intl.DateTimeFormat("en-CA", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
});

function localDateKey(date: Date): string {
  return localDateFormatter.format(date);
}

function parseDateKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function isWeekday(date: Date): boolean {
  const day = date.getUTCDay();
  return day >= 1 && day <= 5;
}

/** Counts weekdays elapsed after creation, excluding weekends. */
export function businessDaysOpen(createdAt: string, now = new Date()): number {
  const createdDate = parseDateKey(localDateKey(new Date(createdAt)));
  const currentDate = parseDateKey(localDateKey(now));

  if (createdDate >= currentDate) {
    return 0;
  }

  let businessDays = 0;
  for (let date = addDays(createdDate, 1); date <= currentDate; date = addDays(date, 1)) {
    if (isWeekday(date)) {
      businessDays += 1;
    }
  }

  return businessDays;
}
