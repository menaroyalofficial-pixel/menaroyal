/**
 * Reads certificates from Solana. Accounts are read directly through the RPC
 * (a Helius RPC when HELIUS_API_KEY is set). History uses Helius DAS
 * getSignaturesForAsset when available, plain RPC otherwise.
 */
import { fetchAsset, fetchCollection } from "@metaplex-foundation/mpl-core";
import { publicKey } from "@metaplex-foundation/umi";
import { Connection, PublicKey } from "@solana/web3.js";
import { loadJson } from "./metadata.js";
import { readUmi } from "./umi.js";
import type { AttributeView, ChainReader, HistoryEntry } from "./verify.js";

const MAX_BYTES = 8 * 1024 * 1024;

function attributes(plugin: any): AttributeView | null {
  if (!plugin) return null;
  const map: Record<string, string> = {};
  for (const a of plugin.attributeList ?? []) map[a.key] = a.value;
  return { immutable: plugin.authority?.type === "None", map };
}

function labelFromLogs(logs: string[]): string {
  const text = logs.join("\n");
  if (/Instruction: Create/.test(text)) return "Registered and signed by the house";
  if (/Instruction: Transfer/.test(text)) return "Ownership transferred";
  return "Certificate updated";
}

export function rpcChainReader(rpc: string, heliusKey?: string): ChainReader {
  const umi = readUmi(rpc);
  const connection = new Connection(rpc, "confirmed");

  return {
    async getAsset(address) {
      if (!(await umi.rpc.accountExists(publicKey(address), { commitment: "confirmed" }))) return null;
      try {
        const a = await fetchAsset(umi, publicKey(address), { skipDerivePlugins: true });
        const ua = a.updateAuthority;
        return {
          address,
          owner: a.owner.toString(),
          name: a.name,
          uri: a.uri,
          collection: ua.type === "Collection" && ua.address ? ua.address.toString() : null,
          attributes: attributes(a.attributes),
          creators: (a.verifiedCreators?.signatures ?? []).map((s) => ({
            address: s.address.toString(),
            verified: s.verified,
          })),
        };
      } catch {
        return null; // the account exists but is not a Core asset
      }
    },

    async getCollection(address) {
      try {
        const c = await fetchCollection(umi, publicKey(address));
        return { address, updateAuthority: c.updateAuthority.toString(), attributes: attributes(c.attributes) };
      } catch {
        return null;
      }
    },

    async getHistory(address): Promise<HistoryEntry[]> {
      if (heliusKey) {
        const res = await fetch(`https://devnet.helius-rpc.com/?api-key=${heliusKey}`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ jsonrpc: "2.0", id: "h", method: "getSignaturesForAsset", params: { id: address, page: 1, limit: 20 } }),
        });
        const body: any = await res.json().catch(() => null);
        const items: [string, string][] | undefined = body?.result?.items;
        if (items?.length) {
          const sigs = await connection.getSignaturesForAddress(new PublicKey(address), { limit: 20 }).catch(() => []);
          const times = new Map(sigs.map((s) => [s.signature, s.blockTime]));
          return items.map(([signature, type]) => ({
            signature,
            time: times.get(signature) ? new Date(times.get(signature)! * 1000).toISOString() : null,
            label: /transfer/i.test(type) ? "Ownership transferred" : /mint|create/i.test(type) ? "Registered and signed by the house" : "Certificate updated",
          }));
        }
      }
      const sigs = await connection.getSignaturesForAddress(new PublicKey(address), { limit: 20 });
      const entries: HistoryEntry[] = [];
      for (const s of sigs) {
        if (s.err) continue;
        const tx = await connection.getTransaction(s.signature, { maxSupportedTransactionVersion: 0, commitment: "confirmed" });
        entries.push({
          signature: s.signature,
          time: s.blockTime ? new Date(s.blockTime * 1000).toISOString() : null,
          label: labelFromLogs(tx?.meta?.logMessages ?? []),
        });
      }
      return entries; // newest first
    },

    fetchJson: (uri) => loadJson(uri),

    async fetchBytes(url) {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Photo not reachable (${res.status})`);
      const buf = new Uint8Array(await res.arrayBuffer());
      if (buf.byteLength > MAX_BYTES) throw new Error("Photo too large");
      return buf;
    },
  };
}
