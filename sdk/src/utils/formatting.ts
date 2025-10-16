import type { RouteDetails, ModuleConfig } from '../types';
import type { RawRouteData, RawConfigData } from '../aptos/types';
import { FEE_BASIS_POINTS, FEE_DENOMINATOR } from '../aptos/constants';

/**
 * Format raw route data from Aptos into RouteDetails
 */
export function formatRouteDetails(raw: RawRouteData, tokenMetadata: string): RouteDetails {
  return {
    routeAddress: raw.routeAddress,
    depositor: raw.depositor,
    beneficiary: raw.beneficiary,
    tokenMetadata,
    startTimestamp: raw.startTs,
    periodSeconds: raw.periodSecs,
    payoutAmount: BigInt(raw.payoutAmount),
    maxPeriods: raw.maxPeriods,
    depositAmount: BigInt(raw.depositAmount),
    claimedAmount: BigInt(raw.claimedAmount),
    approvedAmount: raw.approvedAmount ? BigInt(raw.approvedAmount) : undefined,
  };
}

/**
 * Format raw config data from Aptos into ModuleConfig
 */
export function formatModuleConfig(raw: RawConfigData): ModuleConfig {
  return {
    admin: raw.admin,
    treasury: raw.treasury,
    feeBps: raw.feeBps ? BigInt(raw.feeBps) : undefined,
    fluxOracleApp: raw.fluxOracleApp ? BigInt(raw.fluxOracleApp) : undefined,
    nominatedAssetId: raw.nominatedAssetId ? BigInt(raw.nominatedAssetId) : undefined,
  };
}

/**
 * Calculate the protocol fee (0.5% of amount)
 */
export function calculateFee(amount: bigint): bigint {
  return (amount * BigInt(FEE_BASIS_POINTS)) / BigInt(FEE_DENOMINATOR);
}

/**
 * Calculate claimable amount based on route details and current time
 */
export function calculateClaimableAmount(
  route: RouteDetails,
  currentTimestamp?: number
): bigint {
  const now = currentTimestamp ?? Math.floor(Date.now() / 1000);

  // If current time is before start, nothing is vested
  if (now <= route.startTimestamp) {
    return 0n;
  }

  // Calculate elapsed time and periods
  const elapsed = now - route.startTimestamp;
  const periodsElapsed = Math.floor(elapsed / route.periodSeconds);
  const cappedPeriods = Math.min(periodsElapsed, route.maxPeriods);

  // Calculate vested amount
  const vestedCandidate = route.payoutAmount * BigInt(cappedPeriods);
  const vested = vestedCandidate > route.depositAmount ? route.depositAmount : vestedCandidate;

  // Subtract already claimed amount
  const claimable = vested > route.claimedAmount ? vested - route.claimedAmount : 0n;

  return claimable;
}

/**
 * Calculate claimable amount for milestone routes
 */
export function calculateMilestoneClaimableAmount(
  route: RouteDetails,
  currentTimestamp?: number
): bigint {
  if (!route.approvedAmount) {
    return 0n;
  }

  const now = currentTimestamp ?? Math.floor(Date.now() / 1000);

  // If current time is before start, nothing is vested
  if (now <= route.startTimestamp) {
    return 0n;
  }

  // Calculate elapsed time and periods
  const elapsed = now - route.startTimestamp;
  const periodsElapsed = Math.floor(elapsed / route.periodSeconds);
  const cappedPeriods = Math.min(periodsElapsed, route.maxPeriods);

  // Calculate vested amount based on approved amount
  const vestedCandidate = route.payoutAmount * BigInt(cappedPeriods);
  const vested =
    vestedCandidate > route.approvedAmount ? route.approvedAmount : vestedCandidate;

  // Subtract already claimed amount
  const claimable = vested > route.claimedAmount ? vested - route.claimedAmount : 0n;

  return claimable;
}

