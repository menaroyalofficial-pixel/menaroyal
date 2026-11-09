/**
 * Supabase store. Uses the service role key on the server only,
 * so it is the single place allowed to write orders and pieces.
 */
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { House, Order, OrderStatus, Piece, Store } from "./types.js";

const HOUSE_COLUMNS =
  "id,name,slug,country,wallet_address,wallet_verified_at,commission_bps,founding_house,start_date,founding_months";

function check<T>(res: { data: T | null; error: { message: string } | null }): T | null {
  if (res.error) throw new Error(res.error.message);
  return res.data;
}

function piece(row: any): Piece {
  return { ...row, price_usd: String(row.price_usd), photos: row.photos ?? [], materials: row.materials ?? [] };
}

function order(row: any): Order {
  return { ...row, amount_usd: String(row.amount_usd) };
}

export class SupabaseStore implements Store {
  private db: SupabaseClient;
  constructor(url: string, serviceKey: string) {
    this.db = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  }

  get client() {
    return this.db;
  }

  async getHouse(id: string) {
    return check(await this.db.from("brands").select(HOUSE_COLUMNS).eq("id", id).maybeSingle()) as House | null;
  }
  async upsertHouse(house: House) {
    return check(await this.db.from("brands").upsert(house).select(HOUSE_COLUMNS).single()) as House;
  }
  async updateHouse(id: string, patch: Partial<House>) {
    return check(await this.db.from("brands").update(patch).eq("id", id).select(HOUSE_COLUMNS).single()) as House;
  }

  async getPiece(id: string) {
    const row = check(await this.db.from("pieces").select("*").eq("id", id).maybeSingle());
    return row ? piece(row) : null;
  }
  async getPieceBySerial(serial: string) {
    const row = check(await this.db.from("pieces").select("*").eq("serial", serial).maybeSingle());
    return row ? piece(row) : null;
  }
  async listHousePieces(houseId: string) {
    const rows = check(await this.db.from("pieces").select("*").eq("house_id", houseId).order("created_at", { ascending: false }));
    return (rows ?? []).map(piece);
  }
  async createPiece(p: Piece) {
    return piece(check(await this.db.from("pieces").insert(p).select("*").single()));
  }
  async updatePiece(id: string, patch: Partial<Piece>) {
    return piece(check(await this.db.from("pieces").update(patch).eq("id", id).select("*").single()));
  }

  async createOrder(o: Order) {
    return order(check(await this.db.from("orders").insert(o).select("*").single()));
  }
  async getOrder(id: string) {
    const row = check(await this.db.from("orders").select("*").eq("id", id).maybeSingle());
    return row ? order(row) : null;
  }
  async listPendingOrders(limit = 50) {
    const rows = check(
      await this.db.from("orders").select("*").eq("status", "pending").not("reference", "is", null).order("created_at", { ascending: false }).limit(limit),
    );
    return (rows ?? []).map(order);
  }
  async listHouseOrders(houseId: string) {
    const rows = check(
      await this.db.from("orders").select("*").eq("house_id", houseId).not("reference", "is", null).order("created_at", { ascending: false }),
    );
    return (rows ?? []).map(order);
  }
  async updateOrder(id: string, patch: Partial<Order>, fromStatus?: OrderStatus) {
    let q = this.db.from("orders").update(patch).eq("id", id);
    if (fromStatus) q = q.eq("status", fromStatus);
    const rows = check(await q.select("*"));
    return rows && rows.length ? order(rows[0]) : null;
  }
}
