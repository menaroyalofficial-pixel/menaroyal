/**
 * Registering a piece = minting its certificate (a Metaplex Core asset)
 * inside the house's collection.
 *
 * One transaction, two signatures that matter:
 *  - MENA ROYAL (collection authority) creates the asset and pays the fee.
 *  - The HOUSE signs to mark itself as verified creator.
 * Without the house's signature the transaction is invalid, so
 * MENA ROYAL alone cannot make a certificate that says "signed by the house".
 *
 * The facts (serial, hash of the details and photos) are written in an
 * Attributes plugin with no authority: nobody can change them afterwards.
 * MENA ROYAL keeps a transfer permission so it can hand the certificate to
 * the buyer once the order is paid. That permission ends at the first transfer.
 */
import {
  create,
  createCollection,
  fetchAsset,
  transfer,
  updatePlugin,
  type CollectionV1,
} from "@metaplex-foundation/mpl-core";
import {
  createNoopSigner,
  publicKey,
  type PublicKey as UmiPublicKey,
  type Signer,
  type TransactionBuilder,
  type Umi,
} from "@metaplex-foundation/umi";
import { base58 } from "@metaplex-foundation/umi/serializers";
import { CERT_STANDARD, inlineUri, type CertificateFacts, factsHash } from "./metadata.js";
import { assetKeypairFor, collectionKeypairFor } from "./serial.js";
import { signerFrom } from "./umi.js";

export interface HouseIdentity {
  id: string;
  name: string;
  wallet: string;
}

function collectionRef(address: UmiPublicKey) {
  return { publicKey: address } as Pick<CollectionV1, "publicKey" | "oracles" | "lifecycleHooks">;
}

/** Creates the house collection once. Same address every time for a house. */
export async function ensureHouseCollection(umi: Umi, seedSecret: string, house: HouseIdentity): Promise<string> {
  const collection = signerFrom(umi, collectionKeypairFor(seedSecret, house.id));
  if (await umi.rpc.accountExists(collection.publicKey, { commitment: "confirmed" })) return collection.publicKey.toString();

  const meta = {
    name: `MENA ROYAL · ${house.name}`,
    symbol: "MRCOA",
    description: `Certificates of authenticity for pieces by ${house.name}, issued with MENA ROYAL.`,
  };
  await createCollection(umi, {
    collection,
    name: meta.name,
    uri: inlineUri(meta),
    updateAuthority: umi.identity.publicKey,
    plugins: [
      {
        type: "Attributes",
        attributeList: [
          { key: "standard", value: CERT_STANDARD },
          { key: "house", value: house.name },
          { key: "house_id", value: house.id },
          { key: "house_wallet", value: house.wallet },
        ],
        authority: { type: "None" },
      },
    ],
  }).sendAndConfirm(umi, { confirm: { commitment: "confirmed" } });
  return collection.publicKey.toString();
}

export interface RegisterParams {
  seedSecret: string;
  collection: string;
  house: HouseIdentity;
  facts: CertificateFacts;
  uri: string;
  /** The house's signer. On the server for a browser wallet, use houseNoopSigner(). */
  houseSigner: Signer;
}

export function houseNoopSigner(wallet: string): Signer {
  return createNoopSigner(publicKey(wallet));
}

export function certificateAttributes(facts: CertificateFacts) {
  return [
    { key: "standard", value: CERT_STANDARD },
    { key: "serial", value: facts.serial },
    { key: "house", value: facts.house },
    { key: "house_wallet", value: facts.house_wallet },
    { key: "made_on", value: facts.made_on },
    { key: "facts_sha256", value: factsHash(facts) },
  ];
}

export function buildRegisterTransaction(umi: Umi, p: RegisterParams): { builder: TransactionBuilder; asset: string } {
  if (p.facts.house_wallet !== p.house.wallet) throw new Error("House wallet does not match the facts");
  if (p.houseSigner.publicKey.toString() !== p.house.wallet) throw new Error("House signer does not match the house wallet");

  const asset = signerFrom(umi, assetKeypairFor(p.seedSecret, p.facts.serial));
  const collection = publicKey(p.collection);
  const houseWallet = publicKey(p.house.wallet);

  const builder = create(umi, {
    asset,
    collection: collectionRef(collection),
    authority: umi.identity,
    payer: umi.identity,
    owner: houseWallet,
    name: `${p.facts.piece} · ${p.facts.house}`.slice(0, 64),
    uri: p.uri,
    plugins: [
      { type: "Attributes", attributeList: certificateAttributes(p.facts), authority: { type: "None" } },
      { type: "VerifiedCreators", signatures: [{ address: houseWallet, verified: false }] },
      { type: "TransferDelegate", authority: { type: "Address", address: umi.identity.publicKey } },
    ],
  }).add(
    updatePlugin(umi, {
      asset: asset.publicKey,
      collection,
      payer: umi.identity,
      authority: p.houseSigner,
      plugin: { type: "VerifiedCreators", signatures: [{ address: houseWallet, verified: true }] },
    }),
  );
  return { builder, asset: asset.publicKey.toString() };
}

/** House key held on the server (demo house, or a custodial house wallet). */
export async function registerWithServerSigner(umi: Umi, p: RegisterParams): Promise<{ asset: string; signature: string }> {
  const { builder, asset } = buildRegisterTransaction(umi, p);
  const res = await builder.sendAndConfirm(umi, { confirm: { commitment: "confirmed" } });
  return { asset, signature: base58.deserialize(res.signature)[0] };
}

/**
 * For a house using its own wallet in the browser: MENA ROYAL and the asset
 * key sign here, the house wallet adds its signature and sends it.
 * Returns the transaction as base64.
 */
export async function buildRegisterForWallet(umi: Umi, p: RegisterParams): Promise<{ transaction: string; asset: string }> {
  const { builder, asset } = buildRegisterTransaction(umi, p);
  const tx = await builder.setFeePayer(umi.identity).buildAndSign(umi);
  return { transaction: Buffer.from(umi.transactions.serialize(tx)).toString("base64"), asset };
}

/** Hands the certificate to the buyer (uses MENA ROYAL's transfer permission). */
export async function transferCertificate(
  umi: Umi,
  params: { asset: string; collection: string; newOwner: string },
): Promise<string> {
  const asset = await fetchAsset(umi, publicKey(params.asset));
  if (asset.owner.toString() === params.newOwner) return "already-owned";
  const res = await transfer(umi, {
    asset,
    collection: collectionRef(publicKey(params.collection)),
    newOwner: publicKey(params.newOwner),
    authority: umi.identity,
  }).sendAndConfirm(umi, { confirm: { commitment: "confirmed" } });
  return base58.deserialize(res.signature)[0];
}
