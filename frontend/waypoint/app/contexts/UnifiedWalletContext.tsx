import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { useWallet as useAlgorandWallet } from '@txnlab/use-wallet-react';
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

  // Get wallet states from both networks
  const aptosWallet = useWallet();
  const algorandWallet = useAlgorandWallet();

  // Compute unified wallet state based on selected network
  const value: UnifiedWalletContextType = useMemo(() => {
    if (selectedNetwork === BlockchainNetwork.APTOS) {
      return {
        connected: aptosWallet.connected,
        connecting: aptosWallet.isLoading,
        account: aptosWallet.account?.address ? aptosWallet.account.address.toString() : null,
        connect: async () => {
          // Aptos wallets connect via the WalletSelector modal
          console.log('Use Aptos WalletSelector to connect');
        },
        disconnect: aptosWallet.disconnect,
        signAndSubmitTransaction: aptosWallet.signAndSubmitTransaction,
        currentNetwork: selectedNetwork,
        error: null,
      };
    } else if (selectedNetwork === BlockchainNetwork.ALGORAND) {
      return {
        connected: algorandWallet.isActive,
        connecting: algorandWallet.isActive && !algorandWallet.activeAccount,
        account: algorandWallet.activeAccount?.address || null,
        connect: async () => {
          // Algorand wallets connect via their specific connect methods
          console.log('Use Algorand wallet-specific connect');
        },
        disconnect: async () => {
          if (algorandWallet.activeWallet) {
            await algorandWallet.activeWallet.disconnect();
          }
        },
        signAndSubmitTransaction: async (transaction: UnifiedTransaction) => {
          throw new Error('Algorand transactions not yet implemented');
        },
        currentNetwork: selectedNetwork,
        error: null,
      };
    } else {
      // Default/fallback
      return {
        connected: false,
        connecting: false,
        account: null,
        connect: async () => {},
        disconnect: async () => {},
        signAndSubmitTransaction: async () => {
          throw new Error('No network selected');
        },
        currentNetwork: selectedNetwork,
        error: null,
      };
    }
  }, [selectedNetwork, aptosWallet, algorandWallet]);

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
