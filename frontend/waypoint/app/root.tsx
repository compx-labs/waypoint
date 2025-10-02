import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";
import "./wallet-styles.css";
import "./route-creation-styles.css";
import { useState, useEffect } from "react";
import { ToastProvider } from "./contexts/ToastContext";
import { AptosProvider } from "./contexts/AptosContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

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
  const [WalletProvider, setWalletProvider] = useState<any>(null);
  const [Network, setNetwork] = useState<any>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Mark as client-side
    setIsClient(true);
    
    // Dynamically import wallet adapter CSS (loaded before our custom styles)
    import("@aptos-labs/wallet-adapter-ant-design/dist/index.css");
    
    // Dynamically import wallet adapter components
    Promise.all([
      import("@aptos-labs/wallet-adapter-react"),
      import("@aptos-labs/ts-sdk")
    ]).then(([adapterModule, sdkModule]) => {
      setWalletProvider(() => adapterModule.AptosWalletAdapterProvider);
      setNetwork(sdkModule.Network);
    });
  }, []);

  if (!isClient || !WalletProvider || !Network) {
    return (
      <QueryClientProvider client={queryClient}>
        <AptosProvider>
          <ToastProvider>
            <Outlet />
          </ToastProvider>
        </AptosProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AptosProvider initialNetwork={Network.MAINNET}>
        <WalletProvider
          autoConnect={true}
          dappConfig={{ network: Network.MAINNET }}
          onError={(error: any) => {
            console.log("Wallet adapter error:", error);
          }}
        >
          <ToastProvider>
            <Outlet />
          </ToastProvider>
        </WalletProvider>
      </AptosProvider>
    </QueryClientProvider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
