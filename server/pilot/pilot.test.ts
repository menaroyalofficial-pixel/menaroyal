// @vitest-environment node
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { cleanEngraving, parsePilotConfig, PilotConfigError } from "../../shared/pilot.js";
import { FileStore } from "../store/fileStore.js";
import {
  engravingHash,
  ensurePilotHouse,
  houseTerms,
  loadPilot,
  pilotAccess,
  pilotHouseId,
  pilotHouseKeypair,
  pilotOverview,
  priceSplit,
  type PilotPageDeps,
} from "./pilot.js";

const KEY = "test-".repeat(6); // made-up preview key for the test
const SECRET = "test-seed-secret";
const on = { PILOT_PREVIEW: "true", PILOT_PREVIEW_KEY: KEY, VERCEL_ENV: "preview" };

describe("pilot access", () => {
  it("opens only with the flag, the right key and not on production", () => {
    expect(pilotAccess(on, KEY)).toBe("ok");
    expect(pilotAccess(on, "wrong")).toBe("denied");
    expect(pilotAccess(on, undefined)).toBe("denied");
    expect(pilotAccess({ ...on, PILOT_PREVIEW: "false" }, KEY)).toBe("off");
    expect(pilotAccess({ ...on, PILOT_PREVIEW: undefined }, KEY)).toBe("off");
    expect(pilotAccess({ ...on, VERCEL_ENV: "production" }, KEY)).toBe("off");
    expect(pilotAccess({ ...on, PILOT_PREVIEW_KEY: "short" }, "short")).toBe("off");
  });
});

describe("pilot config", () => {
  it("the fragrance-demo file is valid", () => {
    const cfg = loadPilot("fragrance-demo")!;
    expect(cfg.house.country).toBe("Oman");
    expect(cfg.products.map((p) => p.name)).toEqual(["[Fragrance 1]", "[Fragrance 2]", "[Fragrance 3]"]);
  });

  for (const file of fs.readdirSync(path.resolve("pilots")).filter((f) => f.endsWith(".json"))) {
    it(`pilots/${file} is valid`, () => {
      expect(loadPilot(file.replace(/\.json$/, ""))).not.toBeNull();
    });
  }

  it("refuses bad files with plain words", () => {
    const raw = JSON.parse(fs.readFileSync(path.resolve("pilots/fragrance-demo.json"), "utf8"));
    expect(() => parsePilotConfig({ ...raw, products: raw.products.slice(0, 2) }, "fragrance-demo")).toThrow(/3 to 5 products/);
    expect(() => parsePilotConfig(raw, "other-house")).toThrow(/must match the file name/);
    const badPrice = { ...raw, products: raw.products.map((p: any, i: number) => (i ? p : { ...p, priceGbp: "18O" })) };
    expect(() => parsePilotConfig(badPrice, "fragrance-demo")).toThrow(PilotConfigError);
    const badImage = { ...raw, products: raw.products.map((p: any, i: number) => (i ? p : { ...p, image: "../../.env" })) };
    expect(() => parsePilotConfig(badImage, "fragrance-demo")).toThrow(/file name/);
  });

  it("ignores slugs that could leave the pilots folder", () => {
    expect(loadPilot("../package")).toBeNull();
    expect(loadPilot("does-not-exist")).toBeNull();
  });
});

describe("pilot house and split", () => {
  const cfg = loadPilot("fragrance-demo")!;
  const deps = (store: FileStore, now: Date) => ({ store, seedSecret: SECRET, now: () => now }) as PilotPageDeps;

  it("starts as a founding house: 100% to the house, 0% to MENA ROYAL, read from the database", async () => {
    const store = new FileStore(null);
    const now = new Date("2026-11-09T10:00:00Z");
    const house = await ensurePilotHouse(deps(store, now), cfg);
    expect(house.wallet_verified_at).toBeTruthy();
    expect(house.wallet_address).toBe(pilotHouseKeypair(SECRET, cfg).publicKey.toBase58());
    const t = houseTerms(house, now);
    expect(t.platformBps).toBe(0);
    expect(t.foundingEnds).toBe("2027-02-09");
    expect(priceSplit("180.00", t.platformBps)).toEqual({ total: "18000", house: "18000", platform: "0" });

    // Change the row in the database: the page follows.
    await store.updateHouse(house.id, { founding_house: false });
    const page = await pilotOverview(deps(store, now), cfg, "http://localhost:8080");
    expect(page.pilot.terms.platformBps).toBe(2000);
    expect(page.pilot.products[0].split.gbp).toEqual({ total: "18000", house: "14400", platform: "3600" });
    expect(page.pilot.products[0].image).toBeNull(); // no photo yet -> placeholder card
  });

  it("after 3 months the founding house pays 20%", async () => {
    const store = new FileStore(null);
    const house = await ensurePilotHouse(deps(store, new Date("2026-11-09T10:00:00Z")), cfg);
    expect(houseTerms(house, new Date("2027-02-10T00:00:00Z")).platformBps).toBe(2000);
  });

  it("a new house name gives a fresh house (its name is sealed in its collection)", () => {
    const renamed = { ...cfg, house: { ...cfg.house, name: "Maison Real" } };
    expect(pilotHouseId(SECRET, renamed)).not.toBe(pilotHouseId(SECRET, cfg));
    expect(pilotHouseId(SECRET, cfg)).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-a[0-9a-f]{3}-[0-9a-f]{12}$/);
  });
});

describe("engraving", () => {
  it("accepts initials, refuses long or odd text", () => {
    expect(cleanEngraving("  R.K. ")).toBe("R.K.");
    expect(cleanEngraving("")).toBeNull();
    expect(cleanEngraving(undefined)).toBeNull();
    expect(() => cleanEngraving("<script>")).toThrow();
    expect(() => cleanEngraving("x".repeat(25))).toThrow();
  });

  it("only a salted hash would go on the chain", () => {
    const h1 = engravingHash("salt-a", "R.K.");
    expect(h1).toMatch(/^[0-9a-f]{64}$/);
    expect(h1).not.toContain("R.K.");
    expect(engravingHash("salt-b", "R.K.")).not.toBe(h1);
  });
});
