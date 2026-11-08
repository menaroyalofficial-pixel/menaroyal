/**
 * Founding-house rule: 0% commission for the first months after the
 * house's start date, then the house's normal commission (20% by default).
 * All values come from the houses table, nothing is hard-coded per house.
 */
export interface HouseTerms {
  commission_bps: number | null; // normal commission, 2000 = 20%
  founding_house: boolean | null;
  start_date: string | Date | null; // when the house started on MENA ROYAL
  founding_months: number | null; // length of the 0% period, 3 by default
}

export const DEFAULT_COMMISSION_BPS = 2000;
export const DEFAULT_FOUNDING_MONTHS = 3;

/** Adds whole calendar months in UTC (31 Jan + 1 month -> 28/29 Feb). */
export function addMonthsUtc(date: Date, months: number): Date {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth() + months;
  const target = new Date(Date.UTC(y, m, 1, date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds()));
  const lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  target.setUTCDate(Math.min(date.getUTCDate(), lastDay));
  return target;
}

export function foundingPeriodEnd(terms: HouseTerms): Date | null {
  if (!terms.founding_house || !terms.start_date) return null;
  const start = new Date(terms.start_date);
  if (Number.isNaN(start.getTime())) return null;
  return addMonthsUtc(start, terms.founding_months ?? DEFAULT_FOUNDING_MONTHS);
}

/** Commission in basis points that applies at `now`. */
export function platformBpsFor(terms: HouseTerms, now: Date = new Date()): number {
  const end = foundingPeriodEnd(terms);
  if (end && now.getTime() < end.getTime()) return 0;
  return terms.commission_bps ?? DEFAULT_COMMISSION_BPS;
}
