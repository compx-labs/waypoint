import { Config, microAlgo } from "@algorandfoundation/algokit-utils";
import { registerDebugEventHandlers } from "@algorandfoundation/algokit-utils-debug";
import { algorandFixture } from "@algorandfoundation/algokit-utils/testing";
import algosdk, { Account } from "algosdk";
import { beforeAll, describe, expect, test } from "vitest";
import { WaypointLinearClient } from "../artifacts/waypoint_linear/waypoint-linearClient";
import { createToken } from "./token-create";
import { deploy } from "./linear-deploy";
import { deploy as deployRegistry } from "../waypoint_registry/registry-deploy";
import { WaypointRegistryClient } from "../artifacts/waypoint_registry/waypoint-registryClient";
import { exp } from "@algorandfoundation/algorand-typescript/op";

let waypointLinearAppClient: WaypointLinearClient;
let registryAppClient: WaypointRegistryClient;
let managerAccount: Account;
let beneficiaryAccount: Account;
let stableAsset: bigint;

let depositAmount: bigint;
let payoutAmount: bigint;
let periodSecs: bigint;
let maxPeriods: bigint;
let startTs: bigint;

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
    beneficiaryAccount = await generateAccount({ initialFunds: microAlgo(5_000_000) });
    stableAsset = await createToken(managerAccount, "XUSD", 6);

    console.log('deploying registry App')
    registryAppClient = await deployRegistry({
      deployer: managerAccount,
      tokenId: stableAsset,
      fluxOracleAppId: 0n,
      treasury: managerAccount,
      feeBps: FEE_BPS,
    });
    console.log("registryAppClient.appAddress", registryAppClient.appAddress);
    await localnet.algorand.send.payment({
      sender: managerAccount.addr,
      receiver: registryAppClient.appAddress,
      amount: microAlgo(200_000),
      suppressLog: true,
    });
    console.log('deploying linear App')
    waypointLinearAppClient = await deploy({
      deployer: managerAccount,
      tokenId: stableAsset,
      fluxOracleAppId: 1n,
      treasury: managerAccount,
      feeBps: FEE_BPS,
      registryAppId: registryAppClient.appId,
    });
    console.log("waypointLinearAppClient.appAddress", waypointLinearAppClient.appAddress);
    await localnet.context.algorand.setSignerFromAccount(managerAccount);
    await localnet.context.algorand.setSignerFromAccount(beneficiaryAccount);
    console.log("waypointLinearAppClient", waypointLinearAppClient.appId);
  });

  const getAssetBalance = async (address: string) => {
    try {
      const holding = await localnet.context.algod.accountAssetInformation(address, Number(stableAsset)).do();
      return BigInt(holding.assetHolding?.amount ?? 0);
    } catch (error) {
      return 0n;
    }
  };

  test("confirm initalization", async () => {
    const globalState = await waypointLinearAppClient.state.global.getAll();
    console.log("globalState", globalState);
    expect(globalState.tokenId).toBe(stableAsset);
    expect(globalState.contractVersion).toBe(1000n);
    expect(globalState.startTs).toBe(0n);
    expect(globalState.periodSecs).toBe(0n);
    expect(globalState.payoutAmount).toBe(0n);
    expect(globalState.maxPeriods).toBe(0n);
    expect(globalState.depositAmount).toBe(0n);
    expect(globalState.claimedAmount).toBe(0n);
  });

  test("initApp creates 0 balance holding", async () => {
    const mbrTxn = waypointLinearAppClient.algorand.createTransaction.payment({
      sender: managerAccount.addr,
      receiver: waypointLinearAppClient.appAddress,
      amount: microAlgo(400_000n),
    });
    await waypointLinearAppClient.send.initApp({ args: { mbrTxn }, sender: managerAccount.addr });
    const balanceAfter = await getAssetBalance(waypointLinearAppClient.appAddress.toString());
    const algoBalance = await localnet.context.algod.accountInformation(waypointLinearAppClient.appAddress.toString()).do();
    console.log("algoBalance", algoBalance.amount);
    expect(algoBalance.amount).toBe(microAlgo(400_000n));
    expect(balanceAfter).toBe(0n);
  });

  test("create route stores schedule and locks funds", async () => {
    periodSecs = 10n;
    maxPeriods = 5n;
    payoutAmount = 200n;
    depositAmount = payoutAmount * maxPeriods;
    const now = BigInt(Math.floor(Date.now() / 1000));
    startTs = 100_000n; //now - periodSecs * maxPeriods;
    console.log("startTs", startTs, "now", now);

    const tokenTransfer = await localnet.context.algorand.createTransaction.assetTransfer({
      sender: managerAccount.addr,
      receiver: waypointLinearAppClient.appAddress,
      assetId: stableAsset,
      amount: depositAmount,
    });

    await waypointLinearAppClient
      .newGroup()
      .createRoute({
        sender: managerAccount.addr,
        assetReferences: [stableAsset],
        args: {
          beneficiary: beneficiaryAccount.addr.toString(),
          startTs,
          periodSecs,
          payoutAmount,
          maxPeriods,
          depositAmount,
          tokenId: stableAsset,
          tokenTransfer,
        },
      })
      .send();

    const globalState = await waypointLinearAppClient.state.global.getAll();
    expect(globalState.beneficiary).toBe(algosdk.encodeAddress(beneficiaryAccount.addr.publicKey));
    expect(globalState.depositor).toBe(algosdk.encodeAddress(managerAccount.addr.publicKey));
    expect(globalState.tokenId).toBe(stableAsset);
    expect(globalState.startTs).toBe(startTs); // DEBUG: subtract time to allow immediate claim
    expect(globalState.periodSecs).toBe(periodSecs);
    expect(globalState.payoutAmount).toBe(payoutAmount);
    expect(globalState.maxPeriods).toBe(maxPeriods);
    expect(globalState.depositAmount).toBe(depositAmount);
    expect(globalState.claimedAmount).toBe(0n);

    const appHolding = await getAssetBalance(waypointLinearAppClient.appAddress.toString());
    expect(appHolding).toBe(depositAmount);
  });


  test("claim releases vested amount to beneficiary", async () => {
    waypointLinearAppClient.algorand.setSignerFromAccount(beneficiaryAccount);

    await waypointLinearAppClient.algorand.send.assetOptIn({
      sender: beneficiaryAccount.addr,
      assetId: stableAsset,
      suppressLog: true,
    });

    const balanceBefore = await getAssetBalance(beneficiaryAccount.addr.toString());
    await waypointLinearAppClient
      .newGroup()
      .claim({
        sender: beneficiaryAccount.addr,
        assetReferences: [stableAsset],
        args: {},
      })
      .send();

    const globalState = await waypointLinearAppClient.state.global.getAll();
    expect(globalState.claimedAmount).toBe(depositAmount);

    const beneficiaryHolding = await getAssetBalance(beneficiaryAccount.addr.toString());
    expect(beneficiaryHolding - balanceBefore).toBe(depositAmount);

    const appHolding = await getAssetBalance(waypointLinearAppClient.appAddress.toString());
    expect(appHolding).toBe(0n);

    await expect(
      waypointLinearAppClient
        .newGroup()
        .claim({
          sender: beneficiaryAccount.addr,
          assetReferences: [stableAsset],
          args: {},
        })
        .send()
    ).rejects.toThrow(/Nothing claimable yet/);
  });
});
