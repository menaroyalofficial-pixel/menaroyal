-- MENA ROYAL · solana-v1
-- Safe to run more than once. Run it in Supabase: SQL editor -> paste -> Run
-- (or `supabase db push`). It only adds things, except the 3 policy fixes marked FIX.

-- ============================================================
-- 0. Helpers (security definer, so policies never query profiles recursively)
-- ============================================================
create or replace function public.is_super_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'super_admin');
$$;

create or replace function public.my_brand_id() returns uuid
language sql stable security definer set search_path = public as $$
  select brand_id from profiles where id = auth.uid() and role in ('brand_admin', 'super_admin');
$$;

-- ============================================================
-- 1. Houses (brands): wallet and commission rule
--    0% for `founding_months` after `start_date` when founding_house, then commission_bps.
-- ============================================================
alter table brands add column if not exists wallet_address text;
alter table brands add column if not exists wallet_verified_at timestamptz;
alter table brands add column if not exists commission_bps integer not null default 2000;
alter table brands add column if not exists founding_house boolean not null default true;
alter table brands add column if not exists start_date date;
alter table brands add column if not exists founding_months integer not null default 3;
update brands set start_date = created_at::date where start_date is null;
alter table brands alter column start_date set default current_date;
do $$ begin
  alter table brands add constraint brands_commission_bps_range check (commission_bps between 0 and 10000);
exception when duplicate_object then null; end $$;

-- ============================================================
-- 2. Pieces: one certificate (Metaplex Core asset) per physical piece
-- ============================================================
create table if not exists pieces (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete set null,
  house_id uuid not null references brands(id) on delete cascade,
  serial text not null unique,
  name text not null,
  maker text,
  country text,
  materials text[] not null default '{}',
  made_on date,
  price_usd numeric(12,2) not null check (price_usd > 0),
  photos jsonb not null default '[]',          -- [{url, sha256}]
  asset_address text unique,
  metadata_uri text,
  registration_tx text,
  status text not null default 'draft' check (status in ('draft', 'registered', 'sold')),
  owner_wallet text,
  batch text,
  created_at timestamptz not null default now()
);
alter table pieces add column if not exists batch text;
create index if not exists idx_pieces_house on pieces(house_id);
create index if not exists idx_pieces_product on pieces(product_id) where status = 'registered';

alter table pieces enable row level security;
drop policy if exists "Public can view certified pieces" on pieces;
create policy "Public can view certified pieces" on pieces for select using (status in ('registered', 'sold'));
drop policy if exists "Houses view own pieces" on pieces;
create policy "Houses view own pieces" on pieces for select using (house_id = public.my_brand_id() or public.is_super_admin());
-- No insert/update/delete policies: only the server (service role) writes pieces.

-- ============================================================
-- 3. Orders: USDC orders (old PayPal columns kept, made optional)
-- ============================================================
alter table orders add column if not exists piece_id uuid references pieces(id) on delete set null;
alter table orders add column if not exists house_id uuid references brands(id) on delete set null;
alter table orders add column if not exists buyer_wallet text;
alter table orders add column if not exists buyer_email text;
alter table orders add column if not exists amount_usd numeric(12,2);
alter table orders add column if not exists amount_usdc text;      -- micro-USDC, integer as text
alter table orders add column if not exists house_share text;      -- micro-USDC
alter table orders add column if not exists platform_share text;   -- micro-USDC
alter table orders add column if not exists platform_bps integer;
alter table orders add column if not exists house_wallet text;
alter table orders add column if not exists treasury_wallet text;
alter table orders add column if not exists usdc_mint text;
alter table orders add column if not exists reference text;
alter table orders add column if not exists tx_signature text;
alter table orders add column if not exists failure_reason text;
alter table orders add column if not exists certificate_status text default 'none';
alter table orders add column if not exists certificate_tx text;
-- Personalised pieces: the engraving stays here (private, RLS). Only a salted hash goes on the chain.
alter table orders add column if not exists engraving text;
alter table orders add column if not exists engraving_salt text;
alter table orders alter column customer_email drop not null;
alter table orders alter column total_amount drop not null;
alter table orders alter column platform_fee drop not null;
alter table orders drop constraint if exists orders_status_check;
alter table orders add constraint orders_status_check
  check (status in ('pending', 'paid', 'failed', 'refunded', 'shipped', 'completed'));
create unique index if not exists idx_orders_reference on orders(reference) where reference is not null;
create unique index if not exists idx_orders_tx_signature on orders(tx_signature) where tx_signature is not null;
create index if not exists idx_orders_house on orders(house_id);
create index if not exists idx_orders_pending on orders(status) where status = 'pending';

alter table orders enable row level security;
drop policy if exists "Buyers view own orders" on orders;
create policy "Buyers view own orders" on orders for select using (
  customer_id = auth.uid()
  or (buyer_email is not null and lower(buyer_email) = lower(auth.jwt() ->> 'email'))
);
drop policy if exists "Houses view own orders" on orders;
create policy "Houses view own orders" on orders for select using (house_id = public.my_brand_id());
drop policy if exists "Admins manage orders" on orders;
create policy "Admins manage orders" on orders for all using (public.is_super_admin());
-- No public insert/update: orders are created and confirmed by the server only.

alter table order_items enable row level security;
drop policy if exists "Buyers view own order items" on order_items;
create policy "Buyers view own order items" on order_items for select using (
  exists (select 1 from orders o where o.id = order_items.order_id and o.customer_id = auth.uid())
);
drop policy if exists "Houses view own order items" on order_items;
create policy "Houses view own order items" on order_items for select using (brand_id = public.my_brand_id());
drop policy if exists "Houses update own order items" on order_items;
create policy "Houses update own order items" on order_items for update using (brand_id = public.my_brand_id());
drop policy if exists "Admins manage order items" on order_items;
create policy "Admins manage order items" on order_items for all using (public.is_super_admin());

-- ============================================================
-- 4. Founding-house applications
-- ============================================================
alter table brand_applications add column if not exists country text;
alter table brand_applications add column if not exists instagram text;
alter table brand_applications add column if not exists categories text[];
alter table brand_applications add column if not exists price_range text;
alter table brand_applications add column if not exists application_type text default 'brand';

-- ============================================================
-- 5. FIX: waitlist policy was open to everyone (anyone could read all emails)
-- ============================================================
drop policy if exists "Allow service role full access" on waitlist;
drop policy if exists "Admins view waitlist" on waitlist;
create policy "Admins view waitlist" on waitlist for select using (public.is_super_admin());

-- ============================================================
-- 6. FIX: profiles policy queried profiles inside itself (infinite recursion error)
-- ============================================================
drop policy if exists "Admins view all profiles" on profiles;
create policy "Admins view all profiles" on profiles for select using (public.is_super_admin());

-- 7. Brands stay readable as before (the onboarding page needs it).
--    Note: this also exposes brands.designer_email publicly; move that column
--    to a private table in a later change.

-- ============================================================
-- 8. Photos for certificates (house uploads into a folder named after its id)
-- ============================================================
insert into storage.buckets (id, name, public) values ('piece-photos', 'piece-photos', true)
on conflict (id) do nothing;
drop policy if exists "Houses upload piece photos" on storage.objects;
create policy "Houses upload piece photos" on storage.objects for insert to authenticated
  with check (bucket_id = 'piece-photos' and (storage.foldername(name))[1] = public.my_brand_id()::text);

-- ============================================================
-- 9. Ben Ourain "Infinite Line": use the real photo of the rug
-- ============================================================
update products set images = array['/assets/products/Ben%20Ourain-Infinite%20Line.png']
where slug = 'ben-ourain-infinite-line';

-- ============================================================
-- 10. Every table in public must have RLS on
-- ============================================================
do $$
declare t record;
begin
  for t in select tablename from pg_tables where schemaname = 'public' loop
    execute format('alter table public.%I enable row level security', t.tablename);
  end loop;
end $$;
