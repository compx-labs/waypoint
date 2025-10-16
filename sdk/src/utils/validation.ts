import type { CreateLinearRouteParams, CreateMilestoneRouteParams } from '../types';

/**
 * Validate address format (basic Aptos address check)
 */
export function isValidAptosAddress(address: string): boolean {
  if (!address) return false;
  // Aptos addresses are 64 hex characters with 0x prefix, or can be shorter
  return /^0x[a-fA-F0-9]{1,64}$/.test(address);
}

/**
 * Validate create linear route parameters
 */
export function validateCreateLinearRouteParams(params: CreateLinearRouteParams): void {
  if (!isValidAptosAddress(params.sender)) {
    throw new Error(`Invalid sender address: ${params.sender}`);
  }
  if (!isValidAptosAddress(params.beneficiary)) {
    throw new Error(`Invalid beneficiary address: ${params.beneficiary}`);
  }
  if (!isValidAptosAddress(params.tokenMetadata)) {
    throw new Error(`Invalid token metadata address: ${params.tokenMetadata}`);
  }
  if (params.amount <= 0n) {
    throw new Error('Amount must be greater than 0');
  }
  if (params.periodSeconds <= 0) {
    throw new Error('Period seconds must be greater than 0');
  }
  if (params.payoutAmount <= 0n) {
    throw new Error('Payout amount must be greater than 0');
  }
  if (params.maxPeriods <= 0) {
    throw new Error('Max periods must be greater than 0');
  }
  if (params.startTimestamp < 0) {
    throw new Error('Start timestamp must be non-negative');
  }

  // Validate that deposit doesn't exceed schedule
  const scheduleTotal = params.payoutAmount * BigInt(params.maxPeriods);
  if (params.amount > scheduleTotal) {
    throw new Error(
      `Deposit amount (${params.amount}) exceeds schedule total (${scheduleTotal})`
    );
  }
}

/**
 * Validate create milestone route parameters
 */
export function validateCreateMilestoneRouteParams(params: CreateMilestoneRouteParams): void {
  // Same validation as linear routes
  validateCreateLinearRouteParams(params);
}

/**
 * Validate route address
 */
export function validateRouteAddress(address: string): void {
  if (!isValidAptosAddress(address)) {
    throw new Error(`Invalid route address: ${address}`);
  }
}

/**
 * Validate caller address
 */
export function validateCallerAddress(address: string): void {
  if (!isValidAptosAddress(address)) {
    throw new Error(`Invalid caller address: ${address}`);
  }
}

