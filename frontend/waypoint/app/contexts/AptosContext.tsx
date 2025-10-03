import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';

// Module address for the Waypoint contract
const MODULE_ADDRESS = "0x12dd47c0156dc2237a6e814b227bb664f54e85332ff636a64bc9dd1ce7d1bdb0";
const MODULE_NAME = "linear_stream_fa";

// Types for route data from blockchain
export interface RouteCore {
  route_obj_address: string;
  depositor: string;
  beneficiary: string;
  start_timestamp: string;
  period_seconds: string;
  payout_amount: string;
  max_periods: string;
  deposit_amount: string;
  claimed_amount: string;
}

interface AptosContextType {
  aptos: Aptos | null;
  network: Network | null;
  setNetwork: (network: Network) => void;
  isLoading: boolean;
  error: string | null;
  // Blockchain data fetching functions
  getRouteCore: (routeObjAddress: string) => Promise<RouteCore | null>;
  listAllRoutes: () => Promise<string[] | null>;
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

  // Fetch individual route core data from blockchain
  const getRouteCore = async (routeObjAddress: string): Promise<RouteCore | null> => {
    if (!aptos) {
      console.error('Aptos client not initialized');
      return null;
    }

    try {
      const payload = {
        function: `${MODULE_ADDRESS}::${MODULE_NAME}::get_route_core` as `${string}::${string}::${string}`,
        typeArguments: [],
        functionArguments: [routeObjAddress],
      };
      
      const result = await aptos.view({ payload });
      
      // Parse the result array into RouteCore object
      if (Array.isArray(result) && result.length >= 9) {
        return {
          route_obj_address: String(result[0]),
          depositor: String(result[1]),
          beneficiary: String(result[2]),
          start_timestamp: String(result[3]),
          period_seconds: String(result[4]),
          payout_amount: String(result[5]),
          max_periods: String(result[6]),
          deposit_amount: String(result[7]),
          claimed_amount: String(result[8]),
        };
      }
      
      console.error('Unexpected result format from get_route_core:', result);
      return null;
    } catch (error) {
      console.error('Error fetching route core:', error);
      return null;
    }
  };

  // Fetch all route addresses from blockchain
  const listAllRoutes = async (): Promise<string[] | null> => {
    if (!aptos) {
      console.error('Aptos client not initialized');
      return null;
    }

    try {
      const payload = {
        function: `${MODULE_ADDRESS}::${MODULE_NAME}::list_routes` as `${string}::${string}::${string}`,
        typeArguments: [],
        functionArguments: [],
      };
      
      const result = await aptos.view({ payload });
      
      // Result should be an array where first element is the routes array
      if (Array.isArray(result) && result.length > 0) {
        const routes = result[0];
        if (Array.isArray(routes)) {
          return routes.map(route => String(route));
        }
      }
      
      console.error('Unexpected result format from list_routes:', result);
      return null;
    } catch (error) {
      console.error('Error listing routes:', error);
      return null;
    }
  };

  const value: AptosContextType = {
    aptos,
    network,
    setNetwork,
    isLoading,
    error,
    getRouteCore,
    listAllRoutes,
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
