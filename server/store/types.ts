import type { HouseTerms } from "../commission.js";

export type OrderStatus = "pending" | "paid" | "failed" | "refunded";
export type CertificateStatus = "none" | "pending" | "transferred" | "held_in_custody" | "failed";

export interface House extends HouseTerms {
  id: string;
  name: string;
  slug: string;
  country: string | null;
  wallet_address: string | null;
  wallet_verified_at: string | null;
}

export interface PiecePhoto {
  url: string;
  sha256: string;
}

export interface Piece {
  id: string;
  product_id: string | null;
  house_id: string;
  serial: string;
  name: string;
  maker: string | null;
  country: string | null;
  materials: string[];
  made_on: string | null;
  price_usd: string; // text, never a float
  photos: PiecePhoto[];
  asset_address: string | null;
  metadata_uri: string | null;
  registration_tx: string | null;
  status: "draft" | "registered" | "sold";
  owner_wallet: string | null;
  batch?: string | null;
  created_at: string;
}

export interface Order {
  id: string;
  piece_id: string;
  house_id: string;
  buyer_wallet: string | null;
  buyer_email: string | null;
  amount_usd: string;
  amount_usdc: string; // micro-USDC as text
  house_share: string; // micro-USDC as text
  platform_share: string; // micro-USDC as text
  platform_bps: number;
  house_wallet: string;
  treasury_wallet: string;
  usdc_mint: string;
  reference: string;
  tx_signature: string | null;
  status: OrderStatus;
  failure_reason: string | null;
  certificate_status: CertificateStatus;
  certificate_tx: string | null;
  /** Personalised bottles: kept off the chain. */
  engraving?: string | null;
  engraving_salt?: string | null;
  created_at: string;
}

export interface FoundingApplication {
  name: string;
  house: string;
  country: string;
  instagram: string | null;
  website: string | null;
  categories: string[];
  price_range: string;
  email: string;
}

export interface Store {
  getHouse(id: string): Promise<House | null>;
  upsertHouse(house: House): Promise<House>;
  updateHouse(id: string, patch: Partial<House>): Promise<House>;

  getPiece(id: string): Promise<Piece | null>;
  getPieceBySerial(serial: string): Promise<Piece | null>;
  listHousePieces(houseId: string): Promise<Piece[]>;
  createPiece(piece: Piece): Promise<Piece>;
  updatePiece(id: string, patch: Partial<Piece>): Promise<Piece>;

  createOrder(order: Order): Promise<Order>;
  getOrder(id: string): Promise<Order | null>;
  listPendingOrders(limit?: number): Promise<Order[]>;
  listHouseOrders(houseId: string): Promise<Order[]>;
  /** Only updates when the current status matches `fromStatus` (prevents double processing). */
  updateOrder(id: string, patch: Partial<Order>, fromStatus?: OrderStatus): Promise<Order | null>;
}
