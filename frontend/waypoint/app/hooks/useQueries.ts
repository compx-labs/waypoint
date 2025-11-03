// Custom React Query hooks for Waypoint

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';
import {
  fetchRoutes,
  fetchToken,
  fetchTokensByNetwork,
  fetchAddressBook,
  createRoute,
  createAddressBookEntry,
  updateAddressBookEntry,
  deleteAddressBookEntry,
  getAnalytics,
  fetchEnabledRouteTypes,
  type RouteData,
  type Token,
  type AddressBookEntry,
  type CreateRoutePayload,
  type CreateAddressBookPayload,
  type UpdateAddressBookPayload,
  type AptosAccountData,
  type AptosAccountBalance,
  type AptosModule,
  type AptosToken,
  type AlgorandAccountData,
  type AlgorandAccountBalance,
  type AnalyticsData,
  type RouteType,
} from '../lib/api';

// Query Keys
export const queryKeys = {
  routes: ['routes'] as const,
  tokens: ['tokens'] as const,
  tokensByNetwork: (network: string) => ['tokens', 'network', network] as const,
  token: (id: number) => ['tokens', id] as const,
  addressBook: (ownerWallet: string) => ['addressBook', ownerWallet] as const,
  aptosAccount: (address: string, network: string) => ['aptosAccount', address, network] as const,
  algorandAccount: (address: string, network: string) => ['algorandAccount', address, network] as const,
  analytics: ['analytics'] as const,
  routeTypes: (network?: string) => network ? ['routeTypes', network] as const : ['routeTypes'] as const,
};

// Routes Queries
export function useRoutes(
  options?: Omit<UseQueryOptions<RouteData[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.routes,
    queryFn: fetchRoutes,
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    gcTime: 1000 * 60 * 10, // Keep in cache for 10 minutes
    ...options,
  });
}

export function useCreateRoute(
  options?: UseMutationOptions<RouteData, Error, CreateRoutePayload>
) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createRoute,
    onSuccess: () => {
      // Invalidate routes query to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.routes });
    },
    ...options,
  });
}

// Token Queries
export function useToken(
  tokenId: number | null,
  options?: Omit<UseQueryOptions<Token, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: tokenId ? queryKeys.token(tokenId) : ['tokens', 'null'],
    queryFn: () => {
      if (!tokenId) throw new Error('Token ID is required');
      return fetchToken(tokenId);
    },
    enabled: !!tokenId,
    staleTime: 1000 * 60 * 10, // Consider data fresh for 10 minutes (tokens don't change often)
    gcTime: 1000 * 60 * 30, // Keep in cache for 30 minutes
    ...options,
  });
}

export function useTokensByNetwork(
  network: string,
  options?: Omit<UseQueryOptions<Token[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.tokensByNetwork(network),
    queryFn: () => fetchTokensByNetwork(network),
    staleTime: 1000 * 60 * 10, // Consider data fresh for 10 minutes
    gcTime: 1000 * 60 * 30, // Keep in cache for 30 minutes
    ...options,
  });
}

// Address Book Queries
export function useAddressBook(
  ownerWallet: string | null,
  options?: Omit<UseQueryOptions<AddressBookEntry[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ownerWallet ? queryKeys.addressBook(ownerWallet) : ['addressBook', 'null'],
    queryFn: () => {
      if (!ownerWallet) throw new Error('Owner wallet is required');
      return fetchAddressBook(ownerWallet);
    },
    enabled: !!ownerWallet,
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    gcTime: 1000 * 60 * 10, // Keep in cache for 10 minutes
    ...options,
  });
}

export function useCreateAddressBookEntry(
  options?: UseMutationOptions<AddressBookEntry, Error, CreateAddressBookPayload>
) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createAddressBookEntry,
    onSuccess: (data) => {
      // Invalidate address book query for this owner
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.addressBook(data.owner_wallet) 
      });
    },
    ...options,
  });
}

export function useUpdateAddressBookEntry(
  options?: UseMutationOptions<
    AddressBookEntry,
    Error,
    { id: number; payload: UpdateAddressBookPayload }
  >
) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, payload }) => updateAddressBookEntry(id, payload),
    onSuccess: (data) => {
      // Invalidate address book query for this owner
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.addressBook(data.owner_wallet) 
      });
    },
    ...options,
  });
}

export function useDeleteAddressBookEntry(
  ownerWallet: string,
  options?: UseMutationOptions<void, Error, number>
) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteAddressBookEntry,
    onSuccess: () => {
      // Invalidate address book query for this owner
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.addressBook(ownerWallet) 
      });
    },
    ...options,
  });
}

// Helper function to fetch balance using Aptos REST API
async function fetchTokenBalance(
  address: string,
  tokenAddress: string,
  network: string
): Promise<string> {
  try {
    // Determine the correct API endpoint based on network
    const baseUrl = network.toLowerCase() === 'devnet' || network.toLowerCase() === 'testnet'
      ? 'https://fullnode.devnet.aptoslabs.com'
      : 'https://fullnode.mainnet.aptoslabs.com';
    
    const url = `${baseUrl}/v1/accounts/${address}/balance/${tokenAddress}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      // Token balance not found or account doesn't have this token
      if (response.status === 404) {
        return '0';
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    // The balance endpoint returns a plain number string
    const balance = await response.text();
    return balance || '0';
  } catch (error) {
    console.warn(`Failed to fetch balance for token ${tokenAddress}:`, error);
    return '0';
  }
}

// Aptos Account Queries
export function useAptosAccount(
  address: string | null,
  network: string = 'mainnet', // Default to mainnet
  options?: Omit<UseQueryOptions<AptosAccountData, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: address ? queryKeys.aptosAccount(address, network) : ['aptosAccount', 'null'],
    queryFn: async () => {
      if (!address) throw new Error('Address is required');
      
      // Default to MAINNET if network string is not recognized
      const aptosNetwork = network.toLowerCase() === 'devnet' || network.toLowerCase() === 'testnet' 
        ? Network.DEVNET 
        : Network.MAINNET;
      
      const config = new AptosConfig({ 
        network: aptosNetwork
      });
      const aptos = new Aptos(config);
      
      // Fetch tokens from backend to get contract addresses
      const tokensResponse = await fetchTokensByNetwork('aptos');
      
      // Fetch account data in parallel
      const [modules, tokensOwned, ledgerInfo] = await Promise.all([
        aptos.getAccountModules({ accountAddress: address }).catch(() => []),
        aptos.getAccountOwnedTokens({ accountAddress: address }).catch(() => []),
        aptos.getLedgerInfo(),
      ]);
      
      // Fetch balances for all tokens in parallel using the REST API
      const balancePromises = tokensResponse.map(async (token): Promise<AptosAccountBalance | null> => {
        if (!token.contract_address) {
          console.warn(`Token ${token.symbol} has no contract address`);
          return null;
        }
        
        const balanceStr = await fetchTokenBalance(address, token.contract_address, network);
        const rawBalance = parseInt(balanceStr, 10);
        
        // Only include tokens with non-zero balance
        if (rawBalance > 0) {
          return {
            symbol: token.symbol,
            name: token.name,
            amount: rawBalance / Math.pow(10, token.decimals),
            decimals: token.decimals,
            coinType: token.contract_address,
            logoUrl: token.logo_url || '/logo.svg',
          };
        }
        return null;
      });
      
      const balanceResults = await Promise.all(balancePromises);
      const balances = balanceResults.filter((b): b is AptosAccountBalance => b !== null);
      
      return {
        address,
        balances,
        modules: modules.map(module => ({
          address: module.abi?.address || '',
          name: module.abi?.name || '',
          bytecode: module.bytecode,
          friends: module.abi?.friends || [],
          exposed_functions: module.abi?.exposed_functions || [],
          structs: module.abi?.structs || [],
        })),
        tokens: tokensOwned.map(token => ({
          token_id: token.token_data_id || '',
          token_properties: token.token_properties_mutated_v1 || {},
          amount: Number(token.amount || 0),
          token_standard: token.token_standard,
          token_uri: token.current_token_data?.token_uri || '',
          collection_name: token.current_token_data?.current_collection?.collection_name || '',
          collection_uri: token.current_token_data?.current_collection?.uri || '',
          creator_address: token.current_token_data?.current_collection?.creator_address || '',
          last_transaction_timestamp: token.last_transaction_timestamp || '',
          last_transaction_version: token.last_transaction_version?.toString() || '',
        })),
        network: String(ledgerInfo.chain_id), // Convert to string
      };
    },
    enabled: !!address,
    staleTime: 1000 * 60 * 2, // Consider data fresh for 2 minutes
    gcTime: 1000 * 60 * 5, // Keep in cache for 5 minutes
    refetchInterval: 30000, // Automatically refetch every 30 seconds
    ...options,
  });
}

// Algorand Account Queries
export function useAlgorandAccount(
  address: string | null,
  network: string = 'mainnet', // Default to mainnet
  options?: Omit<UseQueryOptions<AlgorandAccountData, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: address ? queryKeys.algorandAccount(address, network) : ['algorandAccount', 'null'],
    queryFn: async () => {
      if (!address) throw new Error('Address is required');
      
      // Determine the correct API endpoint based on network
      const baseUrl = network.toLowerCase() === 'testnet'
        ? 'https://testnet-api.algonode.cloud'
        : 'https://mainnet-api.algonode.cloud';
      
      // Fetch account information from AlgoNode
      const accountUrl = `${baseUrl}/v2/accounts/${address}`;
      const response = await fetch(accountUrl);
      
      if (!response.ok) {
        if (response.status === 404) {
          // Account doesn't exist yet
          return {
            address,
            algoBalance: 0,
            balances: [],
            network,
          };
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const accountData = await response.json();
      
      // Extract ALGO balance (in microalgos)
      const algoBalance = accountData.amount || 0;
      
      // Fetch tokens from backend to get asset details
      const tokensResponse = await fetchTokensByNetwork('algorand');
      const tokenMap = new Map(tokensResponse.map(t => [parseInt(t.contract_address), t]));
      
      // Extract ASA balances
      const assetBalances: AlgorandAccountBalance[] = [];
      if (accountData.assets && Array.isArray(accountData.assets)) {
        for (const asset of accountData.assets) {
          const assetId = asset['asset-id'];
          const amount = asset.amount || 0;
          
          // Only include assets with non-zero balance
          if (amount > 0) {
            const tokenInfo = tokenMap.get(assetId);
            if (tokenInfo) {
              assetBalances.push({
                assetId,
                symbol: tokenInfo.symbol,
                name: tokenInfo.name,
                amount: amount / Math.pow(10, tokenInfo.decimals),
                decimals: tokenInfo.decimals,
                logoUrl: tokenInfo.logo_url || '/logo.svg',
              });
            }
          }
        }
      }
      
      return {
        address,
        algoBalance,
        balances: assetBalances,
        network,
      };
    },
    enabled: !!address,
    staleTime: 1000 * 60 * 2, // Consider data fresh for 2 minutes
    gcTime: 1000 * 60 * 5, // Keep in cache for 5 minutes
    refetchInterval: 30000, // Automatically refetch every 30 seconds
    ...options,
  });
}

// Analytics Queries
export function useAnalytics(
  options?: Omit<UseQueryOptions<AnalyticsData, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.analytics,
    queryFn: getAnalytics,
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    gcTime: 1000 * 60 * 10, // Keep in cache for 10 minutes
    ...options,
  });
}

// Route Types Queries
export function useRouteTypes(
  network?: string,
  options?: Omit<UseQueryOptions<RouteType[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.routeTypes(network),
    queryFn: () => fetchEnabledRouteTypes(network),
    staleTime: 1000 * 60 * 10, // Consider data fresh for 10 minutes (route types don't change often)
    gcTime: 1000 * 60 * 30, // Keep in cache for 30 minutes
    ...options,
  });
}
