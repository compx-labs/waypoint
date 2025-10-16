/**
 * Algorand blockchain query functions
 * Reads on-chain state from Waypoint contracts
 */

import * as algokit from '@algorandfoundation/algokit-utils';
import { WaypointLinearClient } from './waypoint-linearClient';
import { FluxGateClient } from './flux-gateClient';
import type {
  AlgorandNetwork,
  AlgorandRouteDetails,
  FluxTierInfo,
  RegistryStats,
} from './types';
import { ALGORAND_NETWORKS } from './constants';

/**
 * Query class for reading Algorand blockchain state
 */
export class AlgorandQueries {
  private algorand: algokit.AlgorandClient;
  private network: AlgorandNetwork;
  private registryAppId: bigint;
  private fluxOracleAppId: bigint;

  constructor(
    algorand: algokit.AlgorandClient,
    network: AlgorandNetwork,
    registryAppId?: bigint,
    fluxOracleAppId?: bigint
  ) {
    this.algorand = algorand;
    this.network = network;
    this.registryAppId = registryAppId || ALGORAND_NETWORKS[network].registryAppId;
    this.fluxOracleAppId = fluxOracleAppId || ALGORAND_NETWORKS[network].fluxOracleAppId;
  }

  /**
   * Get route details from a linear route app
   * @param routeAppId Route application ID
   * @returns Route details or null if not found
   */
  async getRouteDetails(routeAppId: bigint): Promise<AlgorandRouteDetails | null> {
    try {
      const appClient = new WaypointLinearClient({
        algorand: this.algorand,
        appId: routeAppId,
      });

      // Fetch global state
      const globalState = await appClient.state.global.getAll();

      if (!globalState) {
        return null;
      }

      return {
        routeId: routeAppId.toString(),
        tokenId: globalState.tokenId || 0n,
        depositor: globalState.depositor || '',
        beneficiary: globalState.beneficiary || '',
        startTimestamp: globalState.startTs || 0n,
        periodSeconds: globalState.periodSecs || 0n,
        payoutAmount: globalState.payoutAmount || 0n,
        maxPeriods: globalState.maxPeriods || 0n,
        depositAmount: globalState.depositAmount || 0n,
        claimedAmount: globalState.claimedAmount || 0n,
        feeBps: globalState.feeBps,
        treasury: globalState.treasury,
      };
    } catch (error) {
      console.error(`Error fetching route ${routeAppId}:`, error);
      return null;
    }
  }

  /**
   * Calculate claimable amount for a route at current time
   * @param routeAppId Route application ID
   * @returns Claimable amount in token base units
   */
  async calculateClaimableAmount(routeAppId: bigint): Promise<bigint> {
    try {
      const route = await this.getRouteDetails(routeAppId);
      if (!route) {
        return 0n;
      }

      const now = BigInt(Math.floor(Date.now() / 1000));
      
      // If not started yet
      if (now <= route.startTimestamp) {
        return 0n;
      }

      // Calculate periods elapsed
      const elapsed = now - route.startTimestamp;
      const periodsElapsed = elapsed / route.periodSeconds;
      
      // Cap at max periods
      const cappedPeriods = periodsElapsed > route.maxPeriods 
        ? route.maxPeriods 
        : periodsElapsed;

      // Calculate vested amount
      const vested = route.payoutAmount * cappedPeriods;
      const vestedCapped = vested > route.depositAmount ? route.depositAmount : vested;

      // Calculate claimable (vested - claimed)
      const claimable = vestedCapped > route.claimedAmount 
        ? vestedCapped - route.claimedAmount 
        : 0n;

      return claimable;
    } catch (error) {
      console.error(`Error calculating claimable amount:`, error);
      return 0n;
    }
  }

  /**
   * Get user's FLUX tier from FluxGate oracle
   * @param userAddress User's Algorand address
   * @returns Tier level (0-4)
   */
  async getUserFluxTier(userAddress: string): Promise<number> {
    try {
      if (this.fluxOracleAppId === 0n) {
        return 0; // No oracle configured
      }

      const appClient = new FluxGateClient({
        algorand: this.algorand,
        appId: this.fluxOracleAppId,
      });

      const record = await appClient.state.box.fluxRecords.value({
        userAddress,
      });

      if (record) {
        return Number(record.tier);
      }

      return 0;
    } catch (error) {
      console.error(`Error fetching FLUX tier for ${userAddress}:`, error);
      return 0;
    }
  }

  /**
   * Get FluxGate tier info for a user
   * @param userAddress User's Algorand address
   * @returns Tier information
   */
  async getFluxTierInfo(userAddress: string): Promise<FluxTierInfo> {
    const tier = await this.getUserFluxTier(userAddress);
    return {
      userAddress,
      tier,
    };
  }

  /**
   * Check if a route exists and is initialized
   * @param routeAppId Route application ID
   * @returns True if route exists
   */
  async routeExists(routeAppId: bigint): Promise<boolean> {
    try {
      const route = await this.getRouteDetails(routeAppId);
      return route !== null && route.tokenId > 0n;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get multiple route details in parallel
   * @param routeAppIds Array of route application IDs
   * @returns Array of route details (null for not found)
   */
  async getMultipleRoutes(
    routeAppIds: bigint[]
  ): Promise<(AlgorandRouteDetails | null)[]> {
    const promises = routeAppIds.map((appId) => this.getRouteDetails(appId));
    return Promise.all(promises);
  }

  /**
   * List all routes by querying the registry
   * Note: This is a placeholder - actual implementation would query the registry's box storage
   * @returns Array of route app IDs
   */
  async listAllRoutes(): Promise<string[]> {
    // TODO: Implement registry query to list all routes
    // This requires querying the registry's box storage which contains all route records
    console.warn('listAllRoutes not yet implemented - requires registry box storage query');
    return [];
  }

  /**
   * Get registry statistics
   * Note: This is a placeholder - requires registry client implementation
   * @returns Registry statistics
   */
  async getRegistryStats(): Promise<RegistryStats | null> {
    // TODO: Implement registry stats query
    console.warn('getRegistryStats not yet implemented - requires registry client');
    return null;
  }
}

