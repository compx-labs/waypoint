import { Aptos, InputGenerateTransactionPayloadData } from "@aptos-labs/ts-sdk";
import type {
  Network,
  CreateLinearRouteParams,
  CreateMilestoneRouteParams,
  ClaimParams,
  ApproveMilestoneParams,
  CreateInvoiceParams,
  CreateRouteAndFundParams,
  FundInvoiceParams,
} from "../types";
import { NETWORKS, ENTRY_FUNCTIONS } from "./constants";
import {
  validateCreateLinearRouteParams,
  validateCreateMilestoneRouteParams,
  validateRouteAddress,
  validateCallerAddress,
} from "../utils/validation";
import { calculateFee } from "../utils/formatting";

/**
 * Transaction builder class for creating unsigned transactions
 */
export class AptosTransactions {
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
   * Get the invoice module name
   */
  private getInvoiceModule(): string {
    const addr = this.getModuleAddress();
    return `${addr}::invoice_stream_fa`;
  }

  /**
   * Build transaction to create a linear streaming route
   */
  buildCreateLinearRouteTransaction(
    params: CreateLinearRouteParams
  ): InputGenerateTransactionPayloadData {
    validateCreateLinearRouteParams(params);

    // Calculate the 0.5% protocol fee
    const feeAmount = calculateFee(params.amount);

    const payload: InputGenerateTransactionPayloadData = {
      function: `${this.getModuleAddress()}::${"linear_stream_fa"}::${
        ENTRY_FUNCTIONS.LINEAR.CREATE_ROUTE
      }`,
      functionArguments: [
        params.tokenMetadata, // fa: Object<Metadata>
        params.amount.toString(), // amount: u64
        params.startTimestamp.toString(), // start_ts: u64
        params.periodSeconds.toString(), // period_secs: u64
        params.payoutAmount.toString(), // payout_amount: u64
        params.maxPeriods.toString(), // max_periods: u64
        feeAmount.toString(), // fee_amount: u64
        params.beneficiary, // beneficiary: address
      ],
    };

    return payload;
  }

  /**
   * Build transaction to create a milestone-based route
   */
  buildCreateMilestoneRouteTransaction(
    params: CreateMilestoneRouteParams
  ): InputGenerateTransactionPayloadData {
    validateCreateMilestoneRouteParams(params);

    // Calculate the 0.5% protocol fee
    const feeAmount = calculateFee(params.amount);

    const payload: InputGenerateTransactionPayloadData = {
      function: `${this.getModuleAddress()}::${"milestone_stream_fa"}::${
        ENTRY_FUNCTIONS.MILESTONE.CREATE_ROUTE
      }`,
      functionArguments: [
        params.tokenMetadata, // fa: Object<Metadata>
        params.amount.toString(), // amount: u64
        params.startTimestamp.toString(), // start_ts: u64
        params.periodSeconds.toString(), // period_secs: u64
        params.payoutAmount.toString(), // payout_amount: u64
        params.maxPeriods.toString(), // max_periods: u64
        feeAmount.toString(), // fee_amount: u64
        params.beneficiary, // beneficiary: address
      ],
    };

    return payload;
  }

  /**
   * Build transaction to claim from a linear route
   */
  buildClaimLinearTransaction(
    params: ClaimParams
  ): InputGenerateTransactionPayloadData {
    validateCallerAddress(params.caller);
    validateRouteAddress(params.routeAddress);

    const payload: InputGenerateTransactionPayloadData = {
      function: `${this.getModuleAddress()}::${"linear_stream_fa"}::${
        ENTRY_FUNCTIONS.LINEAR.CLAIM
      }`,
      functionArguments: [
        params.routeAddress, // route_obj: Object<ObjectCore>
      ],
    };

    return payload;
  }

  /**
   * Build transaction to claim from a milestone route
   */
  buildClaimMilestoneTransaction(
    params: ClaimParams
  ): InputGenerateTransactionPayloadData {
    validateCallerAddress(params.caller);
    validateRouteAddress(params.routeAddress);

    const payload: InputGenerateTransactionPayloadData = {
      function: `${this.getModuleAddress()}::${"milestone_stream_fa"}::${
        ENTRY_FUNCTIONS.MILESTONE.CLAIM
      }`,
      functionArguments: [
        params.routeAddress, // route_obj: Object<ObjectCore>
      ],
    };

    return payload;
  }

  /**
   * Build transaction to approve a milestone (depositor only)
   */
  buildApproveMilestoneTransaction(
    params: ApproveMilestoneParams
  ): InputGenerateTransactionPayloadData {
    validateCallerAddress(params.caller);
    validateRouteAddress(params.routeAddress);

    if (params.unlockAmount <= 0n) {
      throw new Error("Unlock amount must be greater than 0");
    }

    const payload: InputGenerateTransactionPayloadData = {
      function: `${this.getModuleAddress()}::${"milestone_stream_fa"}::${
        ENTRY_FUNCTIONS.MILESTONE.APPROVE_MILESTONE
      }`,
      functionArguments: [
        params.routeAddress, // route_obj: Object<ObjectCore>
        params.unlockAmount.toString(), // unlock_amount: u64
      ],
    };

    return payload;
  }

  /**
   * Build transaction to create an invoice (two-phase: create then fund)
   * Beneficiary creates the invoice, payer must fund it later
   */
  buildCreateInvoiceTransaction(
    params: CreateInvoiceParams
  ): InputGenerateTransactionPayloadData {
    if (params.amount <= 0n) {
      throw new Error("Amount must be greater than 0");
    }
    if (params.periodSeconds <= 0) {
      throw new Error("Period seconds must be greater than 0");
    }
    if (params.maxPeriods <= 0) {
      throw new Error("Max periods must be greater than 0");
    }
    if (params.payoutAmount <= 0n) {
      throw new Error("Payout amount must be greater than 0");
    }

    const payload: InputGenerateTransactionPayloadData = {
      function: `${this.getModuleAddress()}::${"invoice_stream_fa"}::${
        ENTRY_FUNCTIONS.INVOICE.CREATE_INVOICE
      }`,
      functionArguments: [
        params.tokenMetadata, // fa: Object<Metadata>
        params.amount.toString(), // amount: u64 (gross invoice amount)
        params.startTimestamp.toString(), // start_ts: u64
        params.periodSeconds.toString(), // period_secs: u64
        params.payoutAmount.toString(), // payout_amount: u64
        params.maxPeriods.toString(), // max_periods: u64
        params.payer, // payer: address
      ],
    };

    return payload;
  }

  /**
   * Build transaction to create and fund an invoice in one call
   * Creator/payer funds immediately upon creation
   */
  buildCreateRouteAndFundTransaction(
    params: CreateRouteAndFundParams
  ): InputGenerateTransactionPayloadData {
    if (params.amount <= 0n) {
      throw new Error("Amount must be greater than 0");
    }
    if (params.periodSeconds <= 0) {
      throw new Error("Period seconds must be greater than 0");
    }
    if (params.maxPeriods <= 0) {
      throw new Error("Max periods must be greater than 0");
    }
    if (params.payoutAmount <= 0n) {
      throw new Error("Payout amount must be greater than 0");
    }

    const payload: InputGenerateTransactionPayloadData = {
      function: `${this.getModuleAddress()}::${"invoice_stream_fa"}::${
        ENTRY_FUNCTIONS.INVOICE.CREATE_ROUTE_AND_FUND
      }`,
      functionArguments: [
        params.tokenMetadata, // fa: Object<Metadata>
        params.amount.toString(), // amount: u64 (gross invoice amount)
        params.startTimestamp.toString(), // start_ts: u64
        params.periodSeconds.toString(), // period_secs: u64
        params.payoutAmount.toString(), // payout_amount: u64
        params.maxPeriods.toString(), // max_periods: u64
        params.beneficiary, // beneficiary: address
      ],
    };

    return payload;
  }

  /**
   * Build transaction to fund an existing invoice
   * Payer funds an invoice that was previously created
   */
  buildFundInvoiceTransaction(
    params: FundInvoiceParams
  ): InputGenerateTransactionPayloadData {
    validateCallerAddress(params.payer);
    validateRouteAddress(params.routeAddress);

    const payload: InputGenerateTransactionPayloadData = {
      function: `${this.getModuleAddress()}::${"invoice_stream_fa"}::${
        ENTRY_FUNCTIONS.INVOICE.FUND_INVOICE
      }`,
      functionArguments: [
        params.routeAddress, // route_obj: Object<ObjectCore>
      ],
    };

    return payload;
  }

  /**
   * Build transaction to claim from an invoice route
   */
  buildClaimInvoiceTransaction(
    params: ClaimParams
  ): InputGenerateTransactionPayloadData {
    validateCallerAddress(params.caller);
    validateRouteAddress(params.routeAddress);

    const payload: InputGenerateTransactionPayloadData = {
      function: `${this.getModuleAddress()}::${"invoice_stream_fa"}::${
        ENTRY_FUNCTIONS.INVOICE.CLAIM
      }`,
      functionArguments: [
        params.routeAddress, // route_obj: Object<ObjectCore>
      ],
    };

    return payload;
  }
}
