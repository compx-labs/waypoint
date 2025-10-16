import { createContext, useContext, useMemo, useState, useEffect, type ReactNode } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { useWallet as useAlgorandWallet } from '@txnlab/use-wallet-react';
import { BlockchainNetwork } from './NetworkContext';
import { NetworkContext } from './NetworkContext';

// NFD data type
export interface NFDData {
  name: string;
  avatar?: string;
}

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

// NFD fetching function
async function getNFD(address: string): Promise<NFDData | null> {
  const nfdURL = `https://api.nf.domains/nfd/address?address=${address}&limit=1&view=thumbnail`;
  try {
    const nfdURLResponseData = await fetch(nfdURL);
    const nfdURLResponse = await nfdURLResponseData.json();
    
    if (
      !nfdURLResponse ||
      !Array.isArray(nfdURLResponse) ||
      nfdURLResponse.length !== 1
    ) {
      return null;
    }
    
    const nfdBlob = nfdURLResponse[0];
    if (!nfdBlob.depositAccount || nfdBlob.depositAccount !== address) {
      return null;
    }
    
    const nfdData: NFDData = {
      name: nfdBlob.name
    };
    
    // Check for avatar - prioritize userDefined, then verified
    let avatarUrl = null;
    
    // First check userDefined avatar (direct URL)
    if (nfdBlob.properties?.userDefined?.avatar) {
      avatarUrl = nfdBlob.properties.userDefined.avatar;
      console.log('🖼️ Found userDefined avatar:', avatarUrl);
    }
    // Then check verified avatar (IPFS/NFT)
    else if (nfdBlob.properties?.verified?.avatar) {
      const verifiedAvatar = nfdBlob.properties.verified.avatar;
      console.log('🎨 Found verified avatar:', verifiedAvatar);
      
      // Convert IPFS links to HTTP using Algonode
      if (verifiedAvatar.startsWith('ipfs://')) {
        const ipfsHash = verifiedAvatar.replace('ipfs://', '');
        avatarUrl = `https://ipfs.algonode.xyz/ipfs/${ipfsHash}?optimizer=image&width=75`;
        console.log('🔗 Converted IPFS to HTTP:', avatarUrl);
      } else {
        // If it's already an HTTP URL, use as-is
        avatarUrl = verifiedAvatar;
      }
    }
    
    if (avatarUrl) {
      nfdData.avatar = avatarUrl;
    }
    
    return nfdData;
  } catch (e) {
    console.error('❌ NFD fetch error:', e);
    return null;
  }
}

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
  
  // NFD data (Algorand name service)
  nfd: NFDData | null;
  nfdLoading: boolean;
  
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

  // NFD state for Algorand
  const [nfdData, setNfdData] = useState<NFDData | null>(null);
  const [nfdLoading, setNfdLoading] = useState(false);

  // Fetch NFD when Algorand account changes
  useEffect(() => {
    const fetchNFD = async () => {
      if (selectedNetwork === BlockchainNetwork.ALGORAND && algorandWallet.activeAccount?.address) {
        setNfdLoading(true);
        const nfd = await getNFD(algorandWallet.activeAccount.address);
        setNfdData(nfd);
        setNfdLoading(false);
      } else {
        // Clear NFD data when not on Algorand or no account
        setNfdData(null);
        setNfdLoading(false);
      }
    };

    fetchNFD();
  }, [selectedNetwork, algorandWallet.activeAccount?.address]);

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
        disconnect: async () => {
          aptosWallet.disconnect();
        },
        signAndSubmitTransaction: async (transaction: UnifiedTransaction) => {
          return aptosWallet.signAndSubmitTransaction(transaction as any);
        },
        currentNetwork: selectedNetwork,
        nfd: null,
        nfdLoading: false,
        error: null,
      };
    } else if (selectedNetwork === BlockchainNetwork.ALGORAND) {
      return {
        connected: !!algorandWallet.activeAccount,
        connecting: algorandWallet.isReady && !algorandWallet.activeAccount,
        account: algorandWallet.activeAccount?.address || null,
        connect: async () => {
          await algorandWallet.activeWallet?.connect();
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
        nfd: nfdData,
        nfdLoading: nfdLoading,
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
        nfd: null,
        nfdLoading: false,
        error: null,
      };
    }
  }, [selectedNetwork, aptosWallet, algorandWallet, nfdData, nfdLoading]);

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
