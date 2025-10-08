import { Account, assert, assertMatch, Asset, BoxMap, contract, Contract, GlobalState, gtxn, op } from "@algorandfoundation/algorand-typescript";
import { abimethod, Address, UintN64 } from "@algorandfoundation/algorand-typescript/arc4";
import { Route } from "./config.algo";

export const CONTRACT_VERSION = 1000;

@contract({ name: "waypoint-linear", avmVersion: 11 })
export class WaypointLinear extends Contract {
  admin = GlobalState<Account>();
  fluxOracleAppId = GlobalState<UintN64>();
  contractVersion = GlobalState<UintN64>();
  token_routes = BoxMap<Address, Route>({ keyPrefix: "tr" });
  feeBps = GlobalState<UintN64>();
  treasury = GlobalState<Address>();

  @abimethod({ allowActions: "NoOp", onCreate: "require" })
  public createApplication(admin: Account, fluxOracleAppId: UintN64, treasury: Address, feeBps: UintN64): void {
    this.admin.value = admin.authAddress;
    this.fluxOracleAppId.value = fluxOracleAppId;
    this.feeBps.value = feeBps;
    this.treasury.value = treasury;
    this.contractVersion.value = new UintN64(CONTRACT_VERSION);
  }

  @abimethod({ allowActions: "NoOp" })
  public setFluxOracleAppId(fluxOracleAppId: UintN64): void {
    this.fluxOracleAppId.value = fluxOracleAppId;
  }
  @abimethod({ allowActions: "NoOp" })
  public setContractVersion(contractVersion: UintN64): void {
    this.contractVersion.value = contractVersion;
  }
  @abimethod({ allowActions: "NoOp" })
  public setAdmin(admin: Account): void {
    this.admin.value = admin;
  }

  @abimethod({ allowActions: "NoOp" })
  public createRoute(
    beneficiary: Account,
    startTs: UintN64,
    periodSecs: UintN64,
    payoutAmount: UintN64,
    maxPeriods: UintN64,
    depositAmount: UintN64,
    escrow: Account,
    tokenId: UintN64,
    tokenTransfer: gtxn.AssetTransferTxn,
    mbrTxn: gtxn.PaymentTxn
  ): void {

    assert(periodSecs > new UintN64(0), "Period seconds must be greater than 0");
    assert(maxPeriods > new UintN64(0), "Max periods must be greater than 0");
    assert(payoutAmount > new UintN64(0), "Payout amount must be greater than 0");
    assert(depositAmount > new UintN64(0), "Deposit amount must be greater than 0");
    assert(tokenId > new UintN64(0), "Token ID must be greater than 0");

    assertMatch(tokenTransfer, {
      xferAsset: Asset(tokenId.native),
      assetAmount: depositAmount.native,
      assetReceiver: escrow
    })
    assertMatch(mbrTxn, {
      amount: depositAmount.native,
      receiver: escrow
    })

    const route = new Route({
      beneficiary: new Address(beneficiary),
      start_ts: startTs,
      period_secs: periodSecs,
      payout_amount: payoutAmount,
      max_periods: maxPeriods,
      deposit_amount: depositAmount,
      claimed_amount: new UintN64(0),
      depositor: new Address(op.Txn.sender),
      escrow: new Address(escrow),
      tokenId: tokenId,
    });
    this.token_routes(new Address(escrow)).value = route.copy();
  }
}
