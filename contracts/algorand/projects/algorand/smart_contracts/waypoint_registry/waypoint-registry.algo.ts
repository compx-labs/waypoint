import {
  abimethod,
  Account,
  Application,
  assert,
  BoxMap,
  contract,
  Contract,
  GlobalState,
  op,
  uint64,
} from "@algorandfoundation/algorand-typescript";
import { CONTRACT_VERSION, Route, WaypointRegistryParams } from "./config.algo";
import { Address, UintN64 } from "@algorandfoundation/algorand-typescript/arc4";

@contract({ name: "waypoint-registry", avmVersion: 11 })
export class WaypointRegistry extends Contract {
  // Global params
  admin = GlobalState<Account>();
  fee_bps = GlobalState<UintN64>();
  contract_version = GlobalState<UintN64>();
  treasury = GlobalState<Account>();
  nominated_asset_id = GlobalState<UintN64>();
  routes = BoxMap<uint64, Route>({ keyPrefix: "r" }); // route app id -> token id
  num_routes = GlobalState<UintN64>();
  total_routed = GlobalState<UintN64>(); // total routed including pending, complete and active
  current_active_route_total = GlobalState<UintN64>(); // total currently active (deposited but not fully claimed)
  flux_oracle_app = GlobalState<Application>();

  @abimethod({ allowActions: "NoOp", onCreate: "require" })
  public createApplication(
    admin: Account,
    feeBps: uint64,
    treasury: Account,
    nominatedAssetId: uint64,
    flux_oracle_app: Application
  ): void {
    this.admin.value = admin;
    this.fee_bps.value = new UintN64(feeBps);
    this.treasury.value = treasury;
    this.contract_version.value = new UintN64(CONTRACT_VERSION);
    this.nominated_asset_id.value = new UintN64(nominatedAssetId);
    this.num_routes.value = new UintN64(0);
    this.total_routed.value = new UintN64(0);
    this.current_active_route_total.value = new UintN64(0);
    this.flux_oracle_app.value = flux_oracle_app;
  }

  @abimethod({ allowActions: "NoOp" })
  public setFeeBps(feeBps: uint64): void {
    assert(op.Txn.sender === this.admin.value, "Only admin can set fee bps");
    this.fee_bps.value = new UintN64(feeBps);
  }

  @abimethod({ allowActions: "NoOp" })
  public setTreasury(treasury: Account): void {
    assert(op.Txn.sender === this.admin.value, "Only admin can set treasury");
    this.treasury.value = treasury;
  }

  @abimethod({ allowActions: "NoOp" })
  public setNominatedAssetId(nominatedAssetId: uint64): void {
    assert(op.Txn.sender === this.admin.value, "Only admin can set nominated asset id");
    this.nominated_asset_id.value = new UintN64(nominatedAssetId);
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
    assert(this.routes(routeAppId).exists === false, "Route already exists");

    const newRoute = new Route({
      tokenId: new UintN64(tokenId),
      depositor: new Address(depositor),
      beneficiary: new Address(beneficiary),
      startTs: new UintN64(startTs),
      periodSecs: new UintN64(periodSecs),
      payoutAmount: new UintN64(payoutAmount),
      maxPeriods: new UintN64(maxPeriods),
      depositAmount: new UintN64(depositAmount),
      claimedAmount: new UintN64(0),
    });
    this.routes(routeAppId).value = newRoute.copy();
    this.num_routes.value = new UintN64(this.num_routes.value.native + 1);
    this.total_routed.value = new UintN64(this.total_routed.value.native + depositAmount);
    this.current_active_route_total.value = new UintN64(this.current_active_route_total.value.native + depositAmount);
  }

  @abimethod({ allowActions: "NoOp" })
  public updateRouteClaimedAmount(routeAppId: uint64, newClaimedAmount: uint64): void {
    assert(this.routes(routeAppId).exists === true, "Route does not exist");
    const route = this.routes(routeAppId).value.copy();
    assert(newClaimedAmount >= route.claimedAmount.native, "New claimed amount must be greater than or equal to current claimed amount");
    assert(newClaimedAmount <= route.depositAmount.native, "New claimed amount cannot exceed deposit amount");

    const delta: uint64 = newClaimedAmount - route.claimedAmount.native;
    route.claimedAmount = new UintN64(newClaimedAmount);
    this.routes(routeAppId).value = route.copy();

    // Decrease current active route total by the delta
    this.current_active_route_total.value = new UintN64(this.current_active_route_total.value.native - delta);
  }
  @abimethod({ allowActions: "NoOp" })
  public getParams(): WaypointRegistryParams {
    return new WaypointRegistryParams({
      fee_bps: this.fee_bps.value,
      treasury: new Address(this.treasury.value),
      nominated_asset_id: this.nominated_asset_id.value,
      flux_oracle_app_id: new UintN64(this.flux_oracle_app.value.id),
    });
  }
}
