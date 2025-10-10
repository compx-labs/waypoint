import { createContext, useContext, type ReactNode } from 'react';
import { BlockchainNetwork } from './NetworkContext';
import { NetworkContext } from './NetworkContext';

// Transaction types
export interface AptosTransaction {
  data: {
    function: string;
    typeArguments?: string[];
    functionArguments?: any[];
  };
}

export interface AlgorandTransaction {
  // TODO: Define Algorand transaction structure
  [key: string]: any;
}

export type UnifiedTransaction = AptosTransaction | AlgorandTransaction;

interface UnifiedWalletContextType {
  // Connection state
  connected: boolean;
  connecting: boolean;
  account: string | null;
  
  // Wallet actions
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  
  // Transaction handling
  signAndSubmitTransaction: (transaction: UnifiedTransaction) => Promise<any>;
  
  // Network info
  currentNetwork: BlockchainNetwork;
  
  // Error state
  error: string | null;
}

export const UnifiedWalletContext = createContext<UnifiedWalletContextType | null>(null);

interface UnifiedWalletProviderProps {
  children: ReactNode;
}

export function UnifiedWalletProvider({ children }: UnifiedWalletProviderProps) {
  // Use network context
  const networkContext = useContext(NetworkContext);
  const selectedNetwork = networkContext?.selectedNetwork || BlockchainNetwork.APTOS;

  // Provide a simple default implementation
  // Components should use network-specific hooks directly for now
  const value: UnifiedWalletContextType = {
    connected: false,
    connecting: false,
    account: null,
    connect: async () => {
      console.warn('UnifiedWallet connect() - use network-specific wallet instead');
    },
    disconnect: async () => {
      console.warn('UnifiedWallet disconnect() - use network-specific wallet instead');
    },
    signAndSubmitTransaction: async () => {
      throw new Error('UnifiedWallet signAndSubmitTransaction() - use network-specific wallet instead');
    },
    currentNetwork: selectedNetwork,
    error: null,
  };

  return (
    <UnifiedWalletContext.Provider value={value}>
      {children}
    </UnifiedWalletContext.Provider>
  );
}

export function useUnifiedWallet() {
  const context = useContext(UnifiedWalletContext);
  if (!context) {
    throw new Error('useUnifiedWallet must be used within a UnifiedWalletProvider');
  }
  return context;
}
