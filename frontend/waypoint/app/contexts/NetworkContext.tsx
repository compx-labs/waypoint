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

export function NetworkProvider({ 
  children, 
  initialNetwork = BlockchainNetwork.APTOS 
}: NetworkProviderProps) {
  const [selectedNetwork, setSelectedNetwork] = useState<BlockchainNetwork>(initialNetwork);

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

