/**
 * Algorand transaction builders
 * Creates unsigned transactions for Waypoint operations
 */

import * as algokit from '@algorandfoundation/algokit-utils';
import { AlgoAmount } from '@algorandfoundation/algokit-utils/types/amount';
import { WaypointLinearFactory, WaypointLinearClient } from './waypoint-linearClient';
import type {
  AlgorandNetwork,
  CreateAlgorandLinearRouteParams,
  ClaimAlgorandRouteParams,
  CreateRouteResult,
  ClaimRouteResult,
} from './types';
import { ALGORAND_NETWORKS, TRANSACTION_FEES, DEFAULT_VALIDITY_WINDOW } from './constants';

/**
 * Transaction builder class for Algorand Waypoint operations
 */
export class AlgorandTransactions {
  private algorand: algokit.AlgorandClient;
  private network: AlgorandNetwork;
  private registryAppId: bigint;

  constructor(
    algorand: algokit.AlgorandClient,
    network: AlgorandNetwork,
    registryAppId?: bigint
  ) {
    this.algorand = algorand;
    this.network = network;
    this.registryAppId = registryAppId || ALGORAND_NETWORKS[network].registryAppId;
    
    // Set default validity window
    this.algorand.setDefaultValidityWindow(DEFAULT_VALIDITY_WINDOW);
  }

  /**
   * Create a new linear streaming route
   * This will:
   * 1. Create a new WaypointLinear app
   * 2. Initialize it with MBR payment
   * 3. Create the route with token transfer
   * 
   * @param params Route creation parameters
   * @returns Result with transaction IDs and route app ID
   */
  async createLinearRoute(
    params: CreateAlgorandLinearRouteParams
  ): Promise<CreateRouteResult> {
    try {
      // Set the signer
      this.algorand.setDefaultSigner(params.signer);

      // Create the app factory
      const factory = this.algorand.client.getTypedAppFactory(
        WaypointLinearFactory,
        {
          defaultSender: params.sender,
        }
      );
      
      factory.algorand.setDefaultSigner(params.signer);

      // Step 1: Create the application
      const { appClient } = await factory.send.create.createApplication({
        args: {
          registryAppId: this.registryAppId,
          tokenId: params.tokenId,
        },
        sender: params.sender,
        accountReferences: [params.sender],
        assetReferences: [params.tokenId],
      });

      console.log('WaypointLinear app created:', appClient.appId);

      // Set the transaction signer for the app client
      appClient.algorand.setDefaultSigner(params.signer);

      // Step 2: Initialize the app with MBR payment
      const initMbrTxn = await this.algorand.createTransaction.payment({
        amount: AlgoAmount.MicroAlgos(TRANSACTION_FEES.MBR),
        sender: params.sender,
        receiver: appClient.appAddress,
      });

      await appClient.send.initApp({
        args: { mbrTxn: initMbrTxn },
        sender: params.sender,
      });

      console.log('App initialized with MBR');

      // Step 3: Create the asset transfer transaction for the route
      const routeCreationAssetTransfer = 
        appClient.algorand.createTransaction.assetTransfer({
          amount: params.depositAmount,
          sender: params.sender,
          receiver: appClient.appAddress,
          assetId: params.tokenId,
        });

      // Step 4: Create the route
      const createRouteTxn = await appClient.send.createRoute({
        args: {
          beneficiary: params.beneficiary,
          startTs: params.startTimestamp,
          periodSecs: params.periodSeconds,
          payoutAmount: params.payoutAmount,
          maxPeriods: params.maxPeriods,
          depositAmount: params.depositAmount,
          tokenId: params.tokenId,
          tokenTransfer: routeCreationAssetTransfer,
        },
        sender: params.sender,
      });

      console.log('Route created successfully!');

      return {
        txIds: createRouteTxn.txIds,
        routeAppId: appClient.appId,
        routeAppAddress: appClient.appAddress.toString(),
      };
    } catch (error) {
      console.error('Error creating linear route:', error);
      throw error;
    }
  }

  /**
   * Claim from a linear streaming route
   * Beneficiary can claim all vested tokens
   * 
   * @param params Claim parameters
   * @returns Result with transaction ID and claimed amount
   */
  async claimFromRoute(
    params: ClaimAlgorandRouteParams
  ): Promise<ClaimRouteResult> {
    try {
      // Set the signer
      this.algorand.setDefaultSigner(params.signer);

      // Get the app client
      const appClient = new WaypointLinearClient({
        algorand: this.algorand,
        appId: params.routeAppId,
      });

      appClient.algorand.setDefaultSigner(params.signer);

      // Get current state to know how much will be claimed
      const stateBefore = await appClient.state.global.getAll();
      const claimedBefore = stateBefore?.claimedAmount || 0n;

      // Call claim
      const claimTxn = await appClient.send.claim({
        args: {},
        sender: params.beneficiary,
      });

      // Get new state
      const stateAfter = await appClient.state.global.getAll();
      const claimedAfter = stateAfter?.claimedAmount || 0n;

      const amountClaimed = claimedAfter - claimedBefore;

      console.log(`Claimed ${amountClaimed} tokens from route ${params.routeAppId}`);

      return {
        txId: claimTxn.txIds[0],
        claimedAmount: amountClaimed,
        totalClaimed: claimedAfter,
      };
    } catch (error) {
      console.error('Error claiming from route:', error);
      throw error;
    }
  }

  /**
   * Cancel/delete a route (if supported)
   * Note: Current implementation doesn't support route cancellation
   * This is a placeholder for future functionality
   */
  async cancelRoute(routeAppId: bigint, sender: string): Promise<string> {
    throw new Error('Route cancellation not yet implemented');
  }

  /**
   * Get the Algorand client (for advanced usage)
   */
  getAlgorandClient(): algokit.AlgorandClient {
    return this.algorand;
  }
}

