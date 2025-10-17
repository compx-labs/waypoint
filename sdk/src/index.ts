/**
 * Waypoint SDK for Aptos and Algorand
 * 
 * A lightweight TypeScript SDK for interacting with Waypoint's token routing contracts.
 * This SDK generates unsigned transactions and reads on-chain state - developers handle wallet
 * connections and transaction signing in their own applications.
 * 
 * @packageDocumentation
 */

// ============================================================================
// APTOS
// ============================================================================

// Main client
export { AptosWaypointClient } from './aptos/client';

// Types
export type {
  Network,
  RouteType,
  FrequencyUnit,
  RouteStatus,
  RouteDetails,
  ModuleConfig,
  CreateLinearRouteParams,
  CreateMilestoneRouteParams,
  ClaimParams,
  ApproveMilestoneParams,
  BackendRouteData,
  WaypointClientConfig,
} from './types';

// Constants
export { NETWORKS, FEE_BASIS_POINTS, FEE_DENOMINATOR } from './aptos/constants';

// Utility functions
export { calculateFee, calculateClaimableAmount, calculateMilestoneClaimableAmount } from './utils/formatting';
export { isValidAptosAddress } from './utils/validation';

// ============================================================================
// ALGORAND
// ============================================================================

// Main client
export { AlgorandWaypointClient } from './algorand/client';

// Types
export type {
  AlgorandNetwork,
  AlgorandClientConfig,
  AlgorandRouteDetails,
  CreateAlgorandLinearRouteParams,
  ClaimAlgorandRouteParams,
  FluxTierInfo,
  RegistryStats,
  CreateRouteResult,
  ClaimRouteResult,
} from './algorand/types';

// Constants
export {
  ALGORAND_NETWORKS,
  TRANSACTION_FEES,
  NOMINATED_ASSET_FEE_TIERS,
  NON_NOMINATED_ASSET_FEE_TIERS,
  FEE_DENOMINATOR as ALGORAND_FEE_DENOMINATOR,
  DEFAULT_VALIDITY_WINDOW,
} from './algorand/constants';

// Contract clients (for advanced usage)
export { WaypointLinearClient, WaypointLinearFactory } from './algorand/waypoint-linearClient';
export { FluxGateClient, FluxGateFactory } from './algorand/flux-gateClient';

