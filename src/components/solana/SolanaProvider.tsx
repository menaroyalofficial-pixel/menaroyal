import { useMemo, type ReactNode } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { SolflareWalletAdapter } from "@solana/wallet-adapter-solflare";
import "@solana/wallet-adapter-react-ui/styles.css";
import { SOLANA_RPC_URL } from "@/lib/solana";

/**
 * Wallets for desktop: Phantom is found automatically (Wallet Standard),
 * Solflare is added explicitly. Only loaded on pages that need a wallet.
 */
const SolanaProvider = ({ children }: { children: ReactNode }) => {
  const wallets = useMemo(() => [new SolflareWalletAdapter()], []);
  return (
    <ConnectionProvider endpoint={SOLANA_RPC_URL}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default SolanaProvider;
