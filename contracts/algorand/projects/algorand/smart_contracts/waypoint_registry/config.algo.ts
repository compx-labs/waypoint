import { arc4, uint64, Account, Application } from "@algorandfoundation/algorand-typescript";

export const CONTRACT_VERSION: uint64 = 1000;

export class Route extends arc4.Struct<{
  tokenId: arc4.UintN64;
  depositor: arc4.Address;
  beneficiary: arc4.Address;
  startTs: arc4.UintN64;
  periodSecs: arc4.UintN64;
  payoutAmount: arc4.UintN64;
  maxPeriods: arc4.UintN64;
  depositAmount: arc4.UintN64;
  claimedAmount: arc4.UintN64;
}> {}

export class WaypointRegistryParams extends arc4.Struct<{
  fee_bps: arc4.UintN64;
  treasury: arc4.Address;
  flux_oracle_app_id: arc4.UintN64;
  nominated_asset_id: arc4.UintN64;
}> {}
