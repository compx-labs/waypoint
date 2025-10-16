/**
 * Main Algorand Waypoint SDK Client
 * Provides a clean interface for interacting with Waypoint contracts on Algorand
 */

import * as algokit from '@algorandfoundation/algokit-utils';
import algosdk from 'algosdk';
import { AlgorandQueries } from './queries';
import { AlgorandTransactions } from './transactions';
import type {
  AlgorandClientConfig,
  AlgorandNetwork,
  CreateAlgorandLinearRouteParams,
  ClaimAlgorandRouteParams,
  AlgorandRouteDetails,
  FluxTierInfo,
  CreateRouteResult,
  ClaimRouteResult,
} from './types';
import { ALGORAND_NETWORKS } from './constants';

/**
 * Main Waypoint SDK client for Algorand
 * Provides transaction builders and state readers for Waypoint contracts
 */
export class AlgorandWaypointClient {
  private algorand: algokit.AlgorandClient;
  private queries: AlgorandQueries;
  private transactions: AlgorandTransactions;
  private network: AlgorandNetwork;
  private registryAppId: bigint;
  private fluxOracleAppId: bigint;

  /**
   * Create a new Algorand Waypoint SDK client
   * @param config Configuration options
   */
  constructor(config: AlgorandClientConfig) {
    this.network = config.network;
    this.registryAppId = config.registryAppId || ALGORAND_NETWORKS[config.network].registryAppId;
    this.fluxOracleAppId = config.fluxOracleAppId || ALGORAND_NETWORKS[config.network].fluxOracleAppId;

    // Initialize Algorand client
    if (config.algodUrl && config.algodToken) {
      // Custom Algod configuration
      const algod = new algosdk.Algodv2(
        config.algodToken,
        config.algodUrl,
        ''
      );
      
      const indexer = config.indexerUrl && config.indexerToken
        ? new algosdk.Indexer(config.indexerToken, config.indexerUrl, '')
        : undefined;

      this.algorand = algokit.AlgorandClient.fromClients({
        algod,
        indexer,
        kmd: undefined,
      });
    } else {
      // Use default network configuration
      if (config.network === 'mainnet') {
        this.algorand = algokit.AlgorandClient.mainNet();
        
        // Override with Nodely API for better reliability
        const api = new algosdk.Algodv2(
          ALGORAND_NETWORKS.mainnet.algodToken,
          ALGORAND_NETWORKS.mainnet.algodUrl,
          ''
        );
        
        this.algorand = algokit.AlgorandClient.fromClients({
          algod: api,
          indexer: this.algorand.client.indexer,
          kmd: undefined,
        });
      } else {
        this.algorand = algokit.AlgorandClient.testNet();
      }
    }

    // Initialize queries and transactions
    this.queries = new AlgorandQueries(
      this.algorand,
      this.network,
      this.registryAppId,
      this.fluxOracleAppId
    );
    
    this.transactions = new AlgorandTransactions(
      this.algorand,
      this.network,
      this.registryAppId
    );
  }

  /**
   * Get the underlying AlgorandClient (for advanced usage)
   */
  getAlgorandClient(): algokit.AlgorandClient {
    return this.algorand;
  }

  /**
   * Get the current network
   */
  getNetwork(): AlgorandNetwork {
    return this.network;
  }

  /**
   * Get the registry app ID
   */
  getRegistryAppId(): bigint {
    return this.registryAppId;
  }

  /**
   * Get the FluxGate oracle app ID
   */
  getFluxOracleAppId(): bigint {
    return this.fluxOracleAppId;
  }

  // ============================================================================
  // QUERY METHODS - Read blockchain state
  // ============================================================================

  /**
   * Get route details from the blockchain
   * @param routeAppId Route application ID
   * @returns Route details or null if not found
   */
  async getRouteDetails(routeAppId: bigint): Promise<AlgorandRouteDetails | null> {
    return this.queries.getRouteDetails(routeAppId);
  }

  /**
   * Calculate how much can be claimed from a route right now
   * @param routeAppId Route application ID
   * @returns Claimable amount in token base units
   */
  async calculateClaimableAmount(routeAppId: bigint): Promise<bigint> {
    return this.queries.calculateClaimableAmount(routeAppId);
  }

  /**
   * Get user's FLUX tier for fee discounts
   * @param userAddress User's Algorand address
   * @returns Tier level (0-4)
   */
  async getUserFluxTier(userAddress: string): Promise<number> {
    return this.queries.getUserFluxTier(userAddress);
  }

  /**
   * Get FluxGate tier information for a user
   * @param userAddress User's Algorand address
   * @returns Tier information
   */
  async getFluxTierInfo(userAddress: string): Promise<FluxTierInfo> {
    return this.queries.getFluxTierInfo(userAddress);
  }

  /**
   * Check if a route exists
   * @param routeAppId Route application ID
   * @returns True if route exists
   */
  async routeExists(routeAppId: bigint): Promise<boolean> {
    return this.queries.routeExists(routeAppId);
  }

  /**
   * Get multiple routes in parallel
   * @param routeAppIds Array of route application IDs
   * @returns Array of route details
   */
  async getMultipleRoutes(
    routeAppIds: bigint[]
  ): Promise<(AlgorandRouteDetails | null)[]> {
    return this.queries.getMultipleRoutes(routeAppIds);
  }

  /**
   * List all routes from the registry
   * @returns Array of route app IDs
   */
  async listAllRoutes(): Promise<string[]> {
    return this.queries.listAllRoutes();
  }

  // ============================================================================
  // TRANSACTION METHODS - Create and submit transactions
  // ============================================================================

  /**
   * Create a new linear streaming route
   * This performs all necessary steps:
   * 1. Creates the route app
   * 2. Initializes it
   * 3. Transfers tokens and creates the route
   * 
   * @param params Route creation parameters
   * @returns Result with transaction IDs and route app ID
   */
  async createLinearRoute(
    params: CreateAlgorandLinearRouteParams
  ): Promise<CreateRouteResult> {
    return this.transactions.createLinearRoute(params);
  }

  /**
   * Claim vested tokens from a route
   * @param params Claim parameters
   * @returns Result with transaction ID and claimed amount
   */
  async claimFromRoute(
    params: ClaimAlgorandRouteParams
  ): Promise<ClaimRouteResult> {
    return this.transactions.claimFromRoute(params);
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Calculate platform fee based on FLUX tier and nominated asset status
   * @param depositAmount Total deposit amount
   * @param userTier FLUX tier (0-4)
   * @param isNominatedAsset Whether using nominated asset
   * @returns Fee in token base units
   */
  calculatePlatformFee(
    depositAmount: bigint,
    userTier: number,
    isNominatedAsset: boolean
  ): bigint {
    // Import fee constants
    const { NOMINATED_ASSET_FEE_TIERS, NON_NOMINATED_ASSET_FEE_TIERS } = 
      require('./constants');

    const tiers = isNominatedAsset 
      ? NOMINATED_ASSET_FEE_TIERS 
      : NON_NOMINATED_ASSET_FEE_TIERS;

    let feeBps: number;
    if (userTier === 0) feeBps = tiers.TIER_0;
    else if (userTier === 1) feeBps = tiers.TIER_1;
    else if (userTier === 2) feeBps = tiers.TIER_2;
    else if (userTier === 3) feeBps = tiers.TIER_3;
    else feeBps = tiers.TIER_4;

    return (depositAmount * BigInt(feeBps)) / 10_000n;
  }

  /**
   * Validate an Algorand address
   * @param address Address to validate
   * @returns True if valid
   */
  isValidAddress(address: string): boolean {
    try {
      algosdk.decodeAddress(address);
      return true;
    } catch {
      return false;
    }
  }
}

