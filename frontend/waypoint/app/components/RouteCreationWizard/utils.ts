import { BlockchainNetwork } from "../../contexts/NetworkContext";

// Fee calculation utility
export interface FeeCalculation {
  feePercentage: number;
  feeBps: number;
  feeAmount: number;
}

export const calculateFee = (
  amount: number,
  network: BlockchainNetwork,
  tokenSymbol: string,
  fluxTier: number = 0
): FeeCalculation => {
  let feeBps: number;

  if (network === BlockchainNetwork.APTOS) {
    // Aptos always has 0.5% fees (50 bps)
    feeBps = 50;
  } else {
    // Algorand fees vary by token and Flux tier
    const isXUSD = tokenSymbol === "xUSD";

    if (isXUSD) {
      // xUSD base fee: 0.25% (25 bps)
      if (fluxTier === 0) feeBps = 25;
      else if (fluxTier === 1) feeBps = 20;
      else if (fluxTier === 2) feeBps = 15;
      else if (fluxTier === 3) feeBps = 12;
      else feeBps = 10; // Tier 4+
    } else {
      // Non-xUSD base fee: 0.5% (50 bps)
      if (fluxTier === 0) feeBps = 50;
      else if (fluxTier === 1) feeBps = 45;
      else if (fluxTier === 2) feeBps = 38;
      else if (fluxTier === 3) feeBps = 30;
      else feeBps = 20; // Tier 4+
    }
  }

  const feePercentage = feeBps / 10000;
  const feeAmount = amount * feePercentage;

  return { feePercentage, feeBps, feeAmount };
};

// Helper function to format duration in a human-readable way
export const formatDuration = (
  totalAmount: number,
  unlockAmount: number,
  unlockUnit: string
): string => {
  const totalPeriods = Math.ceil(totalAmount / unlockAmount);

  switch (unlockUnit) {
    case "minutes":
      if (totalPeriods < 60) return `~${totalPeriods} minutes`;
      const minHours = Math.floor(totalPeriods / 60);
      const minRemainingMinutes = totalPeriods % 60;
      if (minHours < 24) {
        return minRemainingMinutes > 0
          ? `~${minHours}h ${minRemainingMinutes}m`
          : `~${minHours} hours`;
      }
      const minDays = Math.floor(minHours / 24);
      const minRemainingHours = minHours % 24;
      return minRemainingHours > 0
        ? `~${minDays}d ${minRemainingHours}h`
        : `~${minDays} days`;

    case "hours":
      if (totalPeriods < 24) return `~${totalPeriods} hours`;
      const hourDays = Math.floor(totalPeriods / 24);
      const hourRemainingHours = totalPeriods % 24;
      return hourRemainingHours > 0
        ? `~${hourDays}d ${hourRemainingHours}h`
        : `~${hourDays} days`;

    case "days":
      if (totalPeriods < 7) return `~${totalPeriods} days`;
      const dayWeeks = Math.floor(totalPeriods / 7);
      const dayRemainingDays = totalPeriods % 7;
      return dayRemainingDays > 0
        ? `~${dayWeeks}w ${dayRemainingDays}d`
        : `~${dayWeeks} weeks`;

    case "weeks":
      if (totalPeriods < 4) return `~${totalPeriods} weeks`;
      const weekMonths = Math.floor(totalPeriods / 4);
      const weekRemainingWeeks = totalPeriods % 4;
      return weekRemainingWeeks > 0
        ? `~${weekMonths}mo ${weekRemainingWeeks}w`
        : `~${weekMonths} months`;

    case "months":
      if (totalPeriods < 12) return `~${totalPeriods} months`;
      const monthYears = Math.floor(totalPeriods / 12);
      const monthRemainingMonths = totalPeriods % 12;
      return monthRemainingMonths > 0
        ? `~${monthYears}y ${monthRemainingMonths}mo`
        : `~${monthYears} years`;

    default:
      return `~${totalPeriods} ${unlockUnit}`;
  }
};

// Helper function to convert time units to seconds
export const timeUnitToSeconds = (
  unit: "minutes" | "hours" | "days" | "weeks" | "months"
): number => {  
  switch (unit) {
    case "minutes":
      return 60;
    case "hours":
      return 60 * 60;
    case "days":
      return 60 * 60 * 24;
    case "weeks":
      return 60 * 60 * 24 * 7;
    case "months":
      return 60 * 60 * 24 * 30; // Approximate
    default:
      return 60 * 60 * 24; // Default to days
  }
};

