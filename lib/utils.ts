import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { eachDayOfInterval, isSameDay, subDays, format, parse, isValid } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Date-only strings like "2026-07-01" are parsed by `new Date(...)` as UTC
// midnight (a quirk of the Date constructor's ISO-string handling), which
// shifts the date backward by a day once displayed in any timezone behind
// UTC. Parsing with an explicit format always interprets the components in
// the local timezone instead, so "2026-07-01" is July 1st everywhere.
export function parseDateParam(value: string) {
  return parse(value, "yyyy-MM-dd", new Date());
}

// Bank CSV exports write amounts in a lot of shapes: "$1,234.56", "1,234.56",
// "(45.00)" for a negative, "20.00 USD". Passing those straight to parseFloat
// quietly mangles them — "1,234.56" becomes 1 — so normalise before parsing
// and return null (rather than 0) when a cell genuinely isn't a number, so
// callers can skip the row instead of importing a wrong value.
export function parseCsvAmount(raw: string): number | null {
  if (!raw) return null;

  let value = raw.trim();
  if (!value) return null;

  // Accounting notation: (45.00) means -45.00
  const isParenthesisedNegative = value.startsWith("(") && value.endsWith(")");
  if (isParenthesisedNegative) value = value.slice(1, -1);

  const isNegative = isParenthesisedNegative || value.includes("-");

  // Drop currency symbols, thousands separators, spaces and currency codes.
  value = value.replace(/[^0-9.]/g, "");
  if (!value || value === ".") return null;

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;

  return isNegative ? -Math.abs(parsed) : parsed;
}

const CSV_DATE_FORMATS = [
  "yyyy-MM-dd",
  "MM/dd/yyyy",
  "M/d/yyyy",
  "dd/MM/yyyy",
  "MM-dd-yyyy",
  "yyyy/MM/dd",
  "MMM d, yyyy",
  "d MMM yyyy",
];

// Try the common export formats explicitly. Falling back to `new Date(...)`
// would accept garbage and silently produce today's date, which is worse than
// telling the caller the row is unreadable.
export function parseCsvDate(raw: string): Date | null {
  if (!raw?.trim()) return null;

  const value = raw.trim();

  for (const dateFormat of CSV_DATE_FORMATS) {
    const parsed = parse(value, dateFormat, new Date());
    if (isValid(parsed)) return parsed;
  }

  return null;
}

export function convertAmountToMiliunits(amount: number) {
  return Math.round(amount * 1000);
}

export function convertAmountFromMiliunits(amount: number) {
  return amount / 1000;
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

// Axis labels need to stay narrow — "$12.1K" rather than "$12,095.89".
export function formatCompactCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

type Period = {
  from: string | Date | undefined;
  to: string | Date | undefined;
};

export function fillMissingDays(
  activeDays: { date: Date; income: number; expenses: number }[],
  startDate: Date,
  endDate: Date,
) {
  if (activeDays.length === 0) {
    return [];
  }

  const allDays = eachDayOfInterval({ start: startDate, end: endDate });

  return allDays.map((day) => {
    // Sum every entry landing on this calendar day rather than taking the
    // first match: two entries can share a day when their timestamps differ
    // (a synced transaction sits at midnight, a manually added one carries
    // the time it was created), and picking one would silently drop the other.
    const matches = activeDays.filter((d) => isSameDay(d.date, day));

    return {
      date: day,
      income: matches.reduce((sum, d) => sum + d.income, 0),
      expenses: matches.reduce((sum, d) => sum + d.expenses, 0),
    };
  });
}

export function formatDateRange(period?: Period) {
  const defaultTo = new Date();
  const defaultFrom = subDays(defaultTo, 30);

  if (!period?.from) {
    return `${format(defaultFrom, "LLL dd")} - ${format(defaultTo, "LLL dd, y")}`;
  }

  const to = period.to
    ? (typeof period.to === "string" ? parseDateParam(period.to) : period.to)
    : defaultTo;
  const from = typeof period.from === "string" ? parseDateParam(period.from) : period.from;

  return `${format(from, "LLL dd")} - ${format(to, "LLL dd, y")}`;
}
