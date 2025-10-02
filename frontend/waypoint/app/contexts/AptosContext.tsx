import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';

interface AptosContextType {
  aptos: Aptos | null;
  network: Network | null;
  setNetwork: (network: Network) => void;
  isLoading: boolean;
  error: string | null;
}

const AptosContext = createContext<AptosContextType | null>(null);

interface AptosProviderProps {
  children: ReactNode;
  initialNetwork?: Network;
}

export function AptosProvider({ 
  children, 
  initialNetwork = Network.MAINNET // Default to mainnet if not provided
}: AptosProviderProps) {
  const [network, setNetworkState] = useState<Network | null>(initialNetwork);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aptos, setAptos] = useState<Aptos | null>(null);

  // Initialize Aptos client when network changes
  useEffect(() => {
    // Don't initialize if network is not available yet
    if (!network) {
      setIsLoading(false);
      return;
    }

    const initializeAptos = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const config = new AptosConfig({ network });
        console.log('Aptos config:', config);
        const client = new Aptos(config);

        console.log('Aptos client initialized', client);
        setAptos(client);
        console.log('Aptos client set');
        setIsLoading(false);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to initialize Aptos client';
        setError(errorMessage);
        setIsLoading(false);
        console.error('Aptos initialization error:', err);
      }
    };

    initializeAptos();
  }, [network]);

  const setNetwork = (newNetwork: Network) => {
    if (newNetwork !== network) {
      setNetworkState(newNetwork);
    }
  };

  const value: AptosContextType = {
    aptos,
    network,
    setNetwork,
    isLoading,
    error,
  };

  // Always render children immediately - let individual components handle loading states
  // This prevents blocking the entire app during initialization
  return (
    <AptosContext.Provider value={value}>
      {children}
    </AptosContext.Provider>
  );
}

export function useAptos() {
  const context = useContext(AptosContext);
  if (!context) {
    throw new Error('useAptos must be used within an AptosProvider');
  }
  return context;
}
