/**
 * Checks the Supabase login token sent by the house dashboard and returns
 * the house this user manages. The browser never chooses the house id.
 */
import { createClient } from "@supabase/supabase-js";
import { supabaseServer } from "./config.js";
import { OrderError } from "./orders.js";

export async function houseIdFromToken(authorization: string | undefined): Promise<string> {
  const token = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;
  if (!token) throw new OrderError("Please log in.", 401);
  const sb = supabaseServer();
  if (!sb) throw new OrderError("House accounts are not set up on this site.", 503);
  const db = createClient(sb.url, sb.serviceKey, { auth: { persistSession: false } });
  const { data, error } = await db.auth.getUser(token);
  if (error || !data.user) throw new OrderError("Please log in again.", 401);
  const { data: profile } = await db.from("profiles").select("role, brand_id").eq("id", data.user.id).maybeSingle();
  if (!profile?.brand_id || (profile.role !== "brand_admin" && profile.role !== "super_admin")) {
    throw new OrderError("This account does not manage a house.", 403);
  }
  return profile.brand_id as string;
}
