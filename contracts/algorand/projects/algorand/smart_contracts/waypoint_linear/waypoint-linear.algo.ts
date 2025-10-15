import {
  Account,
  Application,
  arc4,
  assert,
  assertMatch,
  Asset,
  BoxMap,
  contract,
  Contract,
  err,
  Global,
  GlobalState,
  gtxn,
  itxn,
  op,
  uint64,
} from "@algorandfoundation/algorand-typescript";
import { abiCall, abimethod, Address, UintN64 } from "@algorandfoundation/algorand-typescript/arc4";
import { divw, mulw } from "@algorandfoundation/algorand-typescript/op";
import { REGISTRY_FEE, STANDARD_TXN_FEE } from "./config.algo";
import { WaypointRegistryParams } from "../waypoint_registry/config.algo";

export const CONTRACT_VERSION: uint64 = 1000;

@contract({ name: "waypoint-linear", avmVersion: 11 })
export class WaypointLinear extends Contract {
  // Global params
  flux_oracle_app = GlobalState<Application>();
  contract_version = GlobalState<UintN64>();
  fee_bps = GlobalState<UintN64>();
  treasury = GlobalState<Account>();
  registry_app_id = GlobalState<UintN64>();
  token_id = GlobalState<UintN64>();
  nominated_asset_id = GlobalState<UintN64>();

  // route params
  depositor = GlobalState<Address>();
  beneficiary = GlobalState<Address>();
  start_ts = GlobalState<UintN64>();
  period_secs = GlobalState<UintN64>();
  payout_amount = GlobalState<UintN64>();
  max_periods = GlobalState<UintN64>();
  deposit_amount = GlobalState<UintN64>(); // total intended to stream
  claimed_amount = GlobalState<UintN64>();

  @abimethod({ allowActions: "NoOp", onCreate: "require" })
  public createApplication(registryAppId: uint64, tokenId: uint64): void {
    this.contract_version.value = new UintN64(CONTRACT_VERSION);
    this.registry_app_id.value = new UintN64(registryAppId);
    this.token_id.value = new UintN64(tokenId);

    this.start_ts.value = new UintN64(0);
    this.period_secs.value = new UintN64(0);
    this.payout_amount.value = new UintN64(0);
    this.max_periods.value = new UintN64(0);
    this.deposit_amount.value = new UintN64(0);
    this.claimed_amount.value = new UintN64(0);
  }

  @abimethod({ allowActions: "NoOp" })
  public initApp(mbrTxn: gtxn.PaymentTxn): void {
    assertMatch(mbrTxn, {
      receiver: Global.currentApplicationAddress,
      amount: 400_000,
    });

    itxn
      .assetTransfer({
        sender: Global.currentApplicationAddress,
        assetReceiver: Global.currentApplicationAddress,
        xferAsset: Asset(this.token_id.value.native),
        assetAmount: 0,
        fee: STANDARD_TXN_FEE,
      })
      .submit();
    //
  }

  @abimethod({ allowActions: "NoOp" })
  public createRoute(
    beneficiary: Account,
    startTs: uint64,
    periodSecs: uint64,
    payoutAmount: uint64,
    maxPeriods: uint64,
    depositAmount: uint64,
    tokenId: uint64,
    tokenTransfer: gtxn.AssetTransferTxn
  ): void {
    assert(periodSecs > 0, "Period seconds must be greater than 0");
    assert(maxPeriods > 0, "Max periods must be greater than 0");
    assert(payoutAmount > 0, "Payout amount must be greater than 0");
    assert(depositAmount > 0, "Deposit amount must be greater than 0");
    assert(tokenId > 0, "Token ID must be greater than 0");

    assertMatch(tokenTransfer, {
      xferAsset: Asset(tokenId),
      assetAmount: depositAmount,
      assetReceiver: Global.currentApplicationAddress,
    });

    this.token_id.value = new UintN64(tokenId);
    this.start_ts.value = new UintN64(startTs); // DEBUG: subtract time to allow immediate claim
    this.period_secs.value = new UintN64(periodSecs);
    this.payout_amount.value = new UintN64(payoutAmount);
    this.max_periods.value = new UintN64(maxPeriods);
    this.deposit_amount.value = new UintN64(depositAmount);
    this.beneficiary.value = new Address(beneficiary);
    this.depositor.value = new Address(op.Txn.sender);

    // Register with registry
    const registryApp: Application = Application(this.registry_app_id.value.native);
    abiCall(WaypointRegistryStub.prototype.registerRoute, {
      appId: registryApp.id,
      args: [
        Global.currentApplicationId.id,
        this.token_id.value.native,
        this.depositor.value.native,
        this.beneficiary.value.native,
        this.start_ts.value.native,
        this.period_secs.value.native,
        this.payout_amount.value.native,
        this.max_periods.value.native,
        this.deposit_amount.value.native,
      ],
      sender: Global.currentApplicationAddress,
      fee: REGISTRY_FEE,
      apps: [registryApp],
      accounts: [op.Txn.sender, beneficiary],
    });
    const params = abiCall(WaypointRegistryStub.prototype.getParams, {
      appId: registryApp.id,
      sender: Global.currentApplicationAddress,
      fee: STANDARD_TXN_FEE,
      apps: [registryApp],
      accounts: [op.Txn.sender, beneficiary],
    }).returnValue;

    this.fee_bps.value = params.fee_bps;
    this.treasury.value = params.treasury.native;
    this.flux_oracle_app.value = Application(params.flux_oracle_app_id.native);
    this.nominated_asset_id.value = params.nominated_asset_id;

    //check flux tier for fee reductions
    let userTier: UintN64 = new UintN64(0);
    if (this.flux_oracle_app.value.id !== 0) {
      userTier = abiCall(FluxGateStub.prototype.getUserTier, {
        appId: this.flux_oracle_app.value.id,
        args: [new arc4.Address(op.Txn.sender)],
        sender: Global.currentApplicationAddress,
        fee: STANDARD_TXN_FEE,
        apps: [this.flux_oracle_app.value],
        accounts: [op.Txn.sender],
      }).returnValue;
    }
    // Fee tiers
    const calculatedFee = this.computeFees(depositAmount, userTier.native, tokenId);
    if (calculatedFee > 0) {
      itxn
        .assetTransfer({
          assetReceiver: this.treasury.value,
          assetAmount: calculatedFee,
          xferAsset: Asset(tokenId),
          fee: STANDARD_TXN_FEE,
        })
        .submit();
    }
  }

  private computeFees(depositAmount: uint64, userTier: uint64, tokenId: uint64): uint64 {
    const initialFee: uint64 = this.fee_bps.value.native;
    let effectiveFeeBps: uint64 = initialFee;

    if (tokenId === this.nominated_asset_id.value.native) {
      if (userTier === 1) {
        effectiveFeeBps = 20;
      } else if (userTier === 2) {
        effectiveFeeBps = 15;
      } else if (userTier === 3) {
        effectiveFeeBps = 12;
      } else if (userTier >= 4) {
        effectiveFeeBps = 10;
      }
    } else {
      if (userTier === 1) {
        effectiveFeeBps = 45;
      } else if (userTier === 2) {
        effectiveFeeBps = 38;
      } else if (userTier === 3) {
        effectiveFeeBps = 30;
      } else if (userTier >= 4) {
        effectiveFeeBps = 20;
      }
    }

    const [feeHi, feeLo] = mulw(depositAmount, effectiveFeeBps);
    const fee: uint64 = divw(feeHi, feeLo, 10_000);
    return fee;
  }

  @abimethod({ allowActions: "NoOp" })
  public claim(): void {
    assert(op.Txn.sender === this.beneficiary.value.native, "Only beneficiary can claim");
    const tokenId = this.token_id.value.native;
    assert(tokenId > 0, "Route not initialized");

    const now = Global.latestTimestamp;
    const claimableAmount = this.computeClaimable(now);
    assert(claimableAmount > 0, "Nothing claimable yet");

    itxn
      .assetTransfer({
        xferAsset: Asset(tokenId),
        assetAmount: claimableAmount,
        assetReceiver: this.beneficiary.value.native,
        fee: STANDARD_TXN_FEE,
      })
      .submit();

    const updatedClaimed: uint64 = this.claimed_amount.value.native + claimableAmount;
    this.claimed_amount.value = new UintN64(updatedClaimed);
  }

  private vestedBySchedule(now: uint64): uint64 {
    const startTs: uint64 = this.start_ts.value.native;
    if (now <= startTs) {
      return 0;
    }

    const periodSecs: uint64 = this.period_secs.value.native;
    if (periodSecs === 0) {
      return 0;
    }

    const elapsed: uint64 = now - startTs;
    const periodsElapsed: uint64 = divw(0, elapsed, periodSecs);

    const maxPeriods: uint64 = this.max_periods.value.native;
    const cappedPeriods: uint64 = periodsElapsed > maxPeriods ? maxPeriods : periodsElapsed;

    const payoutAmount: uint64 = this.payout_amount.value.native;
    const depositAmount: uint64 = this.deposit_amount.value.native;
    const [candidateHi, candidateLo] = mulw(payoutAmount, cappedPeriods);

    if (candidateHi > 0) {
      return depositAmount;
    }

    const vestedCandidate: uint64 = candidateLo;
    return vestedCandidate > depositAmount ? depositAmount : vestedCandidate;
  }

  private computeClaimable(now: uint64): uint64 {
    const vested = this.vestedBySchedule(now);
    const alreadyClaimed: uint64 = this.claimed_amount.value.native;
    if (vested > alreadyClaimed) {
      return vested - alreadyClaimed;
    }

    return 0;
  }
}

export abstract class FluxGateStub extends Contract {
  @abimethod({ allowActions: "NoOp" })
  getUserTier(user: arc4.Address): UintN64 {
    err("stub only");
  }
}

export abstract class WaypointRegistryStub extends Contract {
  @abimethod({ allowActions: "NoOp" })
  updateRouteClaimedAmount(routeAppId: uint64, newClaimedAmount: uint64): void {
    err("stub only");
  }
  @abimethod({ allowActions: "NoOp" })
  public registerRoute(
    routeAppId: uint64,
    tokenId: uint64,
    depositor: Account,
    beneficiary: Account,
    startTs: uint64,
    periodSecs: uint64,
    payoutAmount: uint64,
    maxPeriods: uint64,
    depositAmount: uint64
  ): void {
    err("stub only");
  }
  @abimethod({ allowActions: "NoOp" })
  public getParams(): WaypointRegistryParams {
    err("stub only");
  }
}
