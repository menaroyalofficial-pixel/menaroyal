/**
 * Pilot preview for one house: what a file in pilots/<slug>.json looks like.
 * Used by the server (to load and check the file) and by the browser (types).
 */

export interface PilotProduct {
  id: string;
  name: string;
  priceGbp: string; // "180.00"
  priceUsd: string; // "230.00"
  image: string | null; // file name in public/pilots/<slug>/, or null
  notes: string;
  size: string | null;
  batch: string;
  madeOn: string; // YYYY-MM-DD
}

export interface PilotConfig {
  slug: string;
  house: {
    name: string;
    country: string;
    founded: string;
    story: [string, string] | [string];
    maker: string;
  };
  colours: { primary: string; accent: string; background: string };
  certificate: { style: "ivory" | "black" };
  products: PilotProduct[];
}

export const PILOT_SLUG = /^[a-z0-9][a-z0-9-]{1,39}$/;
const IMAGE_FILE = /^[A-Za-z0-9][A-Za-z0-9._-]{0,80}\.(jpe?g|png|webp)$/i;
const MONEY = /^\d{1,7}(\.\d{1,2})?$/;
const COLOUR = /^#[0-9a-fA-F]{6}$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

export class PilotConfigError extends Error {}

function text(value: unknown, field: string, max = 140, required = true): string {
  const s = typeof value === "number" ? String(value) : typeof value === "string" ? value.trim() : "";
  if (required && !s) throw new PilotConfigError(`${field} is missing`);
  if (s.length > max) throw new PilotConfigError(`${field} is too long (max ${max} characters)`);
  return s;
}

/** Checks a pilot file and returns a clean copy. Throws a plain-words error. */
export function parsePilotConfig(raw: unknown, slugFromFile: string): PilotConfig {
  const r = (raw ?? {}) as Record<string, unknown>;
  const slug = text(r.slug ?? slugFromFile, "slug", 40);
  if (!PILOT_SLUG.test(slug)) throw new PilotConfigError("slug must be lowercase letters, numbers and dashes");
  if (slug !== slugFromFile) throw new PilotConfigError(`slug "${slug}" must match the file name "${slugFromFile}.json"`);

  const h = (r.house ?? {}) as Record<string, unknown>;
  const storyRaw = Array.isArray(h.story) ? h.story : [h.story];
  const story = storyRaw.map((l: unknown, i: number) => text(l, `house.story line ${i + 1}`, 160)).filter(Boolean);
  if (story.length < 1 || story.length > 2) throw new PilotConfigError("house.story must be 1 or 2 short lines");
  const name = text(h.name, "house.name", 60);

  const c = (r.colours ?? {}) as Record<string, unknown>;
  const colour = (v: unknown, fallback: string, field: string) => {
    const s = typeof v === "string" && v ? v : fallback;
    if (!COLOUR.test(s)) throw new PilotConfigError(`${field} must look like #B8975A`);
    return s;
  };

  const products = Array.isArray(r.products) ? r.products : [];
  if (products.length < 3 || products.length > 5) throw new PilotConfigError("add 3 to 5 products");
  const ids = new Set<string>();
  const cleanProducts: PilotProduct[] = products.map((p: Record<string, unknown>, i: number) => {
    const n = `products[${i + 1}]`;
    const id = text(p.id ?? `product-${i + 1}`, `${n}.id`, 40);
    if (!PILOT_SLUG.test(id)) throw new PilotConfigError(`${n}.id must be lowercase letters, numbers and dashes`);
    if (ids.has(id)) throw new PilotConfigError(`${n}.id "${id}" is used twice`);
    ids.add(id);
    const priceGbp = text(p.priceGbp, `${n}.priceGbp`, 12);
    const priceUsd = text(p.priceUsd, `${n}.priceUsd`, 12);
    if (!MONEY.test(priceGbp) || Number(priceGbp) <= 0) throw new PilotConfigError(`${n}.priceGbp must look like 180.00`);
    if (!MONEY.test(priceUsd) || Number(priceUsd) <= 0) throw new PilotConfigError(`${n}.priceUsd must look like 230.00`);
    const image = p.image ? text(p.image, `${n}.image`, 90) : null;
    if (image && !IMAGE_FILE.test(image)) throw new PilotConfigError(`${n}.image must be a file name like bottle-1.jpg`);
    const madeOn = text(p.madeOn, `${n}.madeOn`, 10);
    if (!DATE.test(madeOn)) throw new PilotConfigError(`${n}.madeOn must look like 2026-10-01`);
    return {
      id,
      name: text(p.name, `${n}.name`, 80),
      priceGbp,
      priceUsd,
      image,
      notes: text(p.notes, `${n}.notes`, 200, false),
      size: text(p.size, `${n}.size`, 30, false) || null,
      batch: text(p.batch, `${n}.batch`, 30),
      madeOn,
    };
  });

  return {
    slug,
    house: {
      name,
      country: text(h.country, "house.country", 60),
      founded: text(h.founded, "house.founded", 20, false),
      story: story as PilotConfig["house"]["story"],
      maker: text(h.maker, "house.maker", 80, false) || name,
    },
    colours: {
      primary: colour(c.primary, "#000000", "colours.primary"),
      accent: colour(c.accent, "#B8975A", "colours.accent"),
      background: colour(c.background, "#FFFFFF", "colours.background"),
    },
    certificate: { style: (r.certificate as { style?: unknown } | undefined)?.style === "black" ? "black" : "ivory" },
    products: cleanProducts,
  };
}

/** Engraving line on a bottle: short, letters and simple marks only. */
export function cleanEngraving(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const s = value.replace(/\s+/g, " ").trim();
  if (!s) return null;
  if (s.length > 24 || !/^[\p{L}\p{N} .&'-]+$/u.test(s)) {
    throw new PilotConfigError("Engraving: up to 24 letters, numbers, spaces or . & ' -");
  }
  return s;
}
