/// <reference types="node" />

/**
 * Waypoint SDK - Aptos Invoice Route Example (Node.js)
 *
 * This example demonstrates how to create and interact with invoice routes
 * on Aptos using the Waypoint SDK.
 * 
 * Invoice routes support two patterns:
 * 1. Two-phase: Beneficiary creates invoice → Payer funds later
 * 2. Single-phase: Creator funds immediately upon creation
 * 
 * Perfect for B2B invoicing, freelance work, and payment requests.
 */

import {
  Aptos,
  AptosConfig,
  Network,
  Account,
  Ed25519PrivateKey,
} from "@aptos-labs/ts-sdk";
import { AptosWaypointClient, InvoiceRouteStatus } from "../src";

async function main() {
  console.log("🚀 Waypoint SDK - Aptos Invoice Route Example\n");

  // ============================================================================
  // 1. Initialize Aptos SDK and Waypoint SDK
  // ============================================================================

  const network = Network.TESTNET; // or Network.MAINNET
  const aptosConfig = new AptosConfig({ network });
  const aptos = new Aptos(aptosConfig);

  const waypoint = new AptosWaypointClient({
    network: "testnet", // or 'mainnet'
    // backendUrl: 'https://your-backend.com' // Optional
  });

  console.log(`✅ Connected to ${network}`);
  console.log(`✅ Waypoint SDK initialized\n`);

  // ============================================================================
  // 2. Create Test Accounts (in production, use real wallets)
  // ============================================================================

  // WARNING: Never hardcode private keys in production!
  // This is just for demonstration purposes
  const beneficiaryPrivateKeyHex = process.env.BENEFICIARY_PRIVATE_KEY;
  const payerPrivateKeyHex = process.env.PAYER_PRIVATE_KEY;

  if (!beneficiaryPrivateKeyHex || !payerPrivateKeyHex) {
    console.error("❌ Please set BENEFICIARY_PRIVATE_KEY and PAYER_PRIVATE_KEY environment variables");
    process.exit(1);
  }

  const beneficiaryPrivateKey = new Ed25519PrivateKey(beneficiaryPrivateKeyHex);
  const payerPrivateKey = new Ed25519PrivateKey(payerPrivateKeyHex);

  const beneficiary = Account.fromPrivateKey({ privateKey: beneficiaryPrivateKey });
  const payer = Account.fromPrivateKey({ privateKey: payerPrivateKey });

  console.log(`👤 Beneficiary: ${beneficiary.accountAddress.toString()}`);
  console.log(`👤 Payer: ${payer.accountAddress.toString()}\n`);

  // ============================================================================
  // SCENARIO 1: Two-Phase Invoice (Create then Fund)
  // ============================================================================

  console.log("=".repeat(70));
  console.log("SCENARIO 1: Two-Phase Invoice (Create → Fund Later)");
  console.log("=".repeat(70) + "\n");

  const tokenMetadata = process.env.TOKEN_METADATA_ADDRESS || "0x1::aptos_coin::AptosCoin"; // Example: Use AptosCoin or your token metadata
  const invoiceAmount = 1000_000000n; // 1000 tokens (assuming 6 decimals)

  // For a simple one-time payment invoice:
  const startTimestamp = Math.floor(Date.now() / 1000); // Start immediately when funded
  const periodSeconds = 1; // Doesn't matter for single payment
  const maxPeriods = 1; // Single payment
  const payoutAmount = invoiceAmount; // Full amount in one payment

  try {
    // Step 1: Beneficiary creates invoice request
    console.log("📝 Step 1: Beneficiary creates invoice request...");

    const createInvoiceTx = await waypoint.buildCreateInvoiceTransaction({
      beneficiary: beneficiary.accountAddress.toString(),
      payer: payer.accountAddress.toString(),
      tokenMetadata,
      amount: invoiceAmount,
      startTimestamp,
      periodSeconds,
      payoutAmount,
      maxPeriods,
    });

    console.log("✅ Transaction payload generated");

    const createTransaction = await aptos.transaction.build.simple({
      sender: beneficiary.accountAddress.toString(),
      data: createInvoiceTx,
    });

    console.log("✍️  Signing transaction...");
    const createCommitted = await aptos.signAndSubmitTransaction({
      signer: beneficiary,
      transaction: createTransaction,
    });

    console.log(`📤 Transaction submitted: ${createCommitted.hash}`);

    // Wait for transaction confirmation
    console.log("⏳ Waiting for confirmation...");
    const createTxResult = await aptos.waitForTransaction({
      transactionHash: createCommitted.hash,
    });

    console.log("✅ Invoice created!\n");

    // Extract route address from transaction events
    // Note: In production, parse the InvoiceCreated event to get route_addr
    // For this example, we'll query the list to find it
    console.log("🔍 Finding created invoice route...");
    const routes = await waypoint.listInvoiceRoutes();
    const invoiceRouteAddress = routes[routes.length - 1]; // Get the most recent

    console.log(`📍 Invoice Route Address: ${invoiceRouteAddress}\n`);

    // Step 2: Check invoice status
    console.log("📊 Step 2: Checking invoice status...");
    const invoiceDetails = await waypoint.getInvoiceRouteDetails(invoiceRouteAddress);

    console.log("Invoice Details:");
    console.log(`  Route Address: ${invoiceDetails.routeAddress}`);
    console.log(`  Payer: ${invoiceDetails.payer}`);
    console.log(`  Beneficiary: ${invoiceDetails.beneficiary}`);
    console.log(`  Requested Amount: ${invoiceDetails.requestedAmount}`);
    console.log(`  Fee Amount: ${invoiceDetails.feeAmount}`);
    console.log(`  Deposit Amount: ${invoiceDetails.depositAmount}`);
    console.log(`  Funded: ${invoiceDetails.funded ? "Yes" : "No"}\n`);

    if (!invoiceDetails.funded) {
      console.log("⏳ Invoice is awaiting payer funding\n");

      // Step 3: Payer funds the invoice
      console.log("💰 Step 3: Payer funds the invoice...");

      const fundInvoiceTx = await waypoint.buildFundInvoiceTransaction({
        payer: payer.accountAddress.toString(),
        routeAddress: invoiceRouteAddress,
      });

      console.log("✅ Transaction payload generated");

      const fundTransaction = await aptos.transaction.build.simple({
        sender: payer.accountAddress.toString(),
        data: fundInvoiceTx,
      });

      console.log("✍️  Signing transaction...");
      const fundCommitted = await aptos.signAndSubmitTransaction({
        signer: payer,
        transaction: fundTransaction,
      });

      console.log(`📤 Transaction submitted: ${fundCommitted.hash}`);

      await aptos.waitForTransaction({
        transactionHash: fundCommitted.hash,
      });

      console.log("✅ Invoice funded!\n");

      // Step 4: Check updated status
      console.log("📊 Step 4: Checking updated invoice status...");
      const updatedDetails = await waypoint.getInvoiceRouteDetails(invoiceRouteAddress);

      console.log("Updated Invoice:");
      console.log(`  Funded: ${updatedDetails.funded ? "Yes" : "No"}`);
      console.log(`  Net Amount Held: ${updatedDetails.depositAmount}`);
      console.log(`  Fee Deducted: ${updatedDetails.feeAmount}`);
      console.log(`  Start Time: ${new Date(updatedDetails.startTimestamp * 1000).toISOString()}\n`);

      // Step 5: Calculate claimable amount
      console.log("💰 Step 5: Calculating claimable amount...");
      const claimable = await waypoint.getInvoiceClaimableAmount(invoiceRouteAddress);
      console.log(`✅ Currently claimable: ${claimable} tokens\n`);

      // Step 6: Beneficiary claims payment
      if (claimable > 0n) {
        console.log("💸 Step 6: Beneficiary claiming payment...");

        const claimTx = await waypoint.buildClaimInvoiceTransaction({
          caller: beneficiary.accountAddress.toString(),
          routeAddress: invoiceRouteAddress,
        });

        console.log("✅ Transaction payload generated");

        const claimTransaction = await aptos.transaction.build.simple({
          sender: beneficiary.accountAddress.toString(),
          data: claimTx,
        });

        console.log("✍️  Signing transaction...");
        const claimCommitted = await aptos.signAndSubmitTransaction({
          signer: beneficiary,
          transaction: claimTransaction,
        });

        console.log(`📤 Transaction submitted: ${claimCommitted.hash}`);

        await aptos.waitForTransaction({
          transactionHash: claimCommitted.hash,
        });

        console.log("✅ Payment claimed successfully!\n");

        // Check final status
        const finalDetails = await waypoint.getInvoiceRouteDetails(invoiceRouteAddress);
        console.log(`💰 Total Claimed: ${finalDetails.claimedAmount}\n`);
      } else {
        console.log("⏳ No tokens claimable yet\n");
      }
    }

    // ============================================================================
    // SCENARIO 2: Single-Phase Invoice (Create and Fund in One Call)
    // ============================================================================

    console.log("\n" + "=".repeat(70));
    console.log("SCENARIO 2: Single-Phase Invoice (Create & Fund Immediately)");
    console.log("=".repeat(70) + "\n");

    console.log("📝 Creating and funding invoice in one transaction...");

    const createAndFundTx = await waypoint.buildCreateRouteAndFundTransaction({
      creator: payer.accountAddress.toString(),
      beneficiary: beneficiary.accountAddress.toString(),
      tokenMetadata,
      amount: invoiceAmount,
      startTimestamp: Math.floor(Date.now() / 1000),
      periodSeconds: 2592000, // 30 days
      payoutAmount: 100_000000n, // 100 tokens per period
      maxPeriods: 10, // 10 periods
    });

    console.log("✅ Transaction payload generated");

    const createAndFundTransaction = await aptos.transaction.build.simple({
      sender: payer.accountAddress.toString(),
      data: createAndFundTx,
    });

    console.log("✍️  Signing transaction...");
    const createAndFundCommitted = await aptos.signAndSubmitTransaction({
      signer: payer,
      transaction: createAndFundTransaction,
    });

    console.log(`📤 Transaction submitted: ${createAndFundCommitted.hash}`);

    await aptos.waitForTransaction({
      transactionHash: createAndFundCommitted.hash,
    });

    console.log("✅ Invoice created and funded!\n");

    // Get the new route
    const allRoutes = await waypoint.listInvoiceRoutes();
    const newRouteAddress = allRoutes[allRoutes.length - 1];

    console.log(`📍 New Route Address: ${newRouteAddress}`);

    const newRouteDetails = await waypoint.getInvoiceRouteDetails(newRouteAddress);
    console.log(`  Funded: ${newRouteDetails.funded ? "Yes" : "No"}`);
    console.log(`  Deposit Amount: ${newRouteDetails.depositAmount}`);
    console.log(`  Fee Amount: ${newRouteDetails.feeAmount}\n`);

    // ============================================================================
    // Query Examples
    // ============================================================================

    console.log("=".repeat(70));
    console.log("QUERY EXAMPLES");
    console.log("=".repeat(70) + "\n");

    console.log("🔍 Listing all invoice routes...");
    const allInvoiceRoutes = await waypoint.listInvoiceRoutes();
    console.log(`Found ${allInvoiceRoutes.length} invoice routes\n`);

    if (allInvoiceRoutes.length > 0) {
      const exampleRoute = allInvoiceRoutes[0];
      console.log(`📊 Details for route ${exampleRoute}:`);

      const routeDetails = await waypoint.getInvoiceRouteDetails(exampleRoute);
      console.log(`  Payer: ${routeDetails.payer}`);
      console.log(`  Beneficiary: ${routeDetails.beneficiary}`);
      console.log(`  Requested Amount: ${routeDetails.requestedAmount}`);
      console.log(`  Deposit Amount: ${routeDetails.depositAmount}`);
      console.log(`  Claimed Amount: ${routeDetails.claimedAmount}`);
      console.log(`  Funded: ${routeDetails.funded ? "Yes" : "No"}`);

      const claimable = await waypoint.getInvoiceClaimableAmount(exampleRoute);
      console.log(`  Claimable Now: ${claimable}\n`);
    }

    // ============================================================================
    // Fee Calculation
    // ============================================================================

    console.log("💵 Fee Calculation Example:");
    const testAmount = 1000_000000n;
    const fee = waypoint.calculateFee(testAmount);
    console.log(`  Amount: ${testAmount}`);
    console.log(`  Fee (0.5%): ${fee}`);
    console.log(`  Net Amount: ${testAmount - fee}\n`);

    console.log("🎉 Example complete!");
  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  }
}

// Run the example
main().catch(console.error);

