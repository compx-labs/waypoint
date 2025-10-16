import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';
import { AptosWaypointClient } from '@waypoint/sdk';
import { fetchRoutes, fetchRouteTypes } from '../lib/api';

// Module address for the Waypoint contract
const MODULE_ADDRESS = "0x12dd47c0156dc2237a6e814b227bb664f54e85332ff636a64bc9dd1ce7d1bdb0";

// Backend API URL - you should configure this via environment variables
const BACKEND_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

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
  approved_amount?: string;
}

interface AptosContextType {
  aptos: Aptos | null;
  waypointClient: AptosWaypointClient | null;
  network: Network | null;
  setNetwork: (network: Network) => void;
  isLoading: boolean;
  error: string | null;
  // Blockchain data fetching functions
  getRouteCore: (routeObjAddress: string) => Promise<RouteCore | null>;
  listAllRoutes: (routeTypeId?: string) => Promise<string[] | null>;
}

export const AptosContext = createContext<AptosContextType | null>(null);

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
  const [waypointClient, setWaypointClient] = useState<AptosWaypointClient | null>(null);

  // Initialize Aptos client and Waypoint SDK when network changes
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
        
        // Initialize Waypoint SDK client
        const sdkNetwork = network === Network.MAINNET ? 'mainnet' : 'testnet';
        const waypoint = new AptosWaypointClient({
          network: sdkNetwork,
          aptosConfig: config,
          backendUrl: BACKEND_API_URL,
        });
        setWaypointClient(waypoint);
        console.log('Waypoint SDK client initialized');
        
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
      // Fetch route data from database to get the route type and module name
      const routes = await fetchRoutes();
      const route = routes.find(r => r.route_obj_address === routeObjAddress);

      console.log('Route:', route);
      console.log('Route type:', route?.route_type);

      console.log('Route routeObjAddress:', routeObjAddress);
      if (!route || !route.route_type) {
        console.error('Route not found or missing route_type');
        return null;
      }

      // Fetch route type configuration to get the module name
      const routeTypes = await fetchRouteTypes('aptos');
      const routeType = routeTypes.find(rt => rt.route_type_id === route.route_type);
      
      if (!routeType || !routeType.module_name) {
        console.error(`Route type '${route.route_type}' not found or missing module_name`);
        return null;
      }

      console.log(`[${route.route_type}] Using module: ${routeType.module_name}`);
      const payload = {
        function: `${MODULE_ADDRESS}::${routeType.module_name}::get_route_core` as `${string}::${string}::${string}`,
        typeArguments: [],
        functionArguments: [routeObjAddress],
      };
      
      const result = await aptos.view({ payload });
      console.log(`[${route.route_type}] Route core result:`, result);
      
      // Parse the result array into RouteCore object
      if (Array.isArray(result) && result.length >= 9) {
        const routeCore: RouteCore = {
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
        
        // For milestone routes, include approved_amount if available
        if (route.route_type === 'milestone-routes' && result.length >= 10) {
          routeCore.approved_amount = String(result[9]);
          console.log(`[Milestone] Approved amount: ${routeCore.approved_amount}`);
        }
        
        console.log('RouteCore:', routeCore);
        return routeCore;
      }
      
      console.error('Unexpected result format from get_route_core:', result);
      return null;
    } catch (error) {
      console.error(`Error fetching route core:`, error);
      return null;
    }
  };

  // Fetch all route addresses from blockchain for a specific route type
  const listAllRoutes = async (routeTypeId?: string): Promise<string[] | null> => {
    if (!aptos) {
      console.error('Aptos client not initialized');
      return null;
    }

    if (!routeTypeId) {
      console.error('Route type ID is required');
      return null;
    }

    try {
      // Fetch route type configuration to get the module name
      const routeTypes = await fetchRouteTypes('aptos');
      const routeType = routeTypes.find(rt => rt.route_type_id === routeTypeId);
      
      if (!routeType || !routeType.module_name) {
        console.error(`Route type '${routeTypeId}' not found or missing module_name`);
        return null;
      }
      
      const payload = {
        function: `${MODULE_ADDRESS}::${routeType.module_name}::list_routes` as `${string}::${string}::${string}`,
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
      
      console.error(`Unexpected result format from list_routes (${routeTypeId}):`, result);
      return null;
    } catch (error) {
      console.error(`Error listing routes (${routeTypeId}):`, error);
      return null;
    }
  };

  const value: AptosContextType = {
    aptos,
    waypointClient,
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
