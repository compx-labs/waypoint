import {
  abimethod,
  Account,
  assert,
  Box,
  BoxMap,
  contract,
  Contract,
  GlobalState,
  itxn,
  op,
  uint64,
} from "@algorandfoundation/algorand-typescript";
import { Route, RouteKey } from "./config.algo";

@contract({ name: "waypoint-router", avmVersion: 11 })
export class WaypointRouter extends Contract {
  admin_account = GlobalState<Account>();
  treasury_account = GlobalState<Account>();
  fee_bps = GlobalState<uint64>();
  creation_fee_algos = GlobalState<uint64>();
  min_duration = GlobalState<uint64>();
  max_duration = GlobalState<uint64>();
  contract_version = GlobalState<uint64>();
  routes_created = GlobalState<uint64>();
  routes = BoxMap<RouteKey, Route>({ keyPrefix: "routes" });
  last_updated = GlobalState<uint64>();

  /**
   * Creates the waypoint router application and sets the initial admin account.
   * This method can only be called during contract creation.
   *
   * @param admin - The account that will have administrative privileges over the contract
   */
  @abimethod({ allowActions: "NoOp", onCreate: "require" })
  public createApplication(admin: Account): void {
    this.admin_account.value = admin;
  }

  /**
   * Initializes the waypoint router application with configuration parameters.
   * This method sets up the core operational parameters for the contract.
   *
   * @param treasury_account - The account that will receive fees collected by the contract
   * @param fee_bps - The fee rate in basis points (1 bps = 0.01%)
   * @param creation_fee_algos - The fee in microAlgos required to create a new route
   * @param min_duration - The minimum allowed duration for routes in seconds
   * @param max_duration - The maximum allowed duration for routes in seconds
   * @param contract_version - The version number of this contract deployment
   */
  @abimethod({ allowActions: "NoOp" })
  public initApplication(
    treasury_account: Account,
    fee_bps: uint64,
    creation_fee_algos: uint64,
    min_duration: uint64,
    max_duration: uint64,
    contract_version: uint64
  ): void {
    this.treasury_account.value = treasury_account;
    this.fee_bps.value = fee_bps;
    this.creation_fee_algos.value = creation_fee_algos;
    this.min_duration.value = min_duration;
    this.max_duration.value = max_duration;
    this.contract_version.value = contract_version;
    this.routes_created.value = 0;
    this.last_updated.value = op.Global.latestTimestamp;
  }

  /**
   * Updates the operational parameters of the waypoint router contract.
   * Only the admin account can call this method to modify contract settings.
   *
   * @param fee_bps - The new fee rate in basis points (1 bps = 0.01%)
   * @param creation_fee_algos - The new fee in microAlgos required to create routes
   * @param min_duration - The new minimum allowed duration for routes in seconds
   * @param max_duration - The new maximum allowed duration for routes in seconds
   *
   * @throws Will assert if the caller is not the admin account
   */
  @abimethod({ allowActions: "NoOp" })
  public updateParams(fee_bps: uint64, creation_fee_algos: uint64, min_duration: uint64, max_duration: uint64): void {
    assert(op.Txn.sender === this.admin_account.value, "Only admin can update params");
    this.fee_bps.value = fee_bps;
    this.creation_fee_algos.value = creation_fee_algos;
    this.min_duration.value = min_duration;
    this.max_duration.value = max_duration;
    this.last_updated.value = op.Global.latestTimestamp;
  }

  @abimethod({ allowActions: "NoOp" })
  public updateAdmin(new_admin: Account): void {
    assert(op.Txn.sender === this.admin_account.value, "Only admin can update admin");
    this.admin_account.value = new_admin;
    this.last_updated.value = op.Global.latestTimestamp;
  }

  private createAccessNFT(escrow_address: Account): uint64 {
    const nftCreationResult = itxn
      .assetConfig({
        assetName: "Waypoint Access NFT",
        unitName: "WAYPTNFT",
        total: 1,
        decimals: 0,
        defaultFrozen: false,
        manager: op.Txn.sender,
        reserve: op.Txn.sender,
        metadataHash: escrow_address.bytes,
      })
      .submit();
    assert(nftCreationResult.configAsset, "NFT creation failed");
    return nftCreationResult.configAsset.id;
  }

}
