// API utility functions for Waypoint backend

import { API_BASE_URL } from './constants';

// Types
export interface Token {
  id: number;
  symbol: string;
  name: string;
  logo_url: string;
  network: string;
  contract_address: string;
  decimals: number;
}

export interface RouteData {
  id: number;
  sender: string;
  recipient: string;
  token_id: number;
  amount_token_units: string;
  amount_per_period_token_units: string;
  start_date: string;
  payment_frequency_unit: string;
  payment_frequency_number: number;
  status: 'active' | 'completed' | 'cancelled';
  blockchain_tx_hash: string | null;
  route_obj_address: string | null;
  route_type?: string;
  created_at: string;
  token: Token;
}

export interface AddressBookEntry {
  id: number;
  owner_wallet: string;
  name: string;
  wallet_address: string;
  shortname?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateRoutePayload {
  sender: string;
  recipient: string;
  token_id: number;
  amount_token_units: string;
  amount_per_period_token_units: string;
  start_date: string;
  payment_frequency_unit: string;
  payment_frequency_number: number;
  blockchain_tx_hash: string | null;
  route_obj_address?: string | null;
  route_type?: string;
}

export interface CreateAddressBookPayload {
  owner_wallet: string;
  name: string;
  wallet_address: string;
  shortname?: string | null;
}

export interface UpdateAddressBookPayload {
  name: string;
  wallet_address: string;
  shortname?: string | null;
}

export interface RouteType {
  id: number;
  route_type_id: string;
  display_name: string;
  description: string;
  network: 'aptos' | 'algorand';
  module_name: string | null;
  contract_address: string | null;
  enabled: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// Aptos Account Types
export interface AptosAccountBalance {
  symbol: string;
  name: string;
  amount: number;
  decimals: number;
  coinType: string;
  logoUrl: string;
}

export interface AptosAccountData {
  address: string;
  balances: AptosAccountBalance[];
  modules: AptosModule[];
  tokens: AptosToken[];
  network: string;
}

export interface AptosModule {
  address: string;
  name: string;
  bytecode: string;
  friends: string[];
  exposed_functions: AptosExposedFunction[];
  structs: AptosStruct[];
}

export interface AptosExposedFunction {
  name: string;
  visibility: 'public' | 'private' | 'friend';
  is_entry: boolean;
  is_view: boolean;
  generic_type_params: any[];
  params: string[];
  return: string[];
}

export interface AptosStruct {
  name: string;
  is_native: boolean;
  abilities: string[];
  generic_type_params: any[];
  fields: AptosStructField[];
}

export interface AptosStructField {
  name: string;
  type: string;
}

export interface AptosToken {
  token_id: string;
  token_properties: Record<string, any>;
  amount: number;
  token_standard: string;
  token_uri?: string;
  collection_name?: string;
  collection_uri?: string;
  creator_address?: string;
  last_transaction_timestamp: string;
  last_transaction_version: string;
}

// Algorand Account Types
export interface AlgorandAccountBalance {
  assetId: number;
  symbol: string;
  name: string;
  amount: number;
  decimals: number;
  logoUrl: string;
}

export interface AlgorandAccountData {
  address: string;
  algoBalance: number; // ALGO balance in microalgos
  balances: AlgorandAccountBalance[]; // ASA balances
  network: string;
}

// API Functions

// Routes
export async function fetchRoutes(): Promise<RouteData[]> {
  const response = await fetch(`${API_BASE_URL}/api/routes`);
  if (!response.ok) {
    throw new Error('Failed to fetch routes');
  }
  return response.json();
}

export async function createRoute(payload: CreateRoutePayload): Promise<RouteData> {
  const response = await fetch(`${API_BASE_URL}/api/routes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Failed to create route' }));
    throw new Error(errorData.error || 'Failed to create route');
  }
  
  return response.json();
}

export async function updateRouteStatus(routeId: number, status: 'active' | 'completed' | 'cancelled'): Promise<RouteData> {
  const response = await fetch(`${API_BASE_URL}/api/routes/${routeId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Failed to update route status' }));
    throw new Error(errorData.error || 'Failed to update route status');
  }
  
  return response.json();
}

// Tokens
export async function fetchTokens(): Promise<Token[]> {
  const response = await fetch(`${API_BASE_URL}/api/tokens`);
  if (!response.ok) {
    throw new Error('Failed to fetch tokens');
  }
  return response.json();
}

export async function fetchTokensByNetwork(network: string): Promise<Token[]> {
  const response = await fetch(`${API_BASE_URL}/api/tokens/network/${network}`);
  if (!response.ok) {
    throw new Error('Failed to fetch tokens');
  }
  return response.json();
}

export async function fetchToken(tokenId: number): Promise<Token> {
  const response = await fetch(`${API_BASE_URL}/api/tokens/${tokenId}`);
  if (!response.ok) {
    throw new Error('Token not found');
  }
  return response.json();
}

// Address Book
export async function fetchAddressBook(ownerWallet: string): Promise<AddressBookEntry[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/address-book?owner_wallet=${ownerWallet}`
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch address book entries');
  }
  
  return response.json();
}

export async function createAddressBookEntry(
  payload: CreateAddressBookPayload
): Promise<AddressBookEntry> {
  const response = await fetch(`${API_BASE_URL}/api/address-book`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  
  if (!response.ok) {
    throw new Error('Failed to add entry');
  }
  
  return response.json();
}

export async function updateAddressBookEntry(
  id: number,
  payload: UpdateAddressBookPayload
): Promise<AddressBookEntry> {
  const response = await fetch(`${API_BASE_URL}/api/address-book/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  
  if (!response.ok) {
    throw new Error('Failed to update entry');
  }
  
  return response.json();
}

export async function deleteAddressBookEntry(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/address-book/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete entry');
  }
}

// Analytics types
export interface NetworkAnalytics {
  routes: number;
  tvl: string;
  routed: string;
}

export interface AnalyticsData {
  overall: {
    routes: number;
    tvl: string;
    routed: string;
  };
  networks: {
    aptos: NetworkAnalytics;
    algorand: NetworkAnalytics;
  };
}

// Analytics API
export async function getAnalytics(): Promise<AnalyticsData> {
  const response = await fetch(`${API_BASE_URL}/api/analytics`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch analytics');
  }
  
  return response.json();
}

// Route Types API
export async function fetchRouteTypes(network?: string): Promise<RouteType[]> {
  const url = network 
    ? `${API_BASE_URL}/api/route-types?network=${network}`
    : `${API_BASE_URL}/api/route-types`;
    
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error('Failed to fetch route types');
  }
  
  return response.json();
}

export async function fetchEnabledRouteTypes(network?: string): Promise<RouteType[]> {
  const url = network 
    ? `${API_BASE_URL}/api/route-types/enabled?network=${network}`
    : `${API_BASE_URL}/api/route-types/enabled`;
    
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error('Failed to fetch enabled route types');
  }
  
  return response.json();
}

