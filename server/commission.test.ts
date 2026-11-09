// @vitest-environment node
import { describe, expect, it } from "vitest";
import { addMonthsUtc, platformBpsFor } from "./commission";

const founding = { commission_bps: 2000, founding_house: true, start_date: "2026-11-01T00:00:00Z", founding_months: 3 };

describe("founding-house commission", () => {
  it("is 0% during the first 3 months", () => {
    expect(platformBpsFor(founding, new Date("2026-11-01T00:00:00Z"))).toBe(0);
    expect(platformBpsFor(founding, new Date("2027-01-31T23:59:59Z"))).toBe(0);
  });

  it("goes back to 20% after 3 months", () => {
    expect(platformBpsFor(founding, new Date("2027-02-01T00:00:00Z"))).toBe(2000);
  });

  it("uses the house's own commission from the database", () => {
    expect(platformBpsFor({ ...founding, founding_house: false, commission_bps: 1500 }, new Date("2026-11-02"))).toBe(1500);
    expect(platformBpsFor({ ...founding, founding_months: 6 }, new Date("2027-03-01"))).toBe(0);
  });

  it("defaults to 20% when nothing is set", () => {
    expect(platformBpsFor({ commission_bps: null, founding_house: null, start_date: null, founding_months: null })).toBe(2000);
  });

  it("handles month ends", () => {
    expect(addMonthsUtc(new Date("2026-11-30T00:00:00Z"), 3).toISOString()).toBe("2027-02-28T00:00:00.000Z");
  });
});
