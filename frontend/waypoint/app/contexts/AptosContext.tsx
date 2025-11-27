import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';
import { AptosWaypointClient } from '@compx/waypoint-sdk';
import { fetchRoutes, fetchRouteTypes } from '../lib/api';
import { SIMPLE_LINEAR_ADDRESS, API_BASE_URL } from '../lib/constants';

// Module address for the Waypoint contract (extract from full address)
const MODULE_ADDRESS = SIMPLE_LINEAR_ADDRESS.split('::')[0];

// Backend API URL
const BACKEND_API_URL = API_BASE_URL;

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
          backendUrl: BACKEND_API_URL,
          moduleAddress: MODULE_ADDRESS,
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

  // Fetch individual route core data from blockchain using SDK
  const getRouteCore = async (routeObjAddress: string): Promise<RouteCore | null> => {
    if (!waypointClient) {
      console.error('Waypoint SDK client not initialized');
      return null;
    }

    try {
      // Fetch route data from database to determine route type
      const routes = await fetchRoutes();
      const route = routes.find(r => r.route_obj_address === routeObjAddress);

      if (!route || !route.route_type) {
        console.error('Route not found or missing route_type');
        return null;
      }

      console.log(`[${route.route_type}] Fetching route details via SDK`);

      // Use SDK to fetch route details based on route type
      const isMilestone = route.route_type === 'milestone-routes';
      const isInvoice = route.route_type === 'invoice-routes';
      
      let routeDetails;
      if (isInvoice) {
        // For invoice routes, use getInvoiceRouteDetails
        const invoiceDetails = await waypointClient.getInvoiceRouteDetails(routeObjAddress);
        console.log('SDK Invoice route details:', invoiceDetails);
        
        // Convert InvoiceRouteDetails to RouteCore format
        return {
          route_obj_address: invoiceDetails.routeAddress,
          depositor: invoiceDetails.payer, // Invoice routes use payer instead of depositor
          beneficiary: invoiceDetails.beneficiary,
          start_timestamp: String(invoiceDetails.startTimestamp),
          period_seconds: String(invoiceDetails.periodSeconds),
          payout_amount: String(invoiceDetails.payoutAmount),
          max_periods: String(invoiceDetails.maxPeriods),
          deposit_amount: String(invoiceDetails.depositAmount), // Net amount after fees
          claimed_amount: String(invoiceDetails.claimedAmount),
          approved_amount: undefined, // Invoice routes don't have approval
        };
      } else if (isMilestone) {
        routeDetails = await waypointClient.getMilestoneRouteDetails(routeObjAddress);
      } else {
        routeDetails = await waypointClient.getLinearRouteDetails(routeObjAddress);
      }

      console.log('SDK Route details:', routeDetails);

      // Convert SDK RouteDetails format to RouteCore format
      return {
        route_obj_address: routeDetails.routeAddress,
        depositor: routeDetails.depositor,
        beneficiary: routeDetails.beneficiary,
        start_timestamp: String(routeDetails.startTimestamp),
        period_seconds: String(routeDetails.periodSeconds),
        payout_amount: String(routeDetails.payoutAmount),
        max_periods: String(routeDetails.maxPeriods),
        deposit_amount: String(routeDetails.depositAmount),
        claimed_amount: String(routeDetails.claimedAmount),
        approved_amount: routeDetails.approvedAmount ? String(routeDetails.approvedAmount) : undefined,
      };
    } catch (error) {
      console.error('Error fetching route core via SDK:', error);
      return null;
    }
  };

  // Fetch all route addresses from blockchain for a specific route type using SDK
  const listAllRoutes = async (routeTypeId?: string): Promise<string[] | null> => {
    if (!waypointClient) {
      console.error('Waypoint SDK client not initialized');
      return null;
    }

    if (!routeTypeId) {
      console.error('Route type ID is required');
      return null;
    }

    try {
      console.log(`Listing routes for type: ${routeTypeId} via SDK`);
      
      // Use SDK to list routes based on route type
      const isMilestone = routeTypeId === 'milestone-routes';
      const routes = isMilestone
        ? await waypointClient.listMilestoneRoutes()
        : await waypointClient.listLinearRoutes();

      return routes;
    } catch (error) {
      console.error(`Error listing routes via SDK (${routeTypeId}):`, error);
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
