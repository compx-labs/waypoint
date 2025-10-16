import type { BackendRouteData, Network } from '../types';

/**
 * Backend API client for registering routes with Waypoint backend
 */
export class BackendAPIClient {
  private baseUrl: string;

  constructor(
    network: Network,
    customBackendUrl?: string
  ) {
    // Use custom URL if provided, otherwise default based on network
    this.baseUrl = customBackendUrl || this.getDefaultBackendUrl(network);
  }

  /**
   * Get default backend URL based on network
   */
  private getDefaultBackendUrl(network: Network): string {
    // These should be configured based on your actual backend URLs
    switch (network) {
      case 'mainnet':
        return process.env.WAYPOINT_MAINNET_API_URL || 'http://localhost:3001';
      case 'testnet':
        return process.env.WAYPOINT_TESTNET_API_URL || 'http://localhost:3001';
      default:
        return 'http://localhost:3001';
    }
  }

  /**
   * Register a route with the backend API
   * This makes the route visible in the Waypoint web app
   */
  async registerRoute(data: BackendRouteData): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/routes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sender: data.sender,
          recipient: data.recipient,
          token_id: data.tokenId,
          amount_token_units: data.amountTokenUnits,
          amount_per_period_token_units: data.amountPerPeriodTokenUnits,
          start_date: data.startDate.toISOString(),
          payment_frequency_unit: data.paymentFrequencyUnit,
          payment_frequency_number: data.paymentFrequencyNumber,
          blockchain_tx_hash: data.blockchainTxHash,
          route_obj_address: data.routeObjAddress,
          route_type: data.routeType,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Backend API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error registering route with backend:', error);
      throw new Error(`Failed to register route: ${error}`);
    }
  }

  /**
   * Get routes for a specific address from the backend
   */
  async getRoutes(address: string, filters?: {
    sender?: boolean;
    recipient?: boolean;
    status?: string;
  }): Promise<any[]> {
    try {
      const params = new URLSearchParams();
      
      if (filters?.sender) {
        params.append('sender', address);
      }
      if (filters?.recipient) {
        params.append('recipient', address);
      }
      if (filters?.status) {
        params.append('status', filters.status);
      }

      const url = `${this.baseUrl}/api/routes${params.toString() ? '?' + params.toString() : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Backend API error: ${response.status} - ${errorText}`);
      }

      const routes = await response.json();
      return routes;
    } catch (error) {
      console.error('Error getting routes from backend:', error);
      throw new Error(`Failed to get routes: ${error}`);
    }
  }

  /**
   * Get a specific route by ID from the backend
   */
  async getRouteById(id: number): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/routes/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Backend API error: ${response.status} - ${errorText}`);
      }

      const route = await response.json();
      return route;
    } catch (error) {
      console.error('Error getting route from backend:', error);
      throw new Error(`Failed to get route: ${error}`);
    }
  }

  /**
   * Update route status in the backend
   */
  async updateRouteStatus(id: number, status: 'active' | 'completed' | 'cancelled'): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/routes/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Backend API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error updating route status:', error);
      throw new Error(`Failed to update route status: ${error}`);
    }
  }
}

