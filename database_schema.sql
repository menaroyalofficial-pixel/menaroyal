-- MENA ROYAL MASTER ARCHIVE RESTORATION
-- This script reconstructs the entire heritage database hierarchy for the new official MENA ROYAL project.

-- 1. DESTRUCTIVE RESET (Clean Slate to ensure consistency)
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists handle_new_user;
drop table if exists order_items;
drop table if exists orders;
drop table if exists wishlists;
drop table if exists waitlist;
drop table if exists products;
drop table if exists profiles;
drop table if exists brands;
drop table if exists brand_applications;
drop table if exists subscribers;
drop table if exists categories;

-- 2. CORE EXTENSIONS
create extension if not exists "uuid-ossp";

-- 3. THE ARCHIVE HIERARCHY

-- Brand Houses (The Foundations)
create table brands (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text unique not null,
  description text,
  story text,
  country text,
  category text,
  cover_image text,
  logo text,
  featured boolean default false,
  stripe_connect_id text,
  status text default 'pending' check (status in ('pending', 'active', 'suspended')),
  created_at timestamp with time zone default now() not null
);

-- Profiles (The Identity Layer)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  email text unique,
  role text default 'customer' check (role in ('customer', 'brand_admin', 'super_admin')),
  brand_id uuid references brands(id) on delete set null,
  created_at timestamp with time zone default now() not null
);

-- Categories Archive (Institutional Taxonomy)
create table categories (
  id text primary key, -- e.g. 'bridal', 'fashion', 'maison', 'jewelry'
  name text not null,
  description text,
  created_at timestamp with time zone default now() not null
);

-- The Collection (Products)
create table products (
  id uuid default uuid_generate_v4() primary key,
  brand_id uuid references brands(id) on delete cascade not null,
  category_id text references categories(id),
  name text not null,
  slug text unique not null,
  description text,
  price decimal(12,2) not null,
  currency text default 'USD',
  images text[], 
  materials text[],
  sizes text[],
  colors text[],
  stock integer default 0,
  featured boolean default false,
  published boolean default true,
  created_at timestamp with time zone default now() not null
);

-- User Interaction (Wishlists & Waitlists)
create table wishlists (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  product_id uuid references products(id) on delete cascade not null,
  created_at timestamp with time zone default now() not null,
  unique(user_id, product_id)
);

create table waitlist (
  id uuid default uuid_generate_v4() primary key,
  email text not null,
  product_id uuid references products(id) on delete cascade not null,
  created_at timestamp with time zone default now() not null
);

-- Intake (Brand Applications & Subscribers)
create table brand_applications (
  id uuid default uuid_generate_v4() primary key,
  company_name text not null,
  contact_name text not null,
  email text not null,
  website text,
  portfolio_url text,
  message text,
  status text default 'received' check (status in ('received', 'reviewing', 'approved', 'rejected')),
  created_at timestamp with time zone default now() not null
);

create table subscribers (
  id uuid default uuid_generate_v4() primary key,
  email text unique not null,
  status text default 'active' check (status in ('active', 'unsubscribed')),
  created_at timestamp with time zone default now() not null
);

-- Financial Registry (Orders)
create table orders (
  id uuid default uuid_generate_v4() primary key,
  customer_id uuid references auth.users on delete set null,
  customer_email text not null,
  total_amount decimal(12,2) not null,
  platform_fee decimal(12,2) not null,
  status text default 'pending' check (status in ('pending', 'paid', 'shipped', 'completed', 'refunded')),
  shipping_address jsonb,
  stripe_payment_id text unique,
  created_at timestamp with time zone default now() not null
);

create table order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references orders(id) on delete cascade not null,
  product_id uuid references products(id) on delete set null,
  brand_id uuid references brands(id) on delete set null,
  quantity integer not null,
  price_at_purchase decimal(12,2) not null,
  shipping_status text default 'pending' check (shipping_status in ('pending', 'processing', 'shipped', 'delivered')),
  tracking_number text,
  created_at timestamp with time zone default now() not null
);

-- 4. INTITIAL DATA (The Institutional Seeds)
insert into categories (id, name, description) values 
('bridal', 'Bridal', 'Exquisite haute couture for the Middle Eastern bride.'),
('caftan', 'Caftan', 'Majestic heritage gowns with intricate artisanal embroidery.'),
('djellaba', 'Djellaba', 'Regional silhouettes reimagined for the contemporary archive.'),
('evening', 'Evening Dress', 'High-fidelity formal wear for the global gala circuit.'),
('fashion', 'Fashion', 'Contemporary heritage and artisanal ready-to-wear.'),
('maison', 'Maison', 'Curated furniture and objects for the elevated home.'),
('jewelry', 'Jewelry', 'Exceptional precious metals and regional gemstones.');

-- 5. THE ROYAL SECURITY GATES (RLS)
-- We must enable and satisfy RLS for all tables to remove the "Unrestricted" warning.

alter table brands enable row level security;
alter table profiles enable row level security;
alter table categories enable row level security;
alter table products enable row level security;
alter table wishlists enable row level security;
alter table waitlist enable row level security;
alter table brand_applications enable row level security;
alter table subscribers enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

-- Brands Policies
create policy "Public can view active brands" on brands for select using (status = 'active');
create policy "Admins can manage brands" on brands for all using (exists (select 1 from profiles where id = auth.uid() and role = 'super_admin'));
create policy "Onboarding: allow public view by slug" on brands for select using (true); -- Required for the first login of a brand_admin

-- Profiles Policies
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Admins view all profiles" on profiles for select using (exists (select 1 from profiles where id = auth.uid() and role = 'super_admin'));

-- Categories Policies
create policy "Public can view categories" on categories for select using (true);

-- Products Policies
create policy "Public can view published products" on products for select using (published = true);
create policy "Manage products: Admin/Designer" on products for all using (
  exists (
    select 1 from profiles 
    where id = auth.uid() 
    and (role = 'super_admin' or (role = 'brand_admin' and brand_id = products.brand_id))
  )
);

-- Application Policies
create policy "Public can submit applications" on brand_applications for insert with check (true);
create policy "Admins can view/manage applications" on brand_applications for all using (exists (select 1 from profiles where id = auth.uid() and role = 'super_admin'));

-- Subscriber Policies
create policy "Public can subscribe" on subscribers for insert with check (true);
create policy "Admins can view subscribers" on subscribers for select using (exists (select 1 from profiles where id = auth.uid() and role = 'super_admin'));

-- Wishlist Policies
create policy "Users curate own wishlists" on wishlists for all using (auth.uid() = user_id);

-- 6. IDENTITY AUTOMATION (The Membership Engine)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (new.id, new.raw_user_meta_data->>'full_name', new.email, 'customer');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
