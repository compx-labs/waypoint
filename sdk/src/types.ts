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

/**
 * Invoice route status
 */
export enum InvoiceRouteStatus {
  UNINITIALIZED = 0,
  PENDING = 1,
  FUNDED = 2,
  DECLINED = 3,
}

/**
 * Invoice route details from on-chain data
 */
export interface InvoiceRouteDetails {
  routeAddress: string;
  payer: string;
  beneficiary: string;
  tokenMetadata: string;
  startTimestamp: number;
  periodSeconds: number;
  payoutAmount: bigint;
  maxPeriods: number;
  requestedAmount: bigint; // Gross invoice amount (before fees)
  feeAmount: bigint;
  depositAmount: bigint; // Net amount available to stream (after fees)
  claimedAmount: bigint;
  funded: boolean;
}

/**
 * Parameters for creating an invoice (two-phase: create then fund)
 */
export interface CreateInvoiceParams {
  /** Beneficiary address (creates the invoice) */
  beneficiary: string;
  /** Payer address (must fund the invoice) */
  payer: string;
  /** Token metadata object address */
  tokenMetadata: string;
  /** Gross invoice amount (before platform fees) */
  amount: bigint;
  /** Requested start timestamp (Unix timestamp in seconds) */
  startTimestamp: number;
  /** Period duration in seconds */
  periodSeconds: number;
  /** Amount to release per period */
  payoutAmount: bigint;
  /** Maximum number of periods */
  maxPeriods: number;
}

/**
 * Parameters for creating and funding an invoice in one transaction
 */
export interface CreateRouteAndFundParams {
  /** Creator/payer address (funds immediately) */
  creator: string;
  /** Beneficiary address (receives the payments) */
  beneficiary: string;
  /** Token metadata object address */
  tokenMetadata: string;
  /** Gross invoice amount (before platform fees) */
  amount: bigint;
  /** Start timestamp (Unix timestamp in seconds) */
  startTimestamp: number;
  /** Period duration in seconds */
  periodSeconds: number;
  /** Amount to release per period */
  payoutAmount: bigint;
  /** Maximum number of periods */
  maxPeriods: number;
}

/**
 * Parameters for funding an existing invoice
 */
export interface FundInvoiceParams {
  /** Payer address (must match route's payer) */
  payer: string;
  /** Route object address */
  routeAddress: string;
}

