/**
 * Waypoint SDK for Aptos
 * 
 * A lightweight TypeScript SDK for interacting with Waypoint's token routing contracts on Aptos.
 * This SDK generates unsigned transactions and reads on-chain state - developers handle wallet
 * connections and transaction signing in their own applications.
 * 
 * @packageDocumentation
 */

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

