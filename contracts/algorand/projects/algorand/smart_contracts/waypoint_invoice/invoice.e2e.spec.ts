import { Config, microAlgo } from "@algorandfoundation/algokit-utils";
import { registerDebugEventHandlers } from "@algorandfoundation/algokit-utils-debug";
import { algorandFixture } from "@algorandfoundation/algokit-utils/testing";
import algosdk, { Account } from "algosdk";
import { beforeAll, describe, expect, test } from "vitest";
import { WaypointInvoiceClient } from "../artifacts/waypoint_invoice/waypoint-invoiceClient";
import { WaypointRegistryClient } from "../artifacts/waypoint_registry/waypoint-registryClient";
import { deploy as deployRegistry } from "../waypoint_registry/registry-deploy";
import { deploy } from "./invoice-deploy";
import { createToken } from "./token-create";

const STATUS_PENDING = 1n;
const STATUS_FUNDED = 2n;
const STATUS_DECLINED = 3n;
const DEFAULT_FEE_BPS = 50n;
const DEFAULT_GROSS = 1_000n;
const DEFAULT_PERIOD_SECS = 1n;
const DEFAULT_MAX_PERIODS = 1n;
const DEFAULT_PAYOUT = DEFAULT_GROSS;

const localnet = algorandFixture();

beforeAll(() => {
  Config.configure({ debug: true });
  registerDebugEventHandlers();
});

type ScenarioConfig = {
  grossInvoiceAmount: bigint;
  periodSecs: bigint;
  maxPeriods: bigint;
  payoutAmount: bigint;
  startTs: bigint;
  feeBps: bigint;
};

type ScenarioContext = {
  config: ScenarioConfig;
  registryAppClient: WaypointRegistryClient;
  waypointInvoiceAppClient: WaypointInvoiceClient;
  accounts: {
    manager: Account;
    requester: Account;
    beneficiary: Account;
    payer: Account;
    advanceer: Account;
  };
  stableAsset: bigint;
  appAddress: string;
  expectedFee: bigint;
  expectedNet: bigint;
};

const defaultScenario: ScenarioConfig = {
  grossInvoiceAmount: DEFAULT_GROSS,
  periodSecs: DEFAULT_PERIOD_SECS,
  maxPeriods: DEFAULT_MAX_PERIODS,
  payoutAmount: DEFAULT_PAYOUT,
  startTs: 0n,
  feeBps: DEFAULT_FEE_BPS,
};

const getAssetBalance = async (assetId: bigint, address: string) => {
  try {
    const holding = await localnet.context.algod.accountAssetInformation(address, Number(assetId)).do();
    return BigInt(holding.assetHolding?.amount ?? 0);
  } catch {
    return 0n;
  }
};

const setupScenario = async (overrides: Partial<ScenarioConfig> = {}): Promise<ScenarioContext> => {
  await localnet.newScope();

  const config: ScenarioConfig = {
    grossInvoiceAmount: overrides.grossInvoiceAmount ?? defaultScenario.grossInvoiceAmount,
    periodSecs: overrides.periodSecs ?? defaultScenario.periodSecs,
    maxPeriods: overrides.maxPeriods ?? defaultScenario.maxPeriods,
    payoutAmount: overrides.payoutAmount ?? overrides.grossInvoiceAmount ?? defaultScenario.payoutAmount,
    startTs: overrides.startTs ?? defaultScenario.startTs,
    feeBps: overrides.feeBps ?? defaultScenario.feeBps,
  };

  const { generateAccount } = localnet.context;
  const manager = await generateAccount({ initialFunds: microAlgo(90_000_000_000) });
  const requester = await generateAccount({ initialFunds: microAlgo(10_000_000) });
  const beneficiary = await generateAccount({ initialFunds: microAlgo(10_000_000) });
  const payer = await generateAccount({ initialFunds: microAlgo(90_000_000) });
  const advanceer = await generateAccount({ initialFunds: microAlgo(100_000_000) });

  const stableAsset = await createToken(manager, "XUSD", 6);

  await localnet.context.algorand.setSignerFromAccount(beneficiary);
  await localnet.context.algorand.send.assetOptIn({
    sender: beneficiary.addr,
    assetId: stableAsset,
    suppressLog: true,
  });

  await localnet.context.algorand.setSignerFromAccount(payer);
  await localnet.context.algorand.send.assetOptIn({
    sender: payer.addr,
    assetId: stableAsset,
    suppressLog: true,
  });

  await localnet.context.algorand.setSignerFromAccount(manager);
  await localnet.context.algorand.send.assetTransfer({
    sender: manager.addr,
    receiver: payer.addr,
    assetId: stableAsset,
    amount: 50_000n,
    suppressLog: true,
  });

  const registryAppClient = await deployRegistry({
    deployer: manager,
    tokenId: stableAsset,
    fluxOracleAppId: 0n,
    treasury: manager,
    feeBps: config.feeBps,
  });

  await localnet.algorand.send.payment({
    sender: manager.addr,
    receiver: registryAppClient.appAddress,
    amount: microAlgo(200_000),
    suppressLog: true,
  });

  const waypointInvoiceAppClient = await deploy({
    deployer: manager,
    tokenId: stableAsset,
    fluxOracleAppId: 0n,
    treasury: manager,
    feeBps: config.feeBps,
    registryAppId: registryAppClient.appId,
  });
  await waypointInvoiceAppClient.algorand.setSignerFromAccount(manager);
  await localnet.algorand.send.payment({
    sender: manager.addr,
    receiver: waypointInvoiceAppClient.appAddress,
    amount: microAlgo(200_000),
    suppressLog: true,
  });

  const appAddress = algosdk.encodeAddress(waypointInvoiceAppClient.appAddress.publicKey);
  const expectedFee = (config.grossInvoiceAmount * config.feeBps) / 10_000n;
  const expectedNet = config.grossInvoiceAmount - expectedFee;

  initializeApp({
    config,
    registryAppClient,
    waypointInvoiceAppClient,
    accounts: { manager, requester, beneficiary, payer, advanceer },
    stableAsset,
    appAddress,
    expectedFee,
    expectedNet,
  });

  return {
    config,
    registryAppClient,
    waypointInvoiceAppClient,
    accounts: { manager, requester, beneficiary, payer, advanceer },
    stableAsset,
    appAddress,
    expectedFee,
    expectedNet,
  };
};

const initializeApp = async (scenario: ScenarioContext) => {
  const mbrTxn = scenario.waypointInvoiceAppClient.algorand.createTransaction.payment({
    sender: scenario.accounts.manager.addr,
    receiver: scenario.waypointInvoiceAppClient.appAddress,
    amount: microAlgo(400_000n),
  });

  await scenario.waypointInvoiceAppClient.send.initApp({
    args: { mbrTxn },
    sender: scenario.accounts.manager.addr,
  });
};

const requestRoute = async (scenario: ScenarioContext, overrides: Partial<ScenarioConfig> = {}) => {
  const config = { ...scenario.config, ...overrides };
  const { requester, beneficiary, payer } = scenario.accounts;
  await scenario.waypointInvoiceAppClient.algorand.setSignerFromAccount(requester);

  await scenario.waypointInvoiceAppClient
    .newGroup()
    .createRoute({
      sender: requester.addr,
      appReferences: [scenario.registryAppClient.appId],
      assetReferences: [scenario.stableAsset],
      args: {
        beneficiary: beneficiary.addr.toString(),
        payer: payer.addr.toString(),
        startTs: config.startTs,
        periodSecs: config.periodSecs,
        payoutAmount: config.payoutAmount,
        maxPeriods: config.maxPeriods,
        depositAmount: config.grossInvoiceAmount,
        tokenId: scenario.stableAsset,
      },
    })
    .send();
};

const fundRoute = async (scenario: ScenarioContext, amount?: bigint) => {
  const { payer, beneficiary, requester } = scenario.accounts;
  await scenario.waypointInvoiceAppClient.algorand.setSignerFromAccount(payer);

  const tokenTransfer = await localnet.context.algorand.createTransaction.assetTransfer({
    sender: payer.addr,
    receiver: scenario.appAddress,
    assetId: scenario.stableAsset,
    amount: amount ?? scenario.config.grossInvoiceAmount,
  });

  return scenario.waypointInvoiceAppClient
    .newGroup()
    .acceptRoute({
      sender: payer.addr,
      appReferences: [scenario.registryAppClient.appId],
      accountReferences: [requester.addr, beneficiary.addr],
      assetReferences: [scenario.stableAsset],
      args: { tokenTransfer },
    })
    .send();
};

const advanceRounds = async (scenario: ScenarioContext, rounds: number) => {
  await localnet.context.algorand.setSignerFromAccount(scenario.accounts.advanceer);
  for (let i = 0; i < rounds; i++) {
    await localnet.context.algorand.send.payment({
      sender: scenario.accounts.advanceer.addr,
      receiver: scenario.accounts.advanceer.addr,
      amount: microAlgo(0),
      suppressLog: true,
    });
  }
};

describe("waypoint invoice contract", () => {
  test("createApplication sets initial state", async () => {
    const scenario = await setupScenario();
    const globalState = await scenario.waypointInvoiceAppClient.state.global.getAll();
    expect(globalState.tokenId).toBe(scenario.stableAsset);
    expect(globalState.contractVersion).toBe(1000n);
    expect(globalState.routeStatus).toBe(0n);
    expect(globalState.startTs).toBe(0n);
    expect(globalState.requestedStartTs).toBe(0n);
    expect(globalState.periodSecs).toBe(0n);
    expect(globalState.maxPeriods).toBe(0n);
    expect(globalState.depositAmount).toBe(0n);
    expect(globalState.grossDepositAmount).toBe(0n);
  });


  test("createRoute records invoice request without funding", async () => {
    const scenario = await setupScenario();
    await requestRoute(scenario, { startTs: 0n });

    const globalState = await scenario.waypointInvoiceAppClient.state.global.getAll();
    expect(globalState.beneficiary).toBe(
      algosdk.encodeAddress(algosdk.decodeAddress(scenario.accounts.beneficiary.addr.toString()).publicKey)
    );
    expect(globalState.requester).toBe(algosdk.encodeAddress(algosdk.decodeAddress(scenario.accounts.requester.addr.toString()).publicKey));
    expect(globalState.depositor).toBe(algosdk.encodeAddress(algosdk.decodeAddress(scenario.accounts.payer.addr.toString()).publicKey));
    expect(globalState.routeStatus).toBe(STATUS_PENDING);
    expect(globalState.requestedStartTs).toBe(0n);
    expect(globalState.startTs).toBe(0n);
    expect(globalState.grossDepositAmount).toBe(scenario.config.grossInvoiceAmount);
    expect(globalState.depositAmount).toBe(0n);
    expect(globalState.feeAmount).toBe(0n);

    const appAssetBalance = await getAssetBalance(scenario.stableAsset, scenario.appAddress);
    expect(appAssetBalance).toBe(0n);
  });

  test("acceptRoute funds the invoice and deducts fees", async () => {
    const scenario = await setupScenario();
    await requestRoute(scenario);

    const treasuryBalanceBefore = await getAssetBalance(scenario.stableAsset, scenario.accounts.manager.addr.toString());
    await fundRoute(scenario);

    const globalState = await scenario.waypointInvoiceAppClient.state.global.getAll();
    expect(globalState.routeStatus).toBe(STATUS_FUNDED);
    expect(globalState.depositAmount).toBe(scenario.expectedNet);
    expect(globalState.grossDepositAmount).toBe(scenario.config.grossInvoiceAmount);
    expect(globalState.feeAmount).toBe(scenario.expectedFee);
    expect(globalState.periodSecs).toBe(scenario.config.periodSecs);
    expect(globalState.maxPeriods).toBe(scenario.config.maxPeriods);
    expect(globalState.payoutAmount).toBe(scenario.config.payoutAmount);
    expect(globalState.startTs ?? 0n).toBeGreaterThanOrEqual(globalState.requestedStartTs ?? 0n);

    const appBalance = await getAssetBalance(scenario.stableAsset, scenario.appAddress);
    expect(appBalance).toBe(scenario.expectedNet);

    const treasuryBalanceAfter = await getAssetBalance(scenario.stableAsset, scenario.accounts.manager.addr.toString());
    expect(treasuryBalanceAfter - treasuryBalanceBefore).toBe(scenario.expectedFee);
  });

  test("claim releases accrued funds to beneficiary", async () => {
    const scenario = await setupScenario();
    await requestRoute(scenario);
    await fundRoute(scenario);

    await scenario.waypointInvoiceAppClient.algorand.setSignerFromAccount(scenario.accounts.beneficiary);
    const balanceBefore = await getAssetBalance(scenario.stableAsset, scenario.accounts.beneficiary.addr.toString());

    await scenario.waypointInvoiceAppClient.newGroup().claim({ args: {}, sender: scenario.accounts.beneficiary.addr }).send();

    const balanceAfter = await getAssetBalance(scenario.stableAsset, scenario.accounts.beneficiary.addr.toString());
    expect(balanceAfter - balanceBefore).toBe(scenario.expectedNet);

    const globalState = await scenario.waypointInvoiceAppClient.state.global.getAll();
    expect(globalState.claimedAmount).toBe(scenario.expectedNet);

    const appBalance = await getAssetBalance(scenario.stableAsset, scenario.appAddress);
    expect(appBalance).toBe(0n);

    await expect(
      scenario.waypointInvoiceAppClient.newGroup().claim({ args: {}, sender: scenario.accounts.beneficiary.addr }).send()
    ).rejects.toThrow(/Nothing claimable yet/);
  });

  test("payer can decline pending routes", async () => {
    const scenario = await setupScenario();
    await requestRoute(scenario);

    await scenario.waypointInvoiceAppClient.algorand.setSignerFromAccount(scenario.accounts.payer);
    await scenario.waypointInvoiceAppClient.newGroup().declineRoute({ args: {}, sender: scenario.accounts.payer.addr }).send();

    const globalState = await scenario.waypointInvoiceAppClient.state.global.getAll();
    expect(globalState.routeStatus).toBe(STATUS_DECLINED);

    await expect(fundRoute(scenario)).rejects.toThrow(/Route not pending|assert/);
  });

  test("non-beneficiary cannot claim funds", async () => {
    const scenario = await setupScenario();
    await requestRoute(scenario);
    await fundRoute(scenario);

    await scenario.waypointInvoiceAppClient.algorand.setSignerFromAccount(scenario.accounts.requester);
    await expect(
      scenario.waypointInvoiceAppClient.newGroup().claim({ args: {}, sender: scenario.accounts.requester.addr }).send()
    ).rejects.toThrow(/Only beneficiary can claim/);
  });

  test("acceptRoute rejects insufficient funding", async () => {
    const scenario = await setupScenario();
    await requestRoute(scenario);

    await expect(fundRoute(scenario, scenario.config.grossInvoiceAmount - 1n)).rejects.toThrow(/assert|Route/);
  });

  test.skip("multi-period schedule releases incremental payouts", async () => {
    const scenario = await setupScenario({ periodSecs: 3n, maxPeriods: 3n, payoutAmount: 400n });
    const currentTimestamp = BigInt(Math.floor(Date.now() / 1000)); // align requested start with current ledger time
    await requestRoute(scenario, { startTs: currentTimestamp });
    await fundRoute(scenario);

    const netPerPeriod = (scenario.config.payoutAmount * scenario.expectedNet) / scenario.config.grossInvoiceAmount;
    await scenario.waypointInvoiceAppClient.algorand.setSignerFromAccount(scenario.accounts.beneficiary);

    await advanceRounds(scenario, 5);
    const balanceBefore = await getAssetBalance(scenario.stableAsset, scenario.accounts.beneficiary.addr.toString());
    await scenario.waypointInvoiceAppClient.newGroup().claim({ args: {}, sender: scenario.accounts.beneficiary.addr }).send();
    const balanceAfterFirst = await getAssetBalance(scenario.stableAsset, scenario.accounts.beneficiary.addr.toString());
    expect(balanceAfterFirst - balanceBefore).toBe(netPerPeriod);

    await advanceRounds(scenario, 5);
    await scenario.waypointInvoiceAppClient.newGroup().claim({ args: {}, sender: scenario.accounts.beneficiary.addr }).send();
    const balanceAfterSecond = await getAssetBalance(scenario.stableAsset, scenario.accounts.beneficiary.addr.toString());
    expect(balanceAfterSecond - balanceAfterFirst).toBe(netPerPeriod);

    await advanceRounds(scenario, 5);
    await scenario.waypointInvoiceAppClient.newGroup().claim({ args: {}, sender: scenario.accounts.beneficiary.addr }).send();
    const finalBalance = await getAssetBalance(scenario.stableAsset, scenario.accounts.beneficiary.addr.toString());
    expect(finalBalance - balanceBefore).toBe(scenario.expectedNet);

    const globalState = await scenario.waypointInvoiceAppClient.state.global.getAll();
    expect(globalState.claimedAmount).toBe(scenario.expectedNet);
  });
});
