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

let waypointInvoiceAppClient: WaypointInvoiceClient;
let registryAppClient: WaypointRegistryClient;
let managerAccount: Account;
let requesterAccount: Account;
let beneficiaryAccount: Account;
let payerAccount: Account;
let stableAsset: bigint;
let appAddress: string;

const STATUS_PENDING = 1n;
const STATUS_FUNDED = 2n;
const FEE_BPS = 50n;
const GROSS_INVOICE_AMOUNT = 1_000n;
const PERIOD_SECS = 1n;
const MAX_PERIODS = 1n;
const PAYOUT_AMOUNT = GROSS_INVOICE_AMOUNT;
const EXPECTED_FEE = (GROSS_INVOICE_AMOUNT * FEE_BPS) / 10_000n;
const EXPECTED_NET = GROSS_INVOICE_AMOUNT - EXPECTED_FEE;

describe("waypoint invoice contract", async () => {
  const localnet = algorandFixture();

  beforeAll(async () => {
    await localnet.newScope();

    Config.configure({ debug: true });
    registerDebugEventHandlers();

    const { generateAccount } = localnet.context;
    managerAccount = await generateAccount({ initialFunds: microAlgo(90_000_000_000) });
    requesterAccount = await generateAccount({ initialFunds: microAlgo(10_000_000) });
    beneficiaryAccount = await generateAccount({ initialFunds: microAlgo(10_000_000) });
    payerAccount = await generateAccount({ initialFunds: microAlgo(90_000_000) });

    stableAsset = await createToken(managerAccount, "XUSD", 6);

    await localnet.context.algorand.setSignerFromAccount(beneficiaryAccount);
    await localnet.context.algorand.send.assetOptIn({
      sender: beneficiaryAccount.addr,
      assetId: stableAsset,
      suppressLog: true,
    });

    await localnet.context.algorand.setSignerFromAccount(payerAccount);
    await localnet.context.algorand.send.assetOptIn({
      sender: payerAccount.addr,
      assetId: stableAsset,
      suppressLog: true,
    });

    await localnet.context.algorand.setSignerFromAccount(managerAccount);
    await localnet.context.algorand.send.assetTransfer({
      sender: managerAccount.addr,
      receiver: payerAccount.addr,
      assetId: stableAsset,
      amount: 10_000n,
      suppressLog: true,
    });

    registryAppClient = await deployRegistry({
      deployer: managerAccount,
      tokenId: stableAsset,
      fluxOracleAppId: 0n,
      treasury: managerAccount,
      feeBps: FEE_BPS,
    });

    await localnet.algorand.send.payment({
      sender: managerAccount.addr,
      receiver: registryAppClient.appAddress,
      amount: microAlgo(200_000),
      suppressLog: true,
    });

    waypointInvoiceAppClient = await deploy({
      deployer: managerAccount,
      tokenId: stableAsset,
      fluxOracleAppId: 0n,
      treasury: managerAccount,
      feeBps: FEE_BPS,
      registryAppId: registryAppClient.appId,
    });
    appAddress = algosdk.encodeAddress(waypointInvoiceAppClient.appAddress.publicKey);
    await waypointInvoiceAppClient.algorand.setSignerFromAccount(managerAccount);
  });

  const getAssetBalance = async (address: string) => {
    try {
      const holding = await localnet.context.algod.accountAssetInformation(address, Number(stableAsset)).do();
      return BigInt(holding.assetHolding?.amount ?? 0);
    } catch {
      return 0n;
    }
  };

  test("createApplication sets initial state", async () => {
    const globalState = await waypointInvoiceAppClient.state.global.getAll();
    expect(globalState.tokenId).toBe(stableAsset);
    expect(globalState.contractVersion).toBe(1000n);
    expect(globalState.routeStatus).toBe(0n);
    expect(globalState.startTs).toBe(0n);
    expect(globalState.requestedStartTs).toBe(0n);
    expect(globalState.periodSecs).toBe(0n);
    expect(globalState.maxPeriods).toBe(0n);
    expect(globalState.depositAmount).toBe(0n);
    expect(globalState.grossDepositAmount).toBe(0n);
  });

  test("initApp prepares escrow holdings", async () => {
    const mbrTxn = waypointInvoiceAppClient.algorand.createTransaction.payment({
      sender: managerAccount.addr,
      receiver: waypointInvoiceAppClient.appAddress,
      amount: microAlgo(400_000n),
    });

    await waypointInvoiceAppClient.send.initApp({
      args: { mbrTxn },
      sender: managerAccount.addr,
    });

    const appAssetBalance = await getAssetBalance(appAddress);
    const appAlgoBalance = await localnet.context.algod.accountInformation(appAddress).do();

    expect(appAlgoBalance.amount).toBe(400_000n - 1_000n);
    expect(appAssetBalance).toBe(0n);
  });

  test("createRoute records invoice request without funding", async () => {
    await waypointInvoiceAppClient.algorand.setSignerFromAccount(requesterAccount);

    const startTs = 0n;

    await waypointInvoiceAppClient
      .newGroup()
      .createRoute({
        sender: requesterAccount.addr,
        appReferences: [registryAppClient.appId],
        assetReferences: [stableAsset],
        args: {
          beneficiary: beneficiaryAccount.addr.toString(),
          payer: payerAccount.addr.toString(),
          startTs,
          periodSecs: PERIOD_SECS,
          payoutAmount: PAYOUT_AMOUNT,
          maxPeriods: MAX_PERIODS,
          depositAmount: GROSS_INVOICE_AMOUNT,
          tokenId: stableAsset,
        },
      })
      .send();

    const globalState = await waypointInvoiceAppClient.state.global.getAll();
    expect(globalState.beneficiary).toBe(algosdk.encodeAddress(beneficiaryAccount.addr.publicKey));
    expect(globalState.requester).toBe(algosdk.encodeAddress(requesterAccount.addr.publicKey));
    expect(globalState.depositor).toBe(algosdk.encodeAddress(payerAccount.addr.publicKey));
    expect(globalState.routeStatus).toBe(STATUS_PENDING);
    expect(globalState.requestedStartTs).toBe(startTs);
    expect(globalState.startTs).toBe(0n);
    expect(globalState.grossDepositAmount).toBe(GROSS_INVOICE_AMOUNT);
    expect(globalState.depositAmount).toBe(0n);
    expect(globalState.feeAmount).toBe(0n);

    const appAssetBalance = await getAssetBalance(appAddress);
    expect(appAssetBalance).toBe(0n);
  });

  test("acceptRoute funds the invoice and deducts fees", async () => {
    await waypointInvoiceAppClient.algorand.setSignerFromAccount(payerAccount);

    const treasuryBalanceBefore = await getAssetBalance(managerAccount.addr.toString());

    const tokenTransfer = await localnet.context.algorand.createTransaction.assetTransfer({
      sender: payerAccount.addr,
      receiver: appAddress,
      assetId: stableAsset,
      amount: GROSS_INVOICE_AMOUNT,
    });

    await waypointInvoiceAppClient
      .newGroup()
      .acceptRoute({
        sender: payerAccount.addr,
        appReferences: [registryAppClient.appId],
        accountReferences: [requesterAccount.addr, beneficiaryAccount.addr],
        assetReferences: [stableAsset],
        args: { tokenTransfer },
      })
      .send();

    const globalState = await waypointInvoiceAppClient.state.global.getAll();
    expect(globalState.routeStatus).toBe(STATUS_FUNDED);
    expect(globalState.depositAmount).toBe(EXPECTED_NET);
    expect(globalState.grossDepositAmount).toBe(GROSS_INVOICE_AMOUNT);
    expect(globalState.feeAmount).toBe(EXPECTED_FEE);
    expect(globalState.periodSecs).toBe(PERIOD_SECS);
    expect(globalState.maxPeriods).toBe(MAX_PERIODS);
    expect(globalState.payoutAmount).toBe(PAYOUT_AMOUNT);
    expect(globalState.startTs ?? 0n).toBeGreaterThanOrEqual(globalState.requestedStartTs ?? 0n);

    const appBalance = await getAssetBalance(appAddress);
    expect(appBalance).toBe(EXPECTED_NET);

    const treasuryBalanceAfter = await getAssetBalance(managerAccount.addr.toString());
    expect(treasuryBalanceAfter - treasuryBalanceBefore).toBe(EXPECTED_FEE);
  });

  test("claim releases accrued funds to beneficiary", async () => {
    await waypointInvoiceAppClient.algorand.setSignerFromAccount(beneficiaryAccount);

    await expect(
      waypointInvoiceAppClient
        .newGroup()
        .claim({
          args: {},
          sender: beneficiaryAccount.addr,
        })
        .send()
    ).rejects.toThrow(/Nothing claimable yet/);

    const status = await localnet.context.algod.status().do();
    //await localnet.context.algorand.waitForBlock(status["last-round"] + 4);

    const balanceBefore = await getAssetBalance(beneficiaryAccount.addr.toString());

    await waypointInvoiceAppClient.newGroup().claim({ args: {} }).send();

    const balanceAfter = await getAssetBalance(beneficiaryAccount.addr.toString());
    expect(balanceAfter - balanceBefore).toBe(EXPECTED_NET);

    const globalState = await waypointInvoiceAppClient.state.global.getAll();
    expect(globalState.claimedAmount).toBe(EXPECTED_NET);

    const appBalance = await getAssetBalance(appAddress);
    expect(appBalance).toBe(0n);

    await expect(
      waypointInvoiceAppClient
        .newGroup()
        .claim({
          args: {},
        })
        .send()
    ).rejects.toThrow(/Nothing claimable yet/);
  });
});
