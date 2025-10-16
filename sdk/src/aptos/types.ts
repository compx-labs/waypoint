/**
 * Aptos-specific type definitions
 */

/**
 * Raw route data from Aptos view function
 * Corresponds to the tuple returned by get_route_core view function
 */
export interface RawRouteData {
  routeAddress: string;
  depositor: string;
  beneficiary: string;
  startTs: number;
  periodSecs: number;
  payoutAmount: string;
  maxPeriods: number;
  depositAmount: string;
  claimedAmount: string;
  approvedAmount?: string; // Only for milestone routes
}

/**
 * Raw config data from Aptos
 */
export interface RawConfigData {
  admin: string;
  treasury: string;
  feeBps?: string;
  fluxOracleApp?: string;
  nominatedAssetId?: string;
}

