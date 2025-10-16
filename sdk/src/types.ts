/**
 * Network type for Waypoint SDK
 */
export type Network = 'mainnet' | 'testnet';

/**
 * Route type (simple linear or milestone-based)
 */
export type RouteType = 'simple' | 'milestone';

/**
 * Payment frequency unit
 */
export type FrequencyUnit = 'minutes' | 'hours' | 'days' | 'weeks' | 'months';

/**
 * Route status
 */
export type RouteStatus = 'active' | 'completed' | 'cancelled';

/**
 * Route details from on-chain data
 */
export interface RouteDetails {
  routeAddress: string;
  depositor: string;
  beneficiary: string;
  tokenMetadata: string;
  startTimestamp: number;
  periodSeconds: number;
  payoutAmount: bigint;
  maxPeriods: number;
  depositAmount: bigint;
  claimedAmount: bigint;
  approvedAmount?: bigint; // Only for milestone routes
}

/**
 * Module configuration from on-chain
 */
export interface ModuleConfig {
  admin: string;
  treasury: string;
  feeBps?: bigint;
  fluxOracleApp?: bigint;
  nominatedAssetId?: bigint;
}

/**
 * Parameters for creating a linear route
 */
export interface CreateLinearRouteParams {
  sender: string;
  beneficiary: string;
  tokenMetadata: string;
  amount: bigint;
  startTimestamp: number;
  periodSeconds: number;
  payoutAmount: bigint;
  maxPeriods: number;
}

/**
 * Parameters for creating a milestone route
 */
export interface CreateMilestoneRouteParams {
  sender: string;
  beneficiary: string;
  tokenMetadata: string;
  amount: bigint;
  startTimestamp: number;
  periodSeconds: number;
  payoutAmount: bigint;
  maxPeriods: number;
}

/**
 * Parameters for claiming from a route
 */
export interface ClaimParams {
  caller: string;
  routeAddress: string;
}

/**
 * Parameters for approving a milestone
 */
export interface ApproveMilestoneParams {
  caller: string;
  routeAddress: string;
  unlockAmount: bigint;
}

/**
 * Backend route registration data
 */
export interface BackendRouteData {
  sender: string;
  recipient: string;
  tokenId: number;
  amountTokenUnits: string;
  amountPerPeriodTokenUnits: string;
  startDate: Date;
  paymentFrequencyUnit: FrequencyUnit;
  paymentFrequencyNumber: number;
  blockchainTxHash: string;
  routeObjAddress: string;
  routeType: RouteType;
}

/**
 * SDK configuration options
 */
export interface WaypointClientConfig {
  network: Network;
  backendUrl?: string;
  moduleAddress?: string;
}

