import { Config, microAlgo } from "@algorandfoundation/algokit-utils";
import { registerDebugEventHandlers } from "@algorandfoundation/algokit-utils-debug";
import { algorandFixture } from "@algorandfoundation/algokit-utils/testing";
import { Account } from "algosdk";
import { beforeAll, describe, expect, test } from "vitest";
import { WaypointLinearClient } from "../artifacts/waypoint_linear/waypoint-linearClient";
import { createToken } from "./token-create";
import { deploy } from "./linear-deploy";

let waypointLinearAppClient: WaypointLinearClient;
let managerAccount: Account;
let stableAsset: bigint;

const FEE_BPS = 50n;

describe("orbital-lending Testing - deposit / borrow", async () => {
  const localnet = algorandFixture();

  // -------------------------------------------------------------------------------------------------
  beforeAll(async () => {
    await localnet.newScope(); // Ensure context is initialized before accessing it

    Config.configure({
      debug: true,
    });
    registerDebugEventHandlers();

    const { generateAccount } = localnet.context;
    managerAccount = await generateAccount({ initialFunds: microAlgo(90_000_000_000) });
    stableAsset = await createToken(managerAccount, "XUSD", 6);
    waypointLinearAppClient = await deploy({
      deployer: managerAccount,
      tokenId: stableAsset,
      fluxOracleAppId: 1n,
      treasury: managerAccount,
      feeBps: FEE_BPS,
      registryAppId: 2n,
    });
    console.log("waypointLinearAppClient", waypointLinearAppClient.appId);

  });

  test('confirm initalization', async () => {
    const globalState = await waypointLinearAppClient.state.global.getAll();
    console.log('globalState', globalState);
    expect(globalState.tokenId).toBe(stableAsset);
    expect(globalState.feeBps).toBe(FEE_BPS);
    expect(globalState.fluxOracleAppId).toBe(1n);
    expect(globalState.registryAppId).toBe(2n);
    expect(globalState.contractVersion).toBe(1000n);
    expect(globalState.startTs).toBe(0n);
    expect(globalState.periodSecs).toBe(0n);
    expect(globalState.payoutAmount).toBe(0n);
    expect(globalState.maxPeriods).toBe(0n);
    expect(globalState.depositAmount).toBe(0n);
    expect(globalState.claimedAmount).toBe(0n);
  });
});
