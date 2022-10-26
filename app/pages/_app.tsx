import "../styles/globals.css";
import type { AppProps } from "next/app";
import { SolanaWalletProvider } from "@/contexts/SolanaWalletProvider";
import { SnackbarProvider } from "notistack";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <SnackbarProvider autoHideDuration={4000}>
        <SolanaWalletProvider>
          <Component {...pageProps} />
        </SolanaWalletProvider>
      </SnackbarProvider>
    </>
  );
}

export default MyApp;
