/** Wires the real chain, store and keys together for the API routes. */
import * as cfg from "./config.js";
import { rpcChainReader } from "./certificates/chainReader.js";
import { assetKeypairFor } from "./certificates/serial.js";
import { authorityUmi } from "./certificates/umi.js";
import { inlineStorage, irysStorage } from "./certificates/storage.js";
import { verifySerial } from "./certificates/verify.js";
import { defaultCertificateMover, defaultChain, type RefreshDeps } from "./orders.js";
import { getStore } from "./store/index.js";
import type { RegisterDeps } from "./pieces.js";

export function chainReader() {
  return rpcChainReader(cfg.rpcUrl(), cfg.heliusApiKey());
}

export function verifyBySerial(serial: string) {
  const secret = cfg.certSeedSecret();
  return verifySerial(serial, {
    reader: chainReader(),
    authority: cfg.authorityPublicKey().toBase58(),
    assetAddressFor: (s) => assetKeypairFor(secret, s).publicKey.toBase58(),
    custodyWallet: cfg.custodyWallet()?.toBase58() ?? null,
  });
}

export function refreshDeps(): RefreshDeps {
  return { store: getStore(), chain: defaultChain(), mover: defaultCertificateMover(), seedSecret: cfg.certSeedSecret() };
}

export function registerDeps(): RegisterDeps {
  const umi = authorityUmi(cfg.rpcUrl(), cfg.authorityKeypair());
  return {
    store: getStore(),
    umi,
    storage: cfg.certStorage() === "irys" ? irysStorage(umi) : inlineStorage(),
    seedSecret: cfg.certSeedSecret(),
  };
}
