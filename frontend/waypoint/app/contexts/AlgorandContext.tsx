import {
  createContext,
  useContext,
  useState,
  useMemo,
  type ReactNode,
} from "react";
import {
  WalletManager,
  WalletId,
  NetworkId,
  WalletProvider,
} from "@txnlab/use-wallet-react";
import { AlgorandWaypointClient } from "@compx/waypoint-sdk";
import type {
  AlgorandRouteDetails,
  AlgorandNetwork,
} from "@compx/waypoint-sdk";

export enum AlgorandNetworkId {
  MAINNET = "mainnet",
  TESTNET = "testnet",
}

// Types for route data from blockchain
export interface AlgorandRouteCore {
  routeId: string;
  sender: string;
  recipient: string;
  startTimestamp: number;
  periodSeconds: number;
  payoutAmount: number;
  maxPeriods: number;
  depositAmount: number;
  claimedAmount: number;
}

interface AlgorandContextType {
  walletManager: WalletManager;
  network: AlgorandNetworkId;
  setNetwork: (network: AlgorandNetworkId) => void;
  waypointClient: AlgorandWaypointClient | null;
  // Blockchain data fetching functions
  getRouteCore: (routeId: string) => Promise<AlgorandRouteCore | null>;
  listAllRoutes: () => Promise<string[] | null>;
  getUserFluxTier: (userAddress: string) => Promise<number>;
}

export const AlgorandContext = createContext<AlgorandContextType | null>(null);

interface AlgorandProviderProps {
  children: ReactNode;
  initialNetwork?: AlgorandNetworkId;
}

export function AlgorandProvider({
  children,
  initialNetwork = AlgorandNetworkId.MAINNET,
}: AlgorandProviderProps) {
  const [network, setNetwork] = useState<AlgorandNetworkId>(initialNetwork);

  // Create wallet manager with useMemo to prevent unnecessary re-creates
  const walletManager = useMemo(() => {
    const networkId =
      network === AlgorandNetworkId.MAINNET
        ? NetworkId.MAINNET
        : NetworkId.TESTNET;

    const manager = new WalletManager({
      wallets: [
        WalletId.DEFLY,
        WalletId.PERA,
        {
          id: WalletId.LUTE,
          options: { siteName: "Waypoint" },
        },
      ],
      defaultNetwork: NetworkId.MAINNET,
    });

    console.log("Algorand WalletManager initialized", manager);
    return manager;
  }, [network]);

  // Create Waypoint SDK client
  const waypointClient = useMemo(() => {
    try {
      return new AlgorandWaypointClient({
        network: network as AlgorandNetwork,
      });
    } catch (error) {
      console.error("Failed to initialize Waypoint SDK client:", error);
      return null;
    }
  }, [network]);

  // Fetch individual route core data from blockchain
  const getRouteCore = async (
    routeId: string
  ): Promise<AlgorandRouteCore | null> => {
    if (!waypointClient) {
      console.error("Waypoint SDK client not initialized");
      return null;
    }

    try {
      // Fetch route data from database to determine route type
      const { fetchRoutes } = await import('../lib/api');
      const routes = await fetchRoutes();
      const route = routes.find(r => r.route_obj_address === routeId);

      if (!route || !route.route_type) {
        console.error('Route not found or missing route_type');
        return null;
      }

      console.log(`[${route.route_type}] Fetching route details via SDK`);

      // Check if this is an invoice route
      const isInvoice = route.route_type === 'invoice-routes';
      
      if (isInvoice) {
        // For invoice routes, use getInvoiceRouteDetails
        const invoiceDetails = await waypointClient.getInvoiceRouteDetails(BigInt(routeId));
        console.log('SDK Invoice route details:', invoiceDetails);
        
        if (!invoiceDetails) {
          return null;
        }

        // Convert InvoiceRouteDetails to AlgorandRouteCore format
        return {
          routeId: invoiceDetails.routeId,
          sender: invoiceDetails.requester, // Invoice routes use requester instead of depositor
          recipient: invoiceDetails.beneficiary,
          startTimestamp: Number(invoiceDetails.startTimestamp),
          periodSeconds: Number(invoiceDetails.periodSeconds),
          payoutAmount: Number(invoiceDetails.payoutAmount),
          maxPeriods: Number(invoiceDetails.maxPeriods),
          depositAmount: Number(invoiceDetails.depositAmount), // Net amount after fees
          claimedAmount: Number(invoiceDetails.claimedAmount),
        };
      }

      // For regular routes, use getRouteDetails
      const routeDetails: AlgorandRouteDetails | null = 
        await waypointClient.getRouteDetails(BigInt(routeId));

      if (!routeDetails) {
        return null;
      }

      // Convert SDK type to context type
      return {
        routeId: routeDetails.routeId,
        sender: routeDetails.depositor,
        recipient: routeDetails.beneficiary,
        startTimestamp: Number(routeDetails.startTimestamp),
        periodSeconds: Number(routeDetails.periodSeconds),
        payoutAmount: Number(routeDetails.payoutAmount),
        maxPeriods: Number(routeDetails.maxPeriods),
        depositAmount: Number(routeDetails.depositAmount),
        claimedAmount: Number(routeDetails.claimedAmount),
      };
    } catch (error) {
      console.error("Error fetching Algorand route core:", error);
      return null;
    }
  };

  // Fetch all route addresses from blockchain
  const listAllRoutes = async (): Promise<string[] | null> => {
    if (!waypointClient) {
      console.error("Waypoint SDK client not initialized");
      return null;
    }

    try {
      return await waypointClient.listAllRoutes();
    } catch (error) {
      console.error("Error listing Algorand routes:", error);
      return null;
    }
  };

  // Get user's FLUX tier
  const getUserFluxTier = async (userAddress: string): Promise<number> => {
    if (!waypointClient) {
      console.error("Waypoint SDK client not initialized");
      return 0;
    }

    try {
      return await waypointClient.getUserFluxTier(userAddress);
    } catch (error) {
      console.error("Error fetching FLUX tier:", error);
      return 0;
    }
  };

  const value: AlgorandContextType = {
    walletManager,
    network,
    setNetwork,
    waypointClient,
    getRouteCore,
    listAllRoutes,
    getUserFluxTier,
  };

  return (
    <WalletProvider manager={walletManager}>
      <AlgorandContext.Provider value={value}>
        {children}
      </AlgorandContext.Provider>
    </WalletProvider>
  );
}

export function useAlgorand() {
  const context = useContext(AlgorandContext);
  if (!context) {
    throw new Error("useAlgorand must be used within an AlgorandProvider");
  }
  return context;
}
