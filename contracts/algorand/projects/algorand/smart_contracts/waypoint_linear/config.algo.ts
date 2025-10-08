import { arc4 } from "@algorandfoundation/algorand-typescript";

export class Route extends arc4.Struct<{
  escrow: arc4.Address;
  tokenId: arc4.UintN64;
  depositor: arc4.Address;
  beneficiary: arc4.Address;
  start_ts: arc4.UintN64;
  period_secs: arc4.UintN64;
  payout_amount: arc4.UintN64;
  max_periods: arc4.UintN64;
  deposit_amount: arc4.UintN64; // total intended to stream
  claimed_amount: arc4.UintN64; // amount already claimed
}> {}

export class RouteKey extends arc4.Struct<{
  tokenId: arc4.UintN64;

}> {}
