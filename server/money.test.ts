// @vitest-environment node
import { describe, expect, it } from "vitest";
import { formatUsdc, splitAmount, usdToCents, usdToMicroUsdc } from "./money";
import { platformBpsFor } from "./commission";

describe("USD to USDC (integers only)", () => {
  it("converts prices exactly", () => {
    expect(usdToMicroUsdc("1500")).toBe(1_500_000_000n);
    expect(usdToMicroUsdc(1500)).toBe(1_500_000_000n);
    expect(usdToMicroUsdc("2200.00")).toBe(2_200_000_000n);
    expect(usdToMicroUsdc(0.1)).toBe(100_000n);
    expect(usdToMicroUsdc(19.99)).toBe(19_990_000n);
    expect(usdToCents("1500.5")).toBe(150_050n);
  });

  it("refuses bad prices", () => {
    for (const bad of ["", "-1", "1e3", "1500.005", "abc", "1,500"]) {
      expect(() => usdToMicroUsdc(bad)).toThrow();
    }
    expect(() => usdToMicroUsdc(-5)).toThrow();
  });

  it("formats for display", () => {
    expect(formatUsdc(1_200_000_000n)).toBe("1200.00");
    expect(formatUsdc(1n)).toBe("0.00");
  });
});

describe("split between the house and MENA ROYAL", () => {
  it("$1,500 at 20% -> $1,200 house, $300 MENA ROYAL", () => {
    const s = splitAmount(usdToMicroUsdc(1500), 2000);
    expect(s.house).toBe(1_200_000_000n);
    expect(s.platform).toBe(300_000_000n);
  });

  it("founding house at 0% -> everything to the house", () => {
    const s = splitAmount(usdToMicroUsdc(1500), 0);
    expect(s.house).toBe(1_500_000_000n);
    expect(s.platform).toBe(0n);
  });

  it("always adds up to the total, rounding the platform share down", () => {
    const total = 1_000_001n;
    const s = splitAmount(total, 2000);
    expect(s.platform).toBe(200_000n);
    expect(s.house + s.platform).toBe(total);
  });

  it("refuses invalid commissions", () => {
    expect(() => splitAmount(100n, -1)).toThrow();
    expect(() => splitAmount(100n, 10_001)).toThrow();
    expect(() => splitAmount(100n, 12.5)).toThrow();
    expect(() => splitAmount(0n, 2000)).toThrow();
  });

  it("reads the rule from the house record (founding 0% then 20%)", () => {
    const house = { commission_bps: 2000, founding_house: true, start_date: "2026-11-01", founding_months: 3 };
    const total = usdToMicroUsdc(1500);
    expect(splitAmount(total, platformBpsFor(house, new Date("2026-12-15"))).platform).toBe(0n);
    expect(splitAmount(total, platformBpsFor(house, new Date("2027-02-02"))).platform).toBe(300_000_000n);
  });
});
