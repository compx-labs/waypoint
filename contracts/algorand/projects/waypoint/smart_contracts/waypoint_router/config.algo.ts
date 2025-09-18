import { arc4, uint64 } from "@algorandfoundation/algorand-typescript";

export const MBR_CREATE_APP: uint64 = 400_000;
export const MBR_INIT_APP: uint64 = 102_000;

export const SECONDS_PER_YEAR: uint64 = 365 * 24 * 60 * 60;

// Unique key for each box which represents a route
export class RouteKey extends arc4.Struct<{
  escrow_address: arc4.Address;
  nft_key: arc4.UintN64;
}> {}

export class Route extends arc4.Struct<{
  sender: arc4.Address;
  receiver: arc4.Address;
  token_amount: arc4.UintN64;
  token_id: arc4.UintN64;
  nft_key: arc4.UintN64;
  start_time: arc4.UintN64;
  end_time: arc4.UintN64;
  route_state: arc4.UintN8; // 0 = active, 1 = complete, 2 = pending, 3 = cancelled
  claimed_amount: arc4.UintN64;
  escrow_account: arc4.Address;
}> {}
