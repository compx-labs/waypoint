/**
 * Algorand transaction builders
 * Creates unsigned transactions for Waypoint operations
 */

import * as algokit from "@algorandfoundation/algokit-utils";
import { AlgoAmount } from "@algorandfoundation/algokit-utils/types/amount";
import {
  WaypointLinearFactory,
  WaypointLinearClient,
} from "./waypoint-linearClient";
import {
  WaypointInvoiceFactory,
  WaypointInvoiceClient,
} from "./waypoint-invoiceClient";
import type {
  AlgorandNetwork,
  CreateAlgorandLinearRouteParams,
  ClaimAlgorandRouteParams,
  CreateRouteResult,
  ClaimRouteResult,
  CreateAlgorandInvoiceParams,
  AcceptAlgorandInvoiceParams,
  DeclineAlgorandInvoiceParams,
} from "./types";
import {
  ALGORAND_NETWORKS,
  TRANSACTION_FEES,
  DEFAULT_VALIDITY_WINDOW,
  NOMINATED_ASSET_FEE_TIERS,
  NON_NOMINATED_ASSET_FEE_TIERS,
  FEE_DENOMINATOR,
} from "./constants";

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
    this.registryAppId =
      registryAppId || ALGORAND_NETWORKS[network].registryAppId;

    // Set default validity window
    this.algorand.setDefaultValidityWindow(DEFAULT_VALIDITY_WINDOW);
  }

  /**
   * Calculate the fee for a route based on user tier and asset type
   * @param depositAmount Amount being deposited
   * @param userTier User's FLUX tier (0-4+)
   * @param tokenId Token asset ID
   * @param nominatedAssetId Nominated asset ID from registry
   * @returns Fee amount in token units
   */
  private calculateFee(
    depositAmount: bigint,
    userTier: number,
    tokenId: bigint,
    nominatedAssetId: bigint
  ): bigint {
    const isNominated = tokenId === nominatedAssetId;

    // Get fee basis points based on tier and asset type
    let feeBps: number;
    if (isNominated) {
      switch (userTier) {
        case 0:
          feeBps = NOMINATED_ASSET_FEE_TIERS.TIER_0;
          break;
        case 1:
          feeBps = NOMINATED_ASSET_FEE_TIERS.TIER_1;
          break;
        case 2:
          feeBps = NOMINATED_ASSET_FEE_TIERS.TIER_2;
          break;
        case 3:
          feeBps = NOMINATED_ASSET_FEE_TIERS.TIER_3;
          break;
        case 4:
        default:
          feeBps = NOMINATED_ASSET_FEE_TIERS.TIER_4;
      }
    } else {
      switch (userTier) {
        case 0:
          feeBps = NON_NOMINATED_ASSET_FEE_TIERS.TIER_0;
          break;
        case 1:
          feeBps = NON_NOMINATED_ASSET_FEE_TIERS.TIER_1;
          break;
        case 2:
          feeBps = NON_NOMINATED_ASSET_FEE_TIERS.TIER_2;
          break;
        case 3:
          feeBps = NON_NOMINATED_ASSET_FEE_TIERS.TIER_3;
          break;
        case 4:
        default:
          feeBps = NON_NOMINATED_ASSET_FEE_TIERS.TIER_4;
      }
    }

    // Calculate fee: (depositAmount * feeBps) / 10000
    return (depositAmount * BigInt(feeBps)) / FEE_DENOMINATOR;
  }

  /**
   * Create a new linear streaming route
   * This will:
   * 1. Create a new WaypointLinear app
   * 2. Initialize it with MBR payment
   * 3. Create the route with token transfer (including fee)
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

      console.log("WaypointLinear app created:", appClient.appId);

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

      console.log("App initialized with MBR");

      // Step 3: Calculate the fee and create the asset transfer transaction
      // The fee is calculated by the smart contract, but we need to include it in the transfer
      // Get user tier and nominated asset ID from params or default to tier 0
      const userTier = params.userTier || 0;
      const nominatedAssetId = params.nominatedAssetId || 0n;
      const fee = this.calculateFee(
        params.depositAmount,
        userTier,
        params.tokenId,
        nominatedAssetId
      );

      console.log(
        `Calculated fee: ${fee} (Tier ${userTier}, Deposit: ${params.depositAmount})`
      );

      const routeCreationAssetTransfer =
        appClient.algorand.createTransaction.assetTransfer({
          amount: params.depositAmount + fee, // Include fee in transfer amount
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

      console.log("Route created successfully!");

      return {
        txIds: createRouteTxn.txIds,
        routeAppId: appClient.appId,
        routeAppAddress: appClient.appAddress.toString(),
      };
    } catch (error) {
      console.error("Error creating linear route:", error);
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

      console.log(
        `Claimed ${amountClaimed} tokens from route ${params.routeAppId}`
      );

      return {
        txId: claimTxn.txIds[0],
        claimedAmount: amountClaimed,
        totalClaimed: claimedAfter,
      };
    } catch (error) {
      console.error("Error claiming from route:", error);
      throw error;
    }
  }

  /**
   * Cancel/delete a route (if supported)
   * Note: Current implementation doesn't support route cancellation
   * This is a placeholder for future functionality
   */
  async cancelRoute(routeAppId: bigint, sender: string): Promise<string> {
    throw new Error("Route cancellation not yet implemented");
  }

  /**
   * Create an invoice payment request
   * Requester creates a request that payer must approve and fund
   *
   * @param params Invoice request parameters
   * @returns Result with transaction IDs and route app ID
   */
  async createInvoiceRequest(
    params: CreateAlgorandInvoiceParams
  ): Promise<CreateRouteResult> {
    try {
      // Set the signer
      this.algorand.setDefaultSigner(params.signer);

      // Create the app factory
      const factory = this.algorand.client.getTypedAppFactory(
        WaypointInvoiceFactory,
        {
          defaultSender: params.requester,
        }
      );

      factory.algorand.setDefaultSigner(params.signer);

      // Step 1: Create the application
      const { appClient } = await factory.send.create.createApplication({
        args: {
          registryAppId: this.registryAppId,
          tokenId: params.tokenId,
        },
        sender: params.requester,
        accountReferences: [params.requester],
        assetReferences: [params.tokenId],
      });

      console.log("WaypointInvoice app created:", appClient.appId);

      // Set the transaction signer for the app client
      appClient.algorand.setDefaultSigner(params.signer);

      // Step 2: Initialize the app with MBR payment
      const initMbrTxn = await this.algorand.createTransaction.payment({
        amount: AlgoAmount.MicroAlgos(TRANSACTION_FEES.MBR),
        sender: params.requester,
        receiver: appClient.appAddress,
      });

      await appClient.send.initApp({
        args: { mbrTxn: initMbrTxn },
        sender: params.requester,
      });

      console.log("Invoice app initialized with MBR");

      // Step 3: Create the invoice request (no token transfer yet)
      const createRouteTxn = await appClient.send.createRoute({
        args: {
          beneficiary: params.beneficiary,
          payer: params.payer,
          startTs: params.startTimestamp,
          periodSecs: params.periodSeconds,
          payoutAmount: params.payoutAmount,
          maxPeriods: params.maxPeriods,
          depositAmount: params.grossInvoiceAmount,
          tokenId: params.tokenId,
        },
        sender: params.requester,
        appReferences: [this.registryAppId],
        accountReferences: [params.beneficiary, params.payer],
      });

      console.log("Invoice request created successfully!");

      return {
        txIds: createRouteTxn.txIds,
        routeAppId: appClient.appId,
        routeAppAddress: appClient.appAddress.toString(),
      };
    } catch (error) {
      console.error("Error creating invoice request:", error);
      throw error;
    }
  }

  /**
   * Accept and fund an invoice request
   * Payer approves the invoice and transfers tokens
   *
   * @param params Accept parameters
   * @returns Result with transaction ID
   */
  async acceptInvoiceRoute(
    params: AcceptAlgorandInvoiceParams
  ): Promise<{ txId: string }> {
    try {
      // Set the signer
      this.algorand.setDefaultSigner(params.signer);

      // Get the app client
      const appClient = new WaypointInvoiceClient({
        algorand: this.algorand,
        appId: params.routeAppId,
      });

      appClient.algorand.setDefaultSigner(params.signer);

      // Get invoice details to know the amount
      const state = await appClient.state.global.getAll();
      if (!state) {
        throw new Error("Invoice not found");
      }

      const grossAmount = state.grossDepositAmount || 0n;
      if (grossAmount === 0n) {
        throw new Error("Invalid invoice amount");
      }

      const tokenId = state.tokenId || 0n;
      if (tokenId === 0n) {
        throw new Error("Invalid token ID");
      }

      const beneficiary = state.beneficiary || "";
      const requester = state.requester || "";

      console.log(`Accepting invoice: ${grossAmount} tokens`);

      // Create asset transfer transaction
      const tokenTransfer = await this.algorand.createTransaction.assetTransfer(
        {
          amount: grossAmount,
          sender: params.payer,
          receiver: appClient.appAddress,
          assetId: tokenId,
        }
      );

      // Call acceptRoute
      const group = await appClient
        .newGroup()
        .gas({ args: {} })
        .acceptRoute({
          args: { tokenTransfer },
          sender: params.payer,
          appReferences: [this.registryAppId],
          accountReferences: [requester, beneficiary],
          assetReferences: [tokenId],
        })
        .send();

      console.log("Invoice accepted and funded!");

      return { txId: group.txIds[0] ?? "" };
    } catch (error) {
      console.error("Error accepting invoice:", error);
      throw error;
    }
  }

  /**
   * Decline an invoice request
   * Payer rejects the invoice
   *
   * @param params Decline parameters
   * @returns Result with transaction ID
   */
  async declineInvoiceRoute(
    params: DeclineAlgorandInvoiceParams
  ): Promise<{ txId: string }> {
    try {
      // Set the signer
      this.algorand.setDefaultSigner(params.signer);

      // Get the app client
      const appClient = new WaypointInvoiceClient({
        algorand: this.algorand,
        appId: params.routeAppId,
      });

      appClient.algorand.setDefaultSigner(params.signer);

      // Call declineRoute
      const declineTxn = await appClient.send.declineRoute({
        args: {},
        sender: params.payer,
      });

      console.log("Invoice declined");

      return {
        txId: declineTxn.txIds[0],
      };
    } catch (error) {
      console.error("Error declining invoice:", error);
      throw error;
    }
  }

  /**
   * Get the Algorand client (for advanced usage)
   */
  getAlgorandClient(): algokit.AlgorandClient {
    return this.algorand;
  }
}
