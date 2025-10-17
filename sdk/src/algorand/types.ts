/**
 * Algorand-specific types for Waypoint SDK
 */

import type { TransactionSigner } from 'algosdk';

/**
 * Algorand network types
 */
export type AlgorandNetwork = 'mainnet' | 'testnet';

/**
 * Configuration for Algorand Waypoint Client
 */
export interface AlgorandClientConfig {
  /** Network to connect to */
  network: AlgorandNetwork;
  /** Optional: Registry app ID (will use default for network if not provided) */
  registryAppId?: bigint;
  /** Optional: FluxGate oracle app ID (will use default for network if not provided) */
  fluxOracleAppId?: bigint;
  /** Optional: Custom Algod API endpoint */
  algodUrl?: string;
  /** Optional: Custom Algod API token */
  algodToken?: string;
  /** Optional: Custom Indexer endpoint */
  indexerUrl?: string;
  /** Optional: Custom Indexer token */
  indexerToken?: string;
}

/**
 * Route details from Algorand blockchain
 */
export interface AlgorandRouteDetails {
  /** Route app ID */
  routeId: string;
  /** Token asset ID */
  tokenId: bigint;
  /** Depositor address */
  depositor: string;
  /** Beneficiary address */
  beneficiary: string;
  /** Start timestamp (seconds) */
  startTimestamp: bigint;
  /** Period in seconds */
  periodSeconds: bigint;
  /** Payout amount per period */
  payoutAmount: bigint;
  /** Maximum number of periods */
  maxPeriods: bigint;
  /** Total deposit amount */
  depositAmount: bigint;
  /** Amount claimed so far */
  claimedAmount: bigint;
  /** Fee in basis points */
  feeBps?: bigint;
  /** Treasury address */
  treasury?: string;
}

/**
 * Parameters for creating a linear route on Algorand
 */
export interface CreateAlgorandLinearRouteParams {
  /** Sender/depositor address */
  sender: string;
  /** Beneficiary address */
  beneficiary: string;
  /** Token asset ID */
  tokenId: bigint;
  /** Total deposit amount (in token base units) */
  depositAmount: bigint;
  /** Amount to release per period (in token base units) */
  payoutAmount: bigint;
  /** Start timestamp (Unix timestamp in seconds) */
  startTimestamp: bigint;
  /** Period duration in seconds */
  periodSeconds: bigint;
  /** Maximum number of periods */
  maxPeriods: bigint;
  /** Transaction signer */
  signer: TransactionSigner;
  /** Optional: User's FLUX tier (0-4+) for fee calculation. Defaults to 0 (no tier) */
  userTier?: number;
  /** Optional: Nominated asset ID for fee calculation. Will be fetched from registry if not provided */
  nominatedAssetId?: bigint;
}

/**
 * Parameters for claiming from an Algorand route
 */
export interface ClaimAlgorandRouteParams {
  /** Route app ID to claim from */
  routeAppId: bigint;
  /** Beneficiary address (must match route beneficiary) */
  beneficiary: string;
  /** Transaction signer */
  signer: TransactionSigner;
}

/**
 * FluxGate user tier information
 */
export interface FluxTierInfo {
  /** User address */
  userAddress: string;
  /** Tier level (0 = no tier, 1-4 = tiers) */
  tier: number;
}

/**
 * Registry statistics
 */
export interface RegistryStats {
  /** Total number of routes */
  numRoutes: bigint;
  /** Total value routed (all time) */
  totalRouted: bigint;
  /** Current active route total (TVL) */
  currentActiveTotal: bigint;
  /** Fee in basis points */
  feeBps: bigint;
  /** Treasury address */
  treasury: string;
  /** Nominated asset ID */
  nominatedAssetId: bigint;
}

/**
 * Result of creating a route
 */
export interface CreateRouteResult {
  /** Transaction IDs */
  txIds: string[];
  /** Created route app ID */
  routeAppId: bigint;
  /** Route app address */
  routeAppAddress: string;
}

/**
 * Result of claiming from a route
 */
export interface ClaimRouteResult {
  /** Transaction ID */
  txId: string;
  /** Amount claimed */
  claimedAmount: bigint;
  /** New total claimed amount */
  totalClaimed: bigint;
}

