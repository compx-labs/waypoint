/**
 * Algorand-specific constants for Waypoint SDK
 */

/**
 * Default Algorand network configurations
 */
export const ALGORAND_NETWORKS = {
  mainnet: {
    registryAppId: BigInt(3253603509),
    fluxOracleAppId: BigInt(3219204562),
    algodUrl: 'https://mainnet-api.4160.nodely.dev',
    algodToken: 'F10D011013C676F2EAEC6EBBFD82DC63',
    indexerUrl: 'https://mainnet-idx.algonode.cloud',
    indexerToken: '',
  },
  testnet: {
    registryAppId: BigInt(0), // TODO: Deploy testnet contracts
    fluxOracleAppId: BigInt(0), // TODO: Deploy testnet contracts
    algodUrl: 'https://testnet-api.4160.nodely.dev',
    algodToken: '',
    indexerUrl: 'https://testnet-idx.algonode.cloud',
    indexerToken: '',
  },
} as const;

/**
 * Transaction fee constants (in microALGOs)
 */
export const TRANSACTION_FEES = {
  STANDARD: 1_000n, // 0.001 ALGO
  REGISTRY: 20_000n, // 0.02 ALGO for registry calls
  MBR: 400_000n, // 0.4 ALGO for app initialization
} as const;

/**
 * Fee tiers for FLUX holders using nominated assets (in basis points)
 */
export const NOMINATED_ASSET_FEE_TIERS = {
  TIER_0: 25, // No FLUX: 0.25%
  TIER_1: 20, // Tier 1: 0.20%
  TIER_2: 15, // Tier 2: 0.15%
  TIER_3: 12, // Tier 3: 0.12%
  TIER_4: 10, // Tier 4+: 0.10%
} as const;

/**
 * Fee tiers for FLUX holders using non-nominated assets (in basis points)
 */
export const NON_NOMINATED_ASSET_FEE_TIERS = {
  TIER_0: 50, // No FLUX: 0.50%
  TIER_1: 45, // Tier 1: 0.45%
  TIER_2: 38, // Tier 2: 0.38%
  TIER_3: 30, // Tier 3: 0.30%
  TIER_4: 20, // Tier 4+: 0.20%
} as const;

/**
 * Fee denominator (basis points)
 */
export const FEE_DENOMINATOR = 10_000n;

/**
 * Default validity window for transactions (in rounds)
 */
export const DEFAULT_VALIDITY_WINDOW = 1000;

