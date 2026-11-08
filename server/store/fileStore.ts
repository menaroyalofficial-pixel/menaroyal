/**
 * Local JSON store for the laptop demo and tests.
 * Never used in production: see store/index.ts.
 */
import fs from "node:fs";
import path from "node:path";
import type { House, Order, OrderStatus, Piece, Store } from "./types.js";

interface Data {
  houses: House[];
  pieces: Piece[];
  orders: Order[];
}

export class FileStore implements Store {
  constructor(private file: string | null) {}
  private memory: Data = { houses: [], pieces: [], orders: [] };

  private load(): Data {
    if (!this.file) return this.memory;
    if (!fs.existsSync(this.file)) return { houses: [], pieces: [], orders: [] };
    return JSON.parse(fs.readFileSync(this.file, "utf8"));
  }

  private save(d: Data) {
    if (!this.file) {
      this.memory = d;
      return;
    }
    fs.mkdirSync(path.dirname(this.file), { recursive: true });
    fs.writeFileSync(this.file, JSON.stringify(d, null, 2));
  }

  async getHouse(id: string) {
    return this.load().houses.find((h) => h.id === id) ?? null;
  }
  async upsertHouse(house: House) {
    const d = this.load();
    d.houses = d.houses.filter((h) => h.id !== house.id).concat(house);
    this.save(d);
    return house;
  }
  async updateHouse(id: string, patch: Partial<House>) {
    const d = this.load();
    const h = d.houses.find((x) => x.id === id);
    if (!h) throw new Error("House not found");
    Object.assign(h, patch);
    this.save(d);
    return h;
  }

  async getPiece(id: string) {
    return this.load().pieces.find((p) => p.id === id) ?? null;
  }
  async getPieceBySerial(serial: string) {
    return this.load().pieces.find((p) => p.serial === serial) ?? null;
  }
  async listHousePieces(houseId: string) {
    return this.load().pieces.filter((p) => p.house_id === houseId);
  }
  async createPiece(piece: Piece) {
    const d = this.load();
    d.pieces.push(piece);
    this.save(d);
    return piece;
  }
  async updatePiece(id: string, patch: Partial<Piece>) {
    const d = this.load();
    const p = d.pieces.find((x) => x.id === id);
    if (!p) throw new Error("Piece not found");
    Object.assign(p, patch);
    this.save(d);
    return p;
  }

  async createOrder(order: Order) {
    const d = this.load();
    d.orders.push(order);
    this.save(d);
    return order;
  }
  async getOrder(id: string) {
    return this.load().orders.find((o) => o.id === id) ?? null;
  }
  async listPendingOrders(limit = 50) {
    return this.load().orders.filter((o) => o.status === "pending").slice(0, limit);
  }
  async listHouseOrders(houseId: string) {
    return this.load().orders.filter((o) => o.house_id === houseId);
  }
  async updateOrder(id: string, patch: Partial<Order>, fromStatus?: OrderStatus) {
    const d = this.load();
    const o = d.orders.find((x) => x.id === id);
    if (!o) return null;
    if (fromStatus && o.status !== fromStatus) return null;
    Object.assign(o, patch);
    this.save(d);
    return o;
  }
}
