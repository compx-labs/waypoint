import { Account, contract, Contract, GlobalState, op } from "@algorandfoundation/algorand-typescript";
import { abimethod, Address, UintN64 } from "@algorandfoundation/algorand-typescript/arc4";

export const CONTRACT_VERSION = 1000;

@contract({ name: "waypoint-linear", avmVersion: 11 })
export class WaypointLinear extends Contract {
  tokenId = GlobalState<UintN64>();
  depositor = GlobalState<Account>();
  beneficiary = GlobalState<Account>();
  start_ts = GlobalState<UintN64>();
  period_secs = GlobalState<UintN64>();
  payout_amount = GlobalState<UintN64>();
  max_periods = GlobalState<UintN64>();
  deposit_amount = GlobalState<UintN64>();
  claimed_amount = GlobalState<UintN64>();
  treasury = GlobalState<Account>();
  fee_bps = GlobalState<UintN64>();
  flux_oracle_app_id = GlobalState<UintN64>();
  contract_version = GlobalState<UintN64>();

  @abimethod({ allowActions: "NoOp", onCreate: "require" })
  public createApplication(
    beneficiary: Account,
    start_ts: UintN64,
    period_secs: UintN64,
    payout_amount: UintN64,
    max_periods: UintN64,
    deposit_amount: UintN64,
    treasury: Account,
    fee_bps: UintN64,
    flux_oracle_app_id: UintN64,
  ): void {
    this.depositor.value = op.Txn.sender;
    this.beneficiary.value = beneficiary;
    this.start_ts.value = start_ts;
    this.period_secs.value = period_secs;
    this.payout_amount.value = payout_amount;
    this.max_periods.value = max_periods;
    this.deposit_amount.value = deposit_amount;
    this.claimed_amount.value = new UintN64(0);
    this.treasury.value = treasury;
    this.fee_bps.value = fee_bps;
    this.flux_oracle_app_id.value = flux_oracle_app_id;
    this.contract_version.value = new UintN64(CONTRACT_VERSION);
  }
}
