import type { Network } from '../types';

/**
 * Network-specific configuration
 */
interface NetworkConfig {
  moduleAddress: string;
  linearModule: string;
  milestoneModule: string;
  backendUrl?: string;
}

/**
 * Network configurations for mainnet and testnet
 */
export const NETWORKS: Record<Network, NetworkConfig> = {
  mainnet: {
    moduleAddress: '0x12dd47c0156dc2237a6e814b227bb664f54e85332ff636a64bc9dd1ce7d1bdb0',
    linearModule: '0x12dd47c0156dc2237a6e814b227bb664f54e85332ff636a64bc9dd1ce7d1bdb0::linear_stream_fa',
    milestoneModule: '0x12dd47c0156dc2237a6e814b227bb664f54e85332ff636a64bc9dd1ce7d1bdb0::milestone_stream_fa',
    backendUrl: undefined, // To be configured
  },
  testnet: {
    // For now, testnet uses the same mainnet address until separate deployment
    moduleAddress: '0x12dd47c0156dc2237a6e814b227bb664f54e85332ff636a64bc9dd1ce7d1bdb0',
    linearModule: '0x12dd47c0156dc2237a6e814b227bb664f54e85332ff636a64bc9dd1ce7d1bdb0::linear_stream_fa',
    milestoneModule: '0x12dd47c0156dc2237a6e814b227bb664f54e85332ff636a64bc9dd1ce7d1bdb0::milestone_stream_fa',
    backendUrl: undefined, // To be configured
  },
};

/**
 * Fee calculation: 0.5% = 5 / 1000
 */
export const FEE_BASIS_POINTS = 5;
export const FEE_DENOMINATOR = 1000;

/**
 * Module entry function names
 */
export const ENTRY_FUNCTIONS = {
  LINEAR: {
    CREATE_ROUTE: 'create_route_and_fund',
    CLAIM: 'claim',
  },
  MILESTONE: {
    CREATE_ROUTE: 'create_route_and_fund',
    CLAIM: 'claim',
    APPROVE_MILESTONE: 'approve_milestone',
  },
} as const;

/**
 * View function names
 */
export const VIEW_FUNCTIONS = {
  LIST_ROUTES: 'list_routes',
  GET_ROUTE_CORE: 'get_route_core',
} as const;

