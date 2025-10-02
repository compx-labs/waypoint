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

  // If network is not available yet, render children without Aptos client
  // This allows the app to render during initial load
  if (!network) {
    return (
      <AptosContext.Provider value={value}>
        {children}
      </AptosContext.Provider>
    );
  }

  // Don't render children until Aptos client is ready (only after network is available)
  if (isLoading || !aptos) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-forest-600 mb-4"></div>
          <p className="text-forest-700 font-display">Initializing Aptos client...</p>
        </div>
      </div>
    );
  }

  // Show error state if initialization failed
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center bg-red-50 border-2 border-red-200 rounded-lg p-6 max-w-md">
          <div className="text-red-600 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-display font-bold text-red-800 mb-2">Aptos Client Error</h3>
          <p className="text-red-700 text-sm mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

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
