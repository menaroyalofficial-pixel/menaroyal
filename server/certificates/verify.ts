/**
 * /verify/<serial>: reads the certificate from the chain and checks it.
 * Every check must pass, otherwise the page says "Can't verify this piece".
 */
import { extractFacts, factsHash, toHttp } from "./metadata.js";
import { isValidSerial, sha256Hex } from "./serial.js";

export interface AttributeView {
  immutable: boolean;
  map: Record<string, string>;
}

export interface AssetView {
  address: string;
  owner: string;
  name: string;
  uri: string;
  collection: string | null;
  attributes: AttributeView | null;
  creators: { address: string; verified: boolean }[];
}

export interface CollectionView {
  address: string;
  updateAuthority: string;
  attributes: AttributeView | null;
}

export interface HistoryEntry {
  signature: string;
  time: string | null;
  label: string;
}

export interface ChainReader {
  getAsset(address: string): Promise<AssetView | null>;
  getCollection(address: string): Promise<CollectionView | null>;
  getHistory(address: string): Promise<HistoryEntry[]>;
  fetchJson(uri: string): Promise<unknown>;
  fetchBytes(url: string): Promise<Uint8Array>;
}

export interface VerifyDeps {
  reader: ChainReader;
  authority: string;
  assetAddressFor: (serial: string) => string;
  custodyWallet?: string | null;
}

export interface VerifyResult {
  ok: boolean;
  serial: string;
  reasons: string[];
  piece: null | { name: string; maker: string; country: string; materials: string[]; madeOn: string };
  house: null | { name: string; wallet: string; signed: boolean };
  registeredAt: string | null;
  owner: null | { address: string; short: string; label: string };
  history: HistoryEntry[];
  photos: { uri: string; ok: boolean }[];
  asset: null | { address: string; collection: string | null };
}

export function shortAddress(a: string): string {
  return a.length > 10 ? `${a.slice(0, 4)}…${a.slice(-4)}` : a;
}

export async function verifySerial(serialInput: string, deps: VerifyDeps): Promise<VerifyResult> {
  const serial = serialInput.trim().toUpperCase();
  const result: VerifyResult = {
    ok: false,
    serial,
    reasons: [],
    piece: null,
    house: null,
    registeredAt: null,
    owner: null,
    history: [],
    photos: [],
    asset: null,
  };
  const fail = (reason: string) => {
    result.reasons.push(reason);
    return result;
  };

  if (!isValidSerial(serial)) return fail("This serial number is not valid.");

  const address = deps.assetAddressFor(serial);
  const asset = await deps.reader.getAsset(address);
  if (!asset) return fail("No certificate exists for this serial number.");
  result.asset = { address: asset.address, collection: asset.collection };

  if (!asset.collection) return fail("The certificate is not part of a MENA ROYAL house collection.");
  const collection = await deps.reader.getCollection(asset.collection);
  if (!collection || collection.updateAuthority !== deps.authority) {
    return fail("The certificate was not issued through MENA ROYAL.");
  }

  const houseName = collection.attributes?.map.house;
  const houseWallet = collection.attributes?.map.house_wallet;
  if (!collection.attributes?.immutable || !houseName || !houseWallet) {
    return fail("The house details on the chain are missing or editable.");
  }

  const attrs = asset.attributes;
  if (!attrs || !attrs.immutable) return fail("The certificate details on the chain are missing or editable.");
  if (attrs.map.serial !== serial) fail("The serial on the chain does not match.");
  if (attrs.map.house_wallet !== houseWallet) fail("The house on the certificate does not match its collection.");

  const signed = asset.creators.some((c) => c.address === houseWallet && c.verified);
  result.house = { name: houseName, wallet: houseWallet, signed };
  if (!signed) fail("The house did not sign this certificate.");

  // Details and photos: the hash on the chain must match the published details.
  let facts = null;
  try {
    facts = extractFacts(await deps.reader.fetchJson(asset.uri));
  } catch {
    facts = null;
  }
  if (!facts) {
    fail("The certificate details could not be loaded.");
  } else {
    if (factsHash(facts) !== attrs.map.facts_sha256) fail("The certificate details were changed.");
    if (facts.serial !== serial || facts.house_wallet !== houseWallet) fail("The certificate details do not match.");
    result.piece = {
      name: facts.piece,
      maker: facts.maker,
      country: facts.country,
      materials: facts.materials,
      madeOn: facts.made_on,
    };
    result.photos = await Promise.all(
      facts.photos.map(async (p) => {
        try {
          const bytes = await deps.reader.fetchBytes(toHttp(p.uri));
          return { uri: toHttp(p.uri), ok: sha256Hex(bytes) === p.sha256 };
        } catch {
          return { uri: toHttp(p.uri), ok: false };
        }
      }),
    );
    if (result.photos.length === 0) fail("The certificate has no photos.");
    if (result.photos.some((p) => !p.ok)) fail("A photo does not match the original.");
  }

  const owner = asset.owner;
  let label = `Verified buyer · ${shortAddress(owner)}`;
  if (owner === houseWallet) label = `${houseName} (the house)`;
  else if (deps.custodyWallet && owner === deps.custodyWallet) label = "Held by MENA ROYAL for a verified buyer";
  result.owner = { address: owner, short: shortAddress(owner), label };

  try {
    result.history = await deps.reader.getHistory(asset.address);
  } catch {
    result.history = [];
  }
  const first = result.history[result.history.length - 1];
  result.registeredAt = first?.time ?? null;

  result.ok = result.reasons.length === 0;
  return result;
}
