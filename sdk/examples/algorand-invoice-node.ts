/**
 * Waypoint SDK - Algorand Invoice Route Example (Node.js)
 *
 * This example demonstrates how to create and interact with invoice routes
 * on Algorand using the Waypoint SDK.
 * 
 * Invoice routes are two-phase:
 * 1. Requester (beneficiary) creates a payment request
 * 2. Payer reviews and either accepts (funds) or declines
 * 
 * Perfect for B2B invoicing, freelance work, and payment requests.
 */

import algosdk from 'algosdk';
import { AlgorandWaypointClient, InvoiceRouteStatus } from '../src';

async function main() {
  console.log('🚀 Waypoint SDK - Algorand Invoice Route Example\n');

  // ============================================================================
  // 1. Initialize Algorand Waypoint SDK
  // ============================================================================

  const client = new AlgorandWaypointClient({
    network: 'testnet', // or 'mainnet'
  });

  console.log(`✅ Connected to ${client.getNetwork()}`);
  console.log(`✅ Registry App ID: ${client.getRegistryAppId()}\n`);

  // ============================================================================
  // 2. Create Accounts (in production, use real wallets)
  // ============================================================================

  // WARNING: Never hardcode mnemonics in production!
  const requesterMnemonic = process.env.REQUESTER_MNEMONIC; // Usually the beneficiary
  const payerMnemonic = process.env.PAYER_MNEMONIC; // Client who will pay

  if (!requesterMnemonic || !payerMnemonic) {
    console.error('❌ Please set REQUESTER_MNEMONIC and PAYER_MNEMONIC environment variables');
    process.exit(1);
  }

  const requester = algosdk.mnemonicToSecretKey(requesterMnemonic);
  const payer = algosdk.mnemonicToSecretKey(payerMnemonic);

  // In most cases, requester and beneficiary are the same (freelancer invoicing client)
  const beneficiary = requester;

  console.log(`👤 Requester/Beneficiary: ${requester.addr}`);
  console.log(`👤 Payer: ${payer.addr}\n`);

  // ============================================================================
  // 3. Create an Invoice Payment Request
  // ============================================================================

  console.log('📝 Creating invoice payment request...\n');

  const tokenId = 10458941n; // Example: USDC on Algorand testnet
  const invoiceAmount = 5_000_000000n; // $5,000 USDC (6 decimals)

  // For a simple one-time payment invoice:
  const startTimestamp = BigInt(Math.floor(Date.now() / 1000)); // Start immediately when funded
  const periodSeconds = 1n; // Doesn't matter for single payment
  const maxPeriods = 1n; // Single payment
  const payoutAmount = invoiceAmount; // Full amount in one payment

  try {
    console.log('🔍 Requester creates invoice request...');
    const result = await client.createInvoiceRequest({
      requester: requester.addr,
      beneficiary: beneficiary.addr,
      payer: payer.addr,
      tokenId,
      grossInvoiceAmount: invoiceAmount,
      payoutAmount,
      startTimestamp,
      periodSeconds,
      maxPeriods,
      signer: algosdk.makeBasicAccountTransactionSigner(requester),
    });

    console.log('✅ Invoice request created successfully!');
    console.log(`📍 Invoice App ID: ${result.routeAppId}`);
    console.log(`📍 Invoice Address: ${result.routeAppAddress}`);
    console.log(`📤 Transaction IDs: ${result.txIds.join(', ')}\n`);

    const invoiceAppId = result.routeAppId;

    // ============================================================================
    // 4. Check Invoice Status
    // ============================================================================

    console.log('🔍 Checking invoice status...');
    const status = await client.getInvoiceStatus(invoiceAppId);
    
    console.log(`✅ Status: ${InvoiceRouteStatus[status]} (${status})`);
    
    if (status === InvoiceRouteStatus.PENDING) {
      console.log('⏳ Invoice is awaiting payer approval\n');
    }

    // ============================================================================
    // 5. Get Invoice Details
    // ============================================================================

    console.log('📊 Fetching invoice details...');
    const details = await client.getInvoiceRouteDetails(invoiceAppId);

    if (details) {
      console.log('Invoice Details:');
      console.log(`  Requester: ${details.requester}`);
      console.log(`  Payer: ${details.depositor}`);
      console.log(`  Beneficiary: ${details.beneficiary}`);
      console.log(`  Token ID: ${details.tokenId}`);
      console.log(`  Gross Amount: ${details.grossDepositAmount}`);
      console.log(`  Net Amount: ${details.depositAmount} (after fees)`);
      console.log(`  Fee: ${details.feeAmount}`);
      console.log(`  Status: ${InvoiceRouteStatus[details.routeStatus]}\n`);
    }

    // ============================================================================
    // 6. Payer Reviews and Decides
    // ============================================================================

    console.log('💭 Payer reviews invoice...\n');
    
    // In a real application, payer would review the invoice details
    // and decide whether to accept or decline
    
    // Simulate user decision (in production, this would be user input)
    const payerDecision = process.env.PAYER_DECISION || 'accept'; // 'accept' or 'decline'

    if (payerDecision === 'decline') {
      // ========================================================================
      // SCENARIO A: Payer Declines
      // ========================================================================
      
      console.log('❌ Payer decides to decline the invoice...');
      
      const declineResult = await client.declineInvoiceRoute({
        routeAppId: invoiceAppId,
        payer: payer.addr,
        signer: algosdk.makeBasicAccountTransactionSigner(payer),
      });

      console.log('✅ Invoice declined!');
      console.log(`📤 Transaction ID: ${declineResult.txId}\n`);

      const newStatus = await client.getInvoiceStatus(invoiceAppId);
      console.log(`📊 New Status: ${InvoiceRouteStatus[newStatus]}\n`);
      
    } else {
      // ========================================================================
      // SCENARIO B: Payer Accepts and Funds
      // ========================================================================
      
      console.log('✅ Payer decides to accept and fund the invoice...');
      
      const acceptResult = await client.acceptInvoiceRoute({
        routeAppId: invoiceAppId,
        payer: payer.addr,
        signer: algosdk.makeBasicAccountTransactionSigner(payer),
        // userTier and nominatedAssetId will be fetched automatically
      });

      console.log('✅ Invoice accepted and funded!');
      console.log(`📤 Transaction ID: ${acceptResult.txId}\n`);

      const newStatus = await client.getInvoiceStatus(invoiceAppId);
      console.log(`📊 New Status: ${InvoiceRouteStatus[newStatus]}\n`);

      // ======================================================================
      // 7. Check Updated Invoice Details
      // ======================================================================

      console.log('📊 Fetching updated invoice details...');
      const updatedDetails = await client.getInvoiceRouteDetails(invoiceAppId);

      if (updatedDetails) {
        console.log('Updated Invoice:');
        console.log(`  Status: ${InvoiceRouteStatus[updatedDetails.routeStatus]}`);
        console.log(`  Net Amount Held: ${updatedDetails.depositAmount}`);
        console.log(`  Fee Deducted: ${updatedDetails.feeAmount}`);
        console.log(`  Start Time: ${new Date(Number(updatedDetails.startTimestamp) * 1000).toISOString()}\n`);
      }

      // ======================================================================
      // 8. Calculate Claimable Amount
      // ======================================================================

      console.log('💰 Calculating claimable amount...');
      const claimable = await client.calculateInvoiceClaimableAmount(invoiceAppId);
      console.log(`✅ Currently claimable: ${claimable} tokens\n`);

      // ======================================================================
      // 9. Beneficiary Claims Payment
      // ======================================================================

      if (claimable > 0n) {
        console.log('💸 Beneficiary claiming payment...');

        const claimResult = await client.claimFromRoute({
          routeAppId: invoiceAppId,
          beneficiary: beneficiary.addr,
          signer: algosdk.makeBasicAccountTransactionSigner(beneficiary),
        });

        console.log('✅ Payment claimed successfully!');
        console.log(`📤 Transaction ID: ${claimResult.txId}`);
        console.log(`💰 Claimed Amount: ${claimResult.claimedAmount}`);
        console.log(`💰 Total Claimed: ${claimResult.totalClaimed}\n`);
      } else {
        console.log('⏳ No tokens claimable yet\n');
      }
    }

    // ==========================================================================
    // 10. Check Final Status
    // ==========================================================================

    console.log('🔍 Final invoice status...');
    const finalStatus = await client.getInvoiceStatus(invoiceAppId);
    console.log(`✅ Final Status: ${InvoiceRouteStatus[finalStatus]}\n`);

    // Check helper methods
    const isPending = await client.isInvoicePending(invoiceAppId);
    const isFunded = await client.isInvoiceFunded(invoiceAppId);
    const isDeclined = await client.isInvoiceDeclined(invoiceAppId);

    console.log('Status Checks:');
    console.log(`  Is Pending: ${isPending}`);
    console.log(`  Is Funded: ${isFunded}`);
    console.log(`  Is Declined: ${isDeclined}\n`);

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }

  console.log('🎉 Example complete!');
}

// Run the example
main().catch(console.error);

