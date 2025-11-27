/**
 * Waypoint SDK - Algorand Linear Route Example (Node.js)
 *
 * This example demonstrates how to create and interact with linear streaming routes
 * on Algorand using the Waypoint SDK.
 * 
 * Linear routes are single-phase: depositor creates and funds the route immediately.
 * Perfect for payroll, subscriptions, and token vesting.
 */

import algosdk from 'algosdk';
import { AlgorandWaypointClient } from '../src';

async function main() {
  console.log('🚀 Waypoint SDK - Algorand Linear Route Example\n');

  // ============================================================================
  // 1. Initialize Algorand Waypoint SDK
  // ============================================================================

  const client = new AlgorandWaypointClient({
    network: 'testnet', // or 'mainnet'
    // Optional: Custom Algod configuration
    // algodUrl: 'https://testnet-api.algonode.cloud',
    // algodToken: '',
  });

  console.log(`✅ Connected to ${client.getNetwork()}`);
  console.log(`✅ Registry App ID: ${client.getRegistryAppId()}\n`);

  // ============================================================================
  // 2. Create Accounts (in production, use real wallets)
  // ============================================================================

  // WARNING: Never hardcode mnemonics in production!
  const depositorMnemonic = process.env.DEPOSITOR_MNEMONIC;
  const beneficiaryMnemonic = process.env.BENEFICIARY_MNEMONIC;

  if (!depositorMnemonic || !beneficiaryMnemonic) {
    console.error('❌ Please set DEPOSITOR_MNEMONIC and BENEFICIARY_MNEMONIC environment variables');
    process.exit(1);
  }

  const depositor = algosdk.mnemonicToSecretKey(depositorMnemonic);
  const beneficiary = algosdk.mnemonicToSecretKey(beneficiaryMnemonic);

  console.log(`👤 Depositor: ${depositor.addr}`);
  console.log(`👤 Beneficiary: ${beneficiary.addr}\n`);

  // ============================================================================
  // 3. Check FLUX Tier (for fee discounts)
  // ============================================================================

  console.log('🔍 Checking FLUX tier...');
  const userTier = await client.getUserFluxTier(depositor.addr);
  console.log(`✅ FLUX Tier: ${userTier}`);

  const nominatedAssetId = await client.getNominatedAssetId();
  console.log(`✅ Nominated Asset: ${nominatedAssetId}\n`);

  // ============================================================================
  // 4. Create a Linear Streaming Route
  // ============================================================================

  console.log('📝 Creating linear streaming route...\n');

  const tokenId = 10458941n; // Example: USDC on Algorand testnet
  const depositAmount = 1_200_000000n; // 1,200 USDC (6 decimals)
  const payoutPerMonth = 100_000000n; // 100 USDC per month

  // Calculate fee
  const isNominated = tokenId === nominatedAssetId;
  const fee = client.calculatePlatformFee(depositAmount, userTier, isNominated);
  console.log(`💵 Platform Fee: ${fee} tokens (${userTier === 0 ? '0.5%' : 'discounted'})`);
  console.log(`💰 Net Amount: ${depositAmount - fee} tokens\n`);

  try {
    const result = await client.createLinearRoute({
      sender: depositor.addr,
      beneficiary: beneficiary.addr,
      tokenId,
      depositAmount,
      payoutAmount: payoutPerMonth,
      startTimestamp: BigInt(Math.floor(Date.now() / 1000)), // Start now
      periodSeconds: 2_592_000n, // 30 days
      maxPeriods: 12n, // 12 months
      signer: algosdk.makeBasicAccountTransactionSigner(depositor),
      userTier, // Optional: will be fetched if not provided
      nominatedAssetId, // Optional: will be fetched if not provided
    });

    console.log('✅ Linear route created successfully!');
    console.log(`📍 Route App ID: ${result.routeAppId}`);
    console.log(`📍 Route Address: ${result.routeAppAddress}`);
    console.log(`📤 Transaction IDs: ${result.txIds.join(', ')}\n`);

    // Store route app ID for later use
    const routeAppId = result.routeAppId;

    // ============================================================================
    // 5. Query Route Details
    // ============================================================================

    console.log('🔍 Fetching route details...');
    const details = await client.getRouteDetails(routeAppId);

    if (details) {
      console.log('📊 Route Details:');
      console.log(`  Depositor: ${details.depositor}`);
      console.log(`  Beneficiary: ${details.beneficiary}`);
      console.log(`  Token ID: ${details.tokenId}`);
      console.log(`  Deposit Amount: ${details.depositAmount}`);
      console.log(`  Payout Per Period: ${details.payoutAmount}`);
      console.log(`  Period: ${details.periodSeconds} seconds (${Number(details.periodSeconds) / 86400} days)`);
      console.log(`  Max Periods: ${details.maxPeriods}`);
      console.log(`  Claimed: ${details.claimedAmount}\n`);
    }

    // ============================================================================
    // 6. Calculate Claimable Amount
    // ============================================================================

    console.log('💰 Calculating claimable amount...');
    const claimable = await client.calculateClaimableAmount(routeAppId);
    console.log(`✅ Currently claimable: ${claimable} tokens\n`);

    // ============================================================================
    // 7. Claim from Route (as beneficiary)
    // ============================================================================

    if (claimable > 0n) {
      console.log('💸 Claiming vested tokens...');

      const claimResult = await client.claimFromRoute({
        routeAppId,
        beneficiary: beneficiary.addr,
        signer: algosdk.makeBasicAccountTransactionSigner(beneficiary),
      });

      console.log('✅ Claim successful!');
      console.log(`📤 Transaction ID: ${claimResult.txId}`);
      console.log(`💰 Claimed Amount: ${claimResult.claimedAmount}`);
      console.log(`💰 Total Claimed: ${claimResult.totalClaimed}\n`);
    } else {
      console.log('⏳ No tokens claimable yet (route just started)\n');
    }

    // ============================================================================
    // 8. List All Routes (from registry)
    // ============================================================================

    console.log('📋 Listing all routes from registry...');
    const allRoutes = await client.listAllRoutes();
    console.log(`✅ Found ${allRoutes.length} total routes in registry\n`);

    // ============================================================================
    // 9. Get Registry Statistics
    // ============================================================================

    console.log('📊 Fetching registry statistics...');
    const stats = await client.getRegistryStats();

    if (stats) {
      console.log('Registry Stats:');
      console.log(`  Total Routes: ${stats.numRoutes}`);
      console.log(`  Total Value Routed: ${stats.totalRouted}`);
      console.log(`  Current Active Total (TVL): ${stats.currentActiveTotal}`);
      console.log(`  Fee (bps): ${stats.feeBps}`);
      console.log(`  Treasury: ${stats.treasury}\n`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }

  console.log('🎉 Example complete!');
}

// Run the example
main().catch(console.error);

