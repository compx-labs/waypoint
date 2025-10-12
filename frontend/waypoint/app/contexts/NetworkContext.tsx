import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

export enum BlockchainNetwork {
  APTOS = 'APTOS',
  ALGORAND = 'ALGORAND',
}

interface NetworkContextType {
  selectedNetwork: BlockchainNetwork;
  setSelectedNetwork: (network: BlockchainNetwork) => void;
}

export const NetworkContext = createContext<NetworkContextType | null>(null);

interface NetworkProviderProps {
  children: ReactNode;
  initialNetwork?: BlockchainNetwork;
}

const NETWORK_STORAGE_KEY = 'waypoint_selected_network';

export function NetworkProvider({ 
  children, 
  initialNetwork = BlockchainNetwork.APTOS 
}: NetworkProviderProps) {
  // Initialize from localStorage if available
  const [selectedNetwork, setSelectedNetworkState] = useState<BlockchainNetwork>(() => {
    if (typeof window === 'undefined') return initialNetwork;
    
    const stored = localStorage.getItem(NETWORK_STORAGE_KEY);
    if (stored && (stored === BlockchainNetwork.APTOS || stored === BlockchainNetwork.ALGORAND)) {
      console.log('📡 Restored network from localStorage:', stored);
      return stored as BlockchainNetwork;
    }
    return initialNetwork;
  });

  // Wrapper to persist to localStorage
  const setSelectedNetwork = (network: BlockchainNetwork) => {
    console.log('📡 Setting network:', network);
    setSelectedNetworkState(network);
    if (typeof window !== 'undefined') {
      localStorage.setItem(NETWORK_STORAGE_KEY, network);
    }
  };

  const value: NetworkContextType = {
    selectedNetwork,
    setSelectedNetwork,
  };

  return (
    <NetworkContext.Provider value={value}>
      {children}
    </NetworkContext.Provider>
  );
}

export function useNetwork() {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
}

