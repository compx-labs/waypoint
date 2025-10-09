import {
  Account,
  assert,
  assertMatch,
  Asset,
  BoxMap,
  contract,
  Contract,
  Global,
  GlobalState,
  gtxn,
  itxn,
  op,
  uint64,
} from "@algorandfoundation/algorand-typescript";
import { abimethod, Address, UintN64 } from "@algorandfoundation/algorand-typescript/arc4";
import { divw, mulw } from "@algorandfoundation/algorand-typescript/op";
import { STANDARD_TXN_FEE } from "./config.algo";

export const CONTRACT_VERSION: uint64 = 1000;

@contract({ name: "waypoint-linear", avmVersion: 11 })
export class WaypointLinear extends Contract {
  // Global params
  admin = GlobalState<Account>();
  flux_oracle_app_id = GlobalState<UintN64>();
  contract_version = GlobalState<UintN64>();
  fee_bps = GlobalState<UintN64>();
  treasury = GlobalState<Account>();
  registry_app_id = GlobalState<UintN64>();
  token_id = GlobalState<UintN64>();

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
  public createApplication(admin: Account, fluxOracleAppId: uint64, treasury: Account, feeBps: uint64, registryAppId: uint64, tokenId: uint64): void {
    this.admin.value = admin.authAddress;
    this.flux_oracle_app_id.value = new UintN64(fluxOracleAppId);
    this.fee_bps.value = new UintN64(feeBps);
    this.treasury.value = treasury;
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
  public setFluxOracleAppId(fluxOracleAppId: uint64): void {
    assert(op.Txn.sender === this.admin.value, "Only admin can set flux oracle app id");
    this.flux_oracle_app_id.value = new UintN64(fluxOracleAppId);
  }
  @abimethod({ allowActions: "NoOp" })
  public setContractVersion(contractVersion: uint64): void {
    assert(op.Txn.sender === this.admin.value, "Only admin can set contract version");
    this.contract_version.value = new UintN64(contractVersion);
  }
  @abimethod({ allowActions: "NoOp" })
  public setAdmin(admin: Account): void {
    assert(op.Txn.sender === this.admin.value, "Only admin can set new admin");
    this.admin.value = admin;
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
    tokenTransfer: gtxn.AssetTransferTxn,
    mbrTxn: gtxn.PaymentTxn
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
    assertMatch(mbrTxn, {
      amount: depositAmount,
      receiver: Global.currentApplicationAddress,
    });

    this.token_id.value = new UintN64(tokenId);
    this.start_ts.value = new UintN64(startTs);
    this.period_secs.value = new UintN64(periodSecs);
    this.payout_amount.value = new UintN64(payoutAmount);
    this.max_periods.value = new UintN64(maxPeriods);
    this.deposit_amount.value = new UintN64(depositAmount);
    this.beneficiary.value = new Address(beneficiary);
    this.depositor.value = new Address(op.Txn.sender);

    //Register with registery app

    // Handle fees
    const [feeHi, feeLo] = mulw(depositAmount, this.fee_bps.value.native);
    const fee: uint64 = divw(feeHi, feeLo, 10_000);
    if (fee > 0) {
      itxn
        .assetTransfer({
          assetReceiver: this.treasury.value,
          assetAmount: fee,
          xferAsset: Asset(tokenId),
          fee: STANDARD_TXN_FEE,
        })
        .submit();
    }
  }

  @abimethod({ allowActions: "NoOp" })
  public claim(_tokenTransfer: gtxn.AssetTransferTxn, _mbrTxn: gtxn.PaymentTxn, _fluxAppCall: gtxn.ApplicationCallTxn): void {
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
