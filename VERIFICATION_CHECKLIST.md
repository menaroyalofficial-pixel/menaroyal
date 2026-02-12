# MENA ROYAL: Market Readiness Verification Checklist

This document serves as the final institutional protocol to verify the MENA ROYAL platform before its global market launch. Follow each step meticulously to ensure a flawless experience for artisans and patrons.

---

## 1. Institutional Branding & Consistency
- [ ] **Global Header:** Verify the MENA ROYAL logo and navigation links function across all devices.
- [ ] **Typography:** Ensure `Bodoni Moda` (Serif) and `Inter` (Sans) are rendering correctly.
- [ ] **Glassmorphic Navigation:** Check that the `BottomNav` appears correctly on mobile devices with its haptic-inspired cues.
- [ ] **Motion Experience:** Transitions between pages should be smooth (Framer Motion).

## 2. Patronage Flow (B2C)
- [ ] **The Archive (Shop):** Verify all product categories load and items display institutional metadata.
- [ ] **Acquisition Gateway (Checkout):** 
    - [ ] Test the PayPal integration (Sandbox mode).
    - [ ] Verify that order records are created in the `orders` table after successful payment.
    - [ ] Confirm order confirmation emails are received by the customer.
- [ ] **Member Pavilion (Account):**
    - [ ] Check 'Acquisition Archive' (Order History) for correctly logged purchases.
    - [ ] Verify 'Digital Heritage Collection' display.

## 3. Atelier Presence (B2B / Designer)
- [ ] **Portal Access:** Verify `/designer/login` correctly redirects `brand_admin` users to the `dashboard/designer`.
- [ ] **Curator Console:**
    - [ ] Check 'Insights' tab for correct brand metrics.
    - [ ] Verify 'Atelier Registry' (Inventory) allows management of products.
    - [ ] **Logistics Fulfillment:** Verify that curators can update shipping statuses and tracking numbers.
    - [ ] **Financial Registry:** Check Stripe Connect linkage status display.

## 4. Institutional Control (Admin)
- [ ] **Admin Vault:** Verify access to `Overview`, `Orders`, `Brands`, and `Journal`.
- [ ] **Brand Intake:** Test the review process for new house applications.
- [ ] **Journal Management:** 
    - [ ] Create a test narrative in the 'Journal' tab.
    - [ ] Verify it appears on the `/stories` page and the homepage.
    - [ ] Test the deletion of a narrative.

## 5. Automated Protocols (Backend)
- [ ] **Supabase Functions:** 
    - [ ] Verify `send-email` function is deployed and active.
    - [ ] Ensure `RESEND_API_KEY` is set in Supabase secrets.
- [ ] **Database Integrity:**
    - [ ] Run a test on Row Level Security (RLS) to ensure users can only see their own data.
    - [ ] Confirm `handle_new_user` trigger successfully populates the `profiles` table.

## 6. Content & Narrative
- [ ] **The Journal (Blog):**
    - [ ] Check listing page (`/stories`) for dynamic data loading.
    - [ ] Verify the Story Detail page renders the full narrative correctly.
    - [ ] Check homepage 'Editorial Section' for synchronization with recent stories.

---

### Critical Action Item: Supabase Table Creation
If you haven't yet, ensure the `stories` table is active. Run this in your Supabase SQL Editor:

```sql
create table stories (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  subtitle text,
  excerpt text,
  content text,
  image text,
  category text default 'Culture',
  read_time text default '5 min read',
  published boolean default true,
  created_at timestamp with time zone default now() not null
);

-- Enable RLS
alter table stories enable row level security;

-- Admin-only write policy (adjust based on your roles)
create policy "Admins can manage stories" on stories 
  for all using (
    exists (
      select 1 from profiles 
      where profiles.id = auth.uid() 
      and profiles.role = 'super_admin'
    )
  );

-- Public read policy
create policy "Public can read published stories" on stories 
  for select using (published = true);
```
