import { createContext, useContext, useState, useMemo, type ReactNode } from 'react';
import { WalletManager, WalletId, NetworkId, WalletProvider } from '@txnlab/use-wallet-react';

// Module configuration for Waypoint Algorand contracts
const MODULE_APP_ID = ""; // TODO: Set this when contract is deployed

export enum AlgorandNetworkId {
  MAINNET = 'mainnet',
  TESTNET = 'testnet',
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
  // Blockchain data fetching functions (to be implemented)
  getRouteCore: (routeId: string) => Promise<AlgorandRouteCore | null>;
  listAllRoutes: () => Promise<string[] | null>;
}

export const AlgorandContext = createContext<AlgorandContextType | null>(null);

interface AlgorandProviderProps {
  children: ReactNode;
  initialNetwork?: AlgorandNetworkId;
}

export function AlgorandProvider({ 
  children, 
  initialNetwork = AlgorandNetworkId.MAINNET
}: AlgorandProviderProps) {
  const [network, setNetwork] = useState<AlgorandNetworkId>(initialNetwork);

  // Create wallet manager with useMemo to prevent unnecessary re-creates
  const walletManager = useMemo(() => {
    const networkId = network === AlgorandNetworkId.MAINNET 
      ? NetworkId.MAINNET 
      : NetworkId.TESTNET;

    const manager = new WalletManager({
      wallets: [
        WalletId.DEFLY,
        WalletId.PERA,
        {
          id: WalletId.LUTE,
          options: { siteName: 'Waypoint' },
        },
      ],
      network: networkId,
      // Enable persistence to maintain wallet connections across page refreshes
      algod: {
        token: '',
        baseServer: networkId === NetworkId.MAINNET
          ? 'https://mainnet-api.algonode.cloud'
          : 'https://testnet-api.algonode.cloud',
        port: '',
      },
    });

    console.log('Algorand WalletManager initialized with persistence', manager);
    return manager;
  }, [network]);

  // Fetch individual route core data from blockchain
  const getRouteCore = async (routeId: string): Promise<AlgorandRouteCore | null> => {
    if (!walletManager) {
      console.error('Algorand wallet manager not initialized');
      return null;
    }

    try {
      // TODO: Implement actual blockchain data fetching
      // This will require Algorand SDK integration
      console.warn('getRouteCore not yet implemented for Algorand');
      return null;
    } catch (error) {
      console.error('Error fetching Algorand route core:', error);
      return null;
    }
  };

  // Fetch all route addresses from blockchain
  const listAllRoutes = async (): Promise<string[] | null> => {
    if (!walletManager) {
      console.error('Algorand wallet manager not initialized');
      return null;
    }

    try {
      // TODO: Implement actual blockchain data fetching
      // This will require Algorand SDK integration
      console.warn('listAllRoutes not yet implemented for Algorand');
      return null;
    } catch (error) {
      console.error('Error listing Algorand routes:', error);
      return null;
    }
  };

  const value: AlgorandContextType = {
    walletManager,
    network,
    setNetwork,
    getRouteCore,
    listAllRoutes,
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
    throw new Error('useAlgorand must be used within an AlgorandProvider');
  }
  return context;
}

