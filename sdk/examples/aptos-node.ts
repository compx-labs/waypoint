/**
 * Waypoint SDK Node.js Example
 * 
 * This example demonstrates how to use the Waypoint SDK in a Node.js environment.
 * It shows how to create routes and claim tokens using the SDK.
 */

import { Aptos, AptosConfig, Network, Account, Ed25519PrivateKey } from '@aptos-labs/ts-sdk';
import { AptosWaypointClient } from '../src';

async function main() {
  console.log('🚀 Waypoint SDK Node.js Example\n');

  // ============================================================================
  // 1. Initialize Aptos SDK and Waypoint SDK
  // ============================================================================
  
  const network = Network.MAINNET; // or Network.TESTNET
  const aptosConfig = new AptosConfig({ network });
  const aptos = new Aptos(aptosConfig);

  const waypoint = new AptosWaypointClient({
    network: 'mainnet', // or 'testnet'
    // backendUrl: 'https://your-backend.com' // Optional
  });

  console.log(`✅ Connected to ${network}`);
  console.log(`✅ Waypoint SDK initialized\n`);

  // ============================================================================
  // 2. Create a test account (in production, use a real wallet)
  // ============================================================================
  
  // WARNING: Never hardcode private keys in production!
  // This is just for demonstration purposes
  const privateKeyHex = process.env.PRIVATE_KEY;
  if (!privateKeyHex) {
    console.error('❌ Please set PRIVATE_KEY environment variable');
    process.exit(1);
  }

  const privateKey = new Ed25519PrivateKey(privateKeyHex);
  const account = Account.fromPrivateKey({ privateKey });
  console.log(`👤 Account address: ${account.accountAddress.toString()}\n`);

  // ============================================================================
  // 3. Create a Linear Route
  // ============================================================================
  
  console.log('📝 Building create linear route transaction...');

  const createRouteTx = await waypoint.buildCreateLinearRouteTransaction({
    sender: account.accountAddress.toString(),
    beneficiary: '0x123...', // Recipient address
    tokenMetadata: '0xabc...', // Token metadata object address (e.g., USDC)
    amount: 1000_000000n, // 1000 tokens (assuming 6 decimals)
    startTimestamp: Math.floor(Date.now() / 1000), // Start now
    periodSeconds: 2592000, // 30 days
    payoutAmount: 100_000000n, // 100 tokens per period
    maxPeriods: 10, // 10 periods = 10 months
  });

  console.log('✅ Transaction built');

  // Sign and submit the transaction
  console.log('✍️  Signing transaction...');
  const committedTx = await aptos.signAndSubmitTransaction({
    signer: account,
    transaction: createRouteTx,
  });

  console.log(`📤 Transaction submitted: ${committedTx.hash}`);

  // Wait for transaction confirmation
  console.log('⏳ Waiting for confirmation...');
  const txResult = await aptos.waitForTransaction({
    transactionHash: committedTx.hash,
  });

  console.log('✅ Transaction confirmed!\n');

  // ============================================================================
  // 4. (Optional) Register Route with Backend
  // ============================================================================
  
  // Extract route address from events
  // Note: You need to parse the transaction events to get the route address
  console.log('📝 Registering route with backend...');
  
  try {
    await waypoint.registerRouteWithBackend({
      sender: account.accountAddress.toString(),
      recipient: '0x123...',
      tokenId: 1, // Your backend token ID
      amountTokenUnits: '1000000000',
      amountPerPeriodTokenUnits: '100000000',
      startDate: new Date(),
      paymentFrequencyUnit: 'months',
      paymentFrequencyNumber: 1,
      blockchainTxHash: committedTx.hash,
      routeObjAddress: '0xroute...', // Get from transaction events
      routeType: 'simple',
    });
    console.log('✅ Route registered with backend\n');
  } catch (error) {
    console.log('⚠️  Backend registration failed (optional):', error);
  }

  // ============================================================================
  // 5. Query Routes
  // ============================================================================
  
  console.log('🔍 Querying routes...');
  const routes = await waypoint.listLinearRoutes();
  console.log(`Found ${routes.length} linear routes`);

  if (routes.length > 0) {
    const firstRoute = routes[0];
    console.log(`\n📊 Route Details for ${firstRoute}:`);
    
    const details = await waypoint.getLinearRouteDetails(firstRoute);
    console.log(`  Depositor: ${details.depositor}`);
    console.log(`  Beneficiary: ${details.beneficiary}`);
    console.log(`  Deposit Amount: ${details.depositAmount}`);
    console.log(`  Claimed Amount: ${details.claimedAmount}`);
    
    const claimable = await waypoint.getLinearClaimableAmount(firstRoute);
    console.log(`  Claimable Now: ${claimable}\n`);
  }

  // ============================================================================
  // 6. Claim from a Route (as beneficiary)
  // ============================================================================
  
  if (routes.length > 0) {
    const routeAddress = routes[0];
    
    console.log('💰 Building claim transaction...');
    const claimTx = await waypoint.buildClaimLinearTransaction({
      caller: account.accountAddress.toString(),
      routeAddress,
    });

    console.log('✍️  Signing claim transaction...');
    const claimCommitted = await aptos.signAndSubmitTransaction({
      signer: account,
      transaction: claimTx,
    });

    console.log(`📤 Claim transaction submitted: ${claimCommitted.hash}`);
    
    await aptos.waitForTransaction({
      transactionHash: claimCommitted.hash,
    });

    console.log('✅ Claim successful!\n');
  }

  // ============================================================================
  // 7. Calculate Fee
  // ============================================================================
  
  const amount = 1000_000000n;
  const fee = waypoint.calculateFee(amount);
  console.log(`💵 Fee for ${amount} tokens: ${fee} (0.5%)\n`);

  console.log('🎉 Example complete!');
}

// Run the example
main().catch(console.error);

