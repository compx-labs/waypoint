import { Aptos, InputViewFunctionData } from '@aptos-labs/ts-sdk';
import type { RouteDetails, ModuleConfig, Network } from '../types';
import { NETWORKS, VIEW_FUNCTIONS } from './constants';
import { formatRouteDetails, formatModuleConfig, calculateClaimableAmount, calculateMilestoneClaimableAmount } from '../utils/formatting';
import { validateRouteAddress } from '../utils/validation';

/**
 * Query class for reading on-chain state
 */
export class AptosQueries {
  constructor(
    private aptos: Aptos,
    private network: Network,
    private moduleAddress?: string
  ) {}

  /**
   * Get the module address for the current network
   */
  private getModuleAddress(): string {
    return this.moduleAddress || NETWORKS[this.network].moduleAddress;
  }

  /**
   * Get the linear module name
   */
  private getLinearModule(): string {
    const addr = this.getModuleAddress();
    return `${addr}::linear_stream_fa`;
  }

  /**
   * Get the milestone module name
   */
  private getMilestoneModule(): string {
    const addr = this.getModuleAddress();
    return `${addr}::milestone_stream_fa`;
  }

  /**
   * List all routes from the linear stream module
   */
  async listLinearRoutes(): Promise<string[]> {
    try {
      const payload: InputViewFunctionData = {
        function: `${this.getModuleAddress()}::${'linear_stream_fa'}::${VIEW_FUNCTIONS.LIST_ROUTES}`,
        functionArguments: [],
      };

      const result = await this.aptos.view({ payload });
      
      // Result should be an array of addresses
      if (Array.isArray(result) && result.length > 0 && Array.isArray(result[0])) {
        return result[0] as string[];
      }
      
      return [];
    } catch (error) {
      console.error('Error listing linear routes:', error);
      return [];
    }
  }

  /**
   * List all routes from the milestone stream module
   */
  async listMilestoneRoutes(): Promise<string[]> {
    try {
      const payload: InputViewFunctionData = {
        function: `${this.getModuleAddress()}::${'milestone_stream_fa'}::${VIEW_FUNCTIONS.LIST_ROUTES}`,
        functionArguments: [],
      };

      const result = await this.aptos.view({ payload });
      
      // Result should be an array of addresses
      if (Array.isArray(result) && result.length > 0 && Array.isArray(result[0])) {
        return result[0] as string[];
      }
      
      return [];
    } catch (error) {
      console.error('Error listing milestone routes:', error);
      return [];
    }
  }

  /**
   * Get route details from linear stream module
   */
  async getLinearRouteDetails(routeAddress: string): Promise<RouteDetails> {
    validateRouteAddress(routeAddress);

    try {
      const payload: InputViewFunctionData = {
        function: `${this.getModuleAddress()}::${'linear_stream_fa'}::${VIEW_FUNCTIONS.GET_ROUTE_CORE}`,
        functionArguments: [routeAddress],
      };

      const result = await this.aptos.view({ payload });
      
      if (!Array.isArray(result) || result.length < 9) {
        throw new Error('Invalid response from get_route_core');
      }

      // Parse the tuple response
      // (route_addr, depositor, beneficiary, start_ts, period_secs, payout_amount, max_periods, deposit_amount, claimed_amount)
      const raw = {
        routeAddress: result[0] as string,
        depositor: result[1] as string,
        beneficiary: result[2] as string,
        startTs: Number(result[3]),
        periodSecs: Number(result[4]),
        payoutAmount: String(result[5]),
        maxPeriods: Number(result[6]),
        depositAmount: String(result[7]),
        claimedAmount: String(result[8]),
      };

      // We don't have direct access to token metadata from view function
      // This would need to be tracked separately or passed in
      return formatRouteDetails(raw, '');
    } catch (error) {
      throw new Error(`Failed to get linear route details: ${error}`);
    }
  }

  /**
   * Get route details from milestone stream module
   */
  async getMilestoneRouteDetails(routeAddress: string): Promise<RouteDetails> {
    validateRouteAddress(routeAddress);

    try {
      const payload: InputViewFunctionData = {
        function: `${this.getModuleAddress()}::${'milestone_stream_fa'}::${VIEW_FUNCTIONS.GET_ROUTE_CORE}`,
        functionArguments: [routeAddress],
      };

      const result = await this.aptos.view({ payload });
      
      if (!Array.isArray(result) || result.length < 10) {
        throw new Error('Invalid response from get_route_core');
      }

      // Parse the tuple response (includes approved_amount for milestone)
      const raw = {
        routeAddress: result[0] as string,
        depositor: result[1] as string,
        beneficiary: result[2] as string,
        startTs: Number(result[3]),
        periodSecs: Number(result[4]),
        payoutAmount: String(result[5]),
        maxPeriods: Number(result[6]),
        depositAmount: String(result[7]),
        claimedAmount: String(result[8]),
        approvedAmount: String(result[9]),
      };

      return formatRouteDetails(raw, '');
    } catch (error) {
      throw new Error(`Failed to get milestone route details: ${error}`);
    }
  }

  /**
   * Calculate claimable amount for a linear route
   */
  async getLinearClaimableAmount(routeAddress: string, currentTimestamp?: number): Promise<bigint> {
    const route = await this.getLinearRouteDetails(routeAddress);
    return calculateClaimableAmount(route, currentTimestamp);
  }

  /**
   * Calculate claimable amount for a milestone route
   */
  async getMilestoneClaimableAmount(routeAddress: string, currentTimestamp?: number): Promise<bigint> {
    const route = await this.getMilestoneRouteDetails(routeAddress);
    return calculateMilestoneClaimableAmount(route, currentTimestamp);
  }

  /**
   * Get module configuration (simplified - actual implementation depends on contract structure)
   */
  async getConfig(): Promise<Partial<ModuleConfig>> {
    // Note: The actual implementation depends on how config is stored in the contract
    // This is a placeholder that returns basic info
    try {
      // Most config data is not directly queryable via view functions
      // Would need to read resources or have specific view functions
      return {
        admin: this.getModuleAddress(),
        treasury: this.getModuleAddress(),
      };
    } catch (error) {
      console.error('Error getting config:', error);
      return {};
    }
  }
}

