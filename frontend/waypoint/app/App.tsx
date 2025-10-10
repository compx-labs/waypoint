import { Routes, Route } from "react-router-dom";
import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { Network } from "@aptos-labs/ts-sdk";
import { ToastProvider } from "./contexts/ToastContext";
import { AptosProvider } from "./contexts/AptosContext";
import { AlgorandProvider } from "./contexts/AlgorandContext";
import { NetworkProvider, BlockchainNetwork } from "./contexts/NetworkContext";
import { UnifiedWalletProvider } from "./contexts/UnifiedWalletContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@aptos-labs/wallet-adapter-ant-design/dist/index.css";
import Landing from "./routes/landing";
import AppRoute from "./routes/app";
import Analytics from "./routes/analytics";
import Docs from "./routes/docs";
import VisionRoadmap from "./routes/vision-roadmap";
import TokenRoutes from "./routes/token-routes";
import CreateRoute from "./routes/create-route";

// Create a client outside of the component to persist across re-renders
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes - data stays fresh longer
      gcTime: 1000 * 60 * 10, // 10 minutes - keep cache longer (formerly cacheTime)
      refetchOnWindowFocus: false,
      refetchOnMount: false, // Don't refetch if data is still fresh
      refetchOnReconnect: false,
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <NetworkProvider initialNetwork={BlockchainNetwork.APTOS}>
        <AlgorandProvider>
          <AptosProvider initialNetwork={Network.MAINNET}>
            <AptosWalletAdapterProvider
              autoConnect={true}
              dappConfig={{ network: Network.MAINNET }}
              onError={(error: any) => {
                console.log("Wallet adapter error:", error);
              }}
            >
              <UnifiedWalletProvider>
                <ToastProvider>
                  <Routes>
                    <Route path="/" element={<Landing />} />
                    <Route path="/app" element={<AppRoute />} />
                    <Route path="/app/analytics" element={<Analytics />} />
                    <Route path="/app/docs" element={<Docs />} />
                    <Route path="/app/vision-roadmap" element={<VisionRoadmap />} />
                    <Route path="/app/token" element={<TokenRoutes />} />
                    <Route path="/create-route" element={<CreateRoute />} />
                  </Routes>
                </ToastProvider>
              </UnifiedWalletProvider>
            </AptosWalletAdapterProvider>
          </AptosProvider>
        </AlgorandProvider>
      </NetworkProvider>
    </QueryClientProvider>
  );
}

