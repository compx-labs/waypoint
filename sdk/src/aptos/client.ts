import { Aptos, AptosConfig, Network as AptosNetwork } from '@aptos-labs/ts-sdk';
import type {
  Network,
  WaypointClientConfig,
  CreateLinearRouteParams,
  CreateMilestoneRouteParams,
  ClaimParams,
  ApproveMilestoneParams,
  RouteDetails,
  BackendRouteData,
} from '../types';
import { AptosQueries } from './queries';
import { AptosTransactions } from './transactions';
import { BackendAPIClient } from '../api/backend';
import { calculateFee } from '../utils/formatting';

/**
 * Main Waypoint SDK client for Aptos
 * Provides transaction builders and state readers for Waypoint contracts
 */
export class AptosWaypointClient {
  private aptos: Aptos;
  private queries: AptosQueries;
  private transactions: AptosTransactions;
  private backend?: BackendAPIClient;
  private network: Network;
  private moduleAddress?: string;

  /**
   * Create a new Waypoint SDK client
   * @param config Configuration options
   */
  constructor(config: WaypointClientConfig) {
    this.network = config.network;
    this.moduleAddress = config.moduleAddress;

    // Initialize Aptos SDK
    const aptosNetwork = config.network === 'mainnet' ? AptosNetwork.MAINNET : AptosNetwork.TESTNET;
    const aptosConfig = new AptosConfig({ network: aptosNetwork });
    this.aptos = new Aptos(aptosConfig);

    // Initialize queries and transactions
    this.queries = new AptosQueries(this.aptos, this.network, this.moduleAddress);
    this.transactions = new AptosTransactions(this.aptos, this.network, this.moduleAddress);

    // Initialize backend client if URL provided or use default
    if (config.backendUrl !== undefined) {
      this.backend = new BackendAPIClient(this.network, config.backendUrl);
    }
  }

  /**
   * Get the underlying Aptos client (for advanced usage)
   */
  getAptosClient(): Aptos {
    return this.aptos;
  }

  /**
   * Get the current network
   */
  getNetwork(): Network {
    return this.network;
  }

  // ============================================================================
  // LINEAR ROUTE METHODS
  // ============================================================================

  /**
   * Build an unsigned transaction to create a linear streaming route
   * Developer must sign and submit this transaction
   * 
   * @param params Route creation parameters
   * @returns Unsigned transaction ready to be signed
   */
  async buildCreateLinearRouteTransaction(params: CreateLinearRouteParams) {
    return this.transactions.buildCreateLinearRouteTransaction(params);
  }

  /**
   * Build an unsigned transaction to claim from a linear route
   * Developer must sign and submit this transaction
   * 
   * @param params Claim parameters
   * @returns Unsigned transaction ready to be signed
   */
  async buildClaimLinearTransaction(params: ClaimParams) {
    return this.transactions.buildClaimLinearTransaction(params);
  }

  /**
   * Get all linear routes from the contract
   * @returns Array of route addresses
   */
  async listLinearRoutes(): Promise<string[]> {
    return this.queries.listLinearRoutes();
  }

  /**
   * Get details for a specific linear route
   * @param routeAddress The route object address
   * @returns Route details
   */
  async getLinearRouteDetails(routeAddress: string): Promise<RouteDetails> {
    return this.queries.getLinearRouteDetails(routeAddress);
  }

  /**
   * Calculate claimable amount for a linear route
   * @param routeAddress The route object address
   * @param currentTimestamp Optional timestamp (defaults to now)
   * @returns Claimable amount in smallest token units
   */
  async getLinearClaimableAmount(routeAddress: string, currentTimestamp?: number): Promise<bigint> {
    return this.queries.getLinearClaimableAmount(routeAddress, currentTimestamp);
  }

  // ============================================================================
  // MILESTONE ROUTE METHODS
  // ============================================================================

  /**
   * Build an unsigned transaction to create a milestone-based route
   * Developer must sign and submit this transaction
   * 
   * @param params Route creation parameters
   * @returns Unsigned transaction ready to be signed
   */
  async buildCreateMilestoneRouteTransaction(params: CreateMilestoneRouteParams) {
    return this.transactions.buildCreateMilestoneRouteTransaction(params);
  }

  /**
   * Build an unsigned transaction to claim from a milestone route
   * Developer must sign and submit this transaction
   * 
   * @param params Claim parameters
   * @returns Unsigned transaction ready to be signed
   */
  async buildClaimMilestoneTransaction(params: ClaimParams) {
    return this.transactions.buildClaimMilestoneTransaction(params);
  }

  /**
   * Build an unsigned transaction to approve a milestone (depositor only)
   * Developer must sign and submit this transaction
   * 
   * @param params Approval parameters
   * @returns Unsigned transaction ready to be signed
   */
  async buildApproveMilestoneTransaction(params: ApproveMilestoneParams) {
    return this.transactions.buildApproveMilestoneTransaction(params);
  }

  /**
   * Get all milestone routes from the contract
   * @returns Array of route addresses
   */
  async listMilestoneRoutes(): Promise<string[]> {
    return this.queries.listMilestoneRoutes();
  }

  /**
   * Get details for a specific milestone route
   * @param routeAddress The route object address
   * @returns Route details
   */
  async getMilestoneRouteDetails(routeAddress: string): Promise<RouteDetails> {
    return this.queries.getMilestoneRouteDetails(routeAddress);
  }

  /**
   * Calculate claimable amount for a milestone route
   * @param routeAddress The route object address
   * @param currentTimestamp Optional timestamp (defaults to now)
   * @returns Claimable amount in smallest token units
   */
  async getMilestoneClaimableAmount(routeAddress: string, currentTimestamp?: number): Promise<bigint> {
    return this.queries.getMilestoneClaimableAmount(routeAddress, currentTimestamp);
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Calculate the protocol fee for a given amount (0.5%)
   * @param amount Amount in smallest token units
   * @returns Fee amount in smallest token units
   */
  calculateFee(amount: bigint): bigint {
    return calculateFee(amount);
  }

  /**
   * Get module configuration
   * @returns Partial module configuration
   */
  async getConfig() {
    return this.queries.getConfig();
  }

  // ============================================================================
  // BACKEND API METHODS (OPTIONAL)
  // ============================================================================

  /**
   * Register a route with the Waypoint backend (optional but recommended)
   * This makes the route visible in the Waypoint web app
   * 
   * @param data Route data to register
   */
  async registerRouteWithBackend(data: BackendRouteData): Promise<void> {
    if (!this.backend) {
      // Initialize backend with default URL if not already done
      this.backend = new BackendAPIClient(this.network);
    }
    return this.backend.registerRoute(data);
  }

  /**
   * Get routes for an address from the backend
   * @param address Wallet address
   * @param filters Optional filters
   */
  async getBackendRoutes(address: string, filters?: {
    sender?: boolean;
    recipient?: boolean;
    status?: string;
  }): Promise<any[]> {
    if (!this.backend) {
      this.backend = new BackendAPIClient(this.network);
    }
    return this.backend.getRoutes(address, filters);
  }

  /**
   * Get a specific route by ID from the backend
   * @param id Route ID
   */
  async getBackendRouteById(id: number): Promise<any> {
    if (!this.backend) {
      this.backend = new BackendAPIClient(this.network);
    }
    return this.backend.getRouteById(id);
  }

  /**
   * Update route status in the backend
   * @param id Route ID
   * @param status New status
   */
  async updateBackendRouteStatus(id: number, status: 'active' | 'completed' | 'cancelled'): Promise<void> {
    if (!this.backend) {
      this.backend = new BackendAPIClient(this.network);
    }
    return this.backend.updateRouteStatus(id, status);
  }
}

