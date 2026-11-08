import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { mplCore } from "@metaplex-foundation/mpl-core";
import { createSignerFromKeypair, keypairIdentity, type Umi } from "@metaplex-foundation/umi";
import { fromWeb3JsKeypair } from "@metaplex-foundation/umi-web3js-adapters";
import type { Keypair } from "@solana/web3.js";

/** Read-only client (verify page). */
export function readUmi(rpc: string): Umi {
  return createUmi(rpc, "confirmed").use(mplCore());
}

/** Client that signs as the MENA ROYAL authority (server only). */
export function authorityUmi(rpc: string, authority: Keypair): Umi {
  const umi = readUmi(rpc);
  umi.use(keypairIdentity(fromWeb3JsKeypair(authority)));
  return umi;
}

export function signerFrom(umi: Umi, kp: Keypair) {
  return createSignerFromKeypair(umi, fromWeb3JsKeypair(kp));
}
