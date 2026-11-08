import { describe, expect, it, vi, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StoreProvider } from "@/contexts/StoreContext";
import Verify, { type VerifyResponse } from "./Verify";

vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: { getSession: async () => ({ data: { session: null } }), onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }) },
    from: () => ({ select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null }), single: async () => ({ data: null }) }), in: async () => ({ data: [] }) }) }),
  },
}));

const real: VerifyResponse = {
  ok: true,
  serial: "MR-DARR-7K3Q9XAB",
  reasons: [],
  piece: { name: "Caftan Layla", maker: "Dar Rime atelier", country: "United Arab Emirates", materials: ["Silk velvet"], madeOn: "2026-10-20" },
  house: { name: "Dar Rime", wallet: "BK6j…", signed: true },
  registeredAt: "2026-11-09T10:00:00.000Z",
  owner: { address: "31eQ…", short: "31eQ…1XzC", label: "Verified buyer · 31eQ…1XzC" },
  history: [
    { signature: "s2", time: "2026-11-10T10:00:00.000Z", label: "Ownership transferred", explorerUrl: "https://explorer.solana.com/tx/s2?cluster=devnet" },
    { signature: "s1", time: "2026-11-09T10:00:00.000Z", label: "Registered and signed by the house", explorerUrl: "https://explorer.solana.com/tx/s1?cluster=devnet" },
  ],
  photos: [{ uri: "https://www.menaroyal.com/curated/royal-velvet-caftan.jpg", ok: true }],
  assetExplorerUrl: "https://explorer.solana.com/address/x?cluster=devnet",
};

const fake: VerifyResponse = {
  ...real,
  ok: false,
  serial: "MR-DARR-ZZZZZZZZ",
  reasons: ["No certificate exists for this serial number."],
  piece: null,
  house: null,
  owner: null,
  history: [],
  photos: [],
  assetExplorerUrl: null,
};

function renderAt(serial: string, body: VerifyResponse) {
  vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify(body), { status: 200 })));
  render(
    <QueryClientProvider client={new QueryClient()}>
      <StoreProvider>
        <MemoryRouter initialEntries={[`/verify/${serial}`]}>
          <Routes>
            <Route path="/verify/:serial" element={<Verify />} />
          </Routes>
        </MemoryRouter>
      </StoreProvider>
    </QueryClientProvider>,
  );
}

afterEach(() => vi.unstubAllGlobals());

describe("/verify page", () => {
  it("shows a real certificate in plain words", async () => {
    renderAt(real.serial, real);
    await waitFor(() => expect(screen.getByText("Made by Dar Rime, signed by the house ✓")).toBeInTheDocument());
    expect(screen.getByText(/Registered on 9 November 2026/)).toBeInTheDocument();
    expect(screen.getByText(/Current owner: Verified buyer/)).toBeInTheDocument();
    expect(screen.getByText("Original ✓")).toBeInTheDocument();
    expect(screen.getByText("Ownership transferred")).toBeInTheDocument();
    expect(screen.queryByText("Can't verify this piece")).not.toBeInTheDocument();
  });

  it("shows a clear red failure for a fake serial", async () => {
    renderAt(fake.serial, fake);
    await waitFor(() => expect(screen.getByText("Can't verify this piece")).toBeInTheDocument());
    expect(screen.getByRole("alert").className).toMatch(/red/);
    expect(screen.queryByText(/signed by the house ✓/)).not.toBeInTheDocument();
  });
});
