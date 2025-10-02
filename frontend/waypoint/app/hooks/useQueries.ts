// Custom React Query hooks for Waypoint

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import {
  fetchRoutes,
  fetchToken,
  fetchTokensByNetwork,
  fetchAddressBook,
  createRoute,
  createAddressBookEntry,
  updateAddressBookEntry,
  deleteAddressBookEntry,
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
} from '../lib/api';

// Query Keys
export const queryKeys = {
  routes: ['routes'] as const,
  tokens: ['tokens'] as const,
  tokensByNetwork: (network: string) => ['tokens', 'network', network] as const,
  token: (id: number) => ['tokens', id] as const,
  addressBook: (ownerWallet: string) => ['addressBook', ownerWallet] as const,
  aptosAccount: (address: string, network: string) => ['aptosAccount', address, network] as const,
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

// Known tokens configuration for Aptos Mainnet
interface TokenConfig {
  symbol: string;
  name: string;
  decimals: number;
  logoUrl: string;
  // For Coin standard (older)
  coinType?: string;
  // For Fungible Asset standard (newer)
  faMetadataAddress?: string;
}

const MAINNET_TOKENS: TokenConfig[] = [
  {
    symbol: 'APT',
    name: 'Aptos Coin',
    decimals: 8,
    logoUrl: '/aptos-logo.svg',
    coinType: '0x1::aptos_coin::AptosCoin',
  },
  // Add more tokens as they become available
  // Example USDC on Aptos (when available):
  // {
  //   symbol: 'USDC',
  //   name: 'USD Coin',
  //   decimals: 6,
  //   logoUrl: '/usdc-logo.svg',
  //   faMetadataAddress: '0x...', // FA metadata address
  // },
];

// Helper function to fetch balance using Coin standard
async function fetchCoinBalance(
  aptos: any,
  address: string,
  coinType: string
): Promise<number> {
  try {
    const [balanceStr] = await aptos.view<[string]>({
      payload: {
        function: "0x1::coin::balance",
        typeArguments: [coinType],
        functionArguments: [address]
      }
    });
    return parseInt(balanceStr, 10);
  } catch (error) {
    console.warn(`Failed to fetch coin balance for ${coinType}:`, error);
    return 0;
  }
}

// Helper function to fetch balance using Fungible Asset standard
async function fetchFABalance(
  aptos: any,
  address: string,
  faMetadataAddress: string
): Promise<number> {
  try {
    const [balanceStr] = await aptos.view<[string]>({
      payload: {
        function: "0x1::primary_fungible_store::balance",
        typeArguments: ["0x1::object::ObjectCore"],
        functionArguments: [address, faMetadataAddress]
      }
    });
    return parseInt(balanceStr, 10);
  } catch (error) {
    console.warn(`Failed to fetch FA balance for ${faMetadataAddress}:`, error);
    return 0;
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
      
      // Import Aptos client dynamically to avoid SSR issues
      const { Aptos, AptosConfig, Network } = await import('@aptos-labs/ts-sdk');
      
      // Default to MAINNET if network string is not recognized
      const aptosNetwork = network.toLowerCase() === 'devnet' || network.toLowerCase() === 'testnet' 
        ? Network.DEVNET 
        : Network.MAINNET;
      
      const config = new AptosConfig({ 
        network: aptosNetwork
      });
      const aptos = new Aptos(config);
      
      // Fetch account data in parallel
      const [modules, tokens, ledgerInfo] = await Promise.all([
        aptos.getAccountModules({ accountAddress: address }).catch(() => []),
        aptos.getAccountOwnedTokens({ accountAddress: address }).catch(() => []),
        aptos.getLedgerInfo(),
      ]);
      
      // Fetch balances for all known tokens in parallel
      const balancePromises = MAINNET_TOKENS.map(async (tokenConfig) => {
        let rawBalance = 0;
        
        // Try Coin standard first if available
        if (tokenConfig.coinType) {
          rawBalance = await fetchCoinBalance(aptos, address, tokenConfig.coinType);
        }
        
        // If no balance from Coin, try FA standard
        if (rawBalance === 0 && tokenConfig.faMetadataAddress) {
          rawBalance = await fetchFABalance(aptos, address, tokenConfig.faMetadataAddress);
        }
        
        // Only include tokens with non-zero balance or APT (always show APT)
        if (rawBalance > 0 || tokenConfig.symbol === 'APT') {
          return {
            symbol: tokenConfig.symbol,
            name: tokenConfig.name,
            amount: rawBalance / Math.pow(10, tokenConfig.decimals),
            decimals: tokenConfig.decimals,
            coinType: tokenConfig.coinType || tokenConfig.faMetadataAddress || '',
            logoUrl: tokenConfig.logoUrl,
          };
        }
        return null;
      });
      
      const balanceResults = await Promise.all(balancePromises);
      const balances: AptosAccountBalance[] = balanceResults.filter((b): b is AptosAccountBalance => b !== null);
      
      return {
        address,
        balances,
        modules: modules.map(module => ({
          address: module.address,
          name: module.name,
          bytecode: module.bytecode,
          friends: module.friends,
          exposed_functions: module.exposed_functions,
          structs: module.structs,
        })),
        tokens: tokens.map(token => ({
          token_id: token.token_id,
          token_properties: token.token_properties,
          amount: Number(token.amount),
          token_standard: token.token_standard,
          token_uri: token.token_uri,
          collection_name: token.collection_name,
          collection_uri: token.collection_uri,
          creator_address: token.creator_address,
          last_transaction_timestamp: token.last_transaction_timestamp,
          last_transaction_version: token.last_transaction_version,
        })),
        network: ledgerInfo.chain_id,
      };
    },
    enabled: !!address,
    staleTime: 1000 * 60 * 2, // Consider data fresh for 2 minutes
    gcTime: 1000 * 60 * 5, // Keep in cache for 5 minutes
    // Removed refetchInterval - only refetch when needed, not on a timer
    ...options,
  });
}
