# Waypoint SDK Quick Start Guide

This guide will help you get started with the Waypoint SDK in just a few minutes.

## Installation

```bash
npm install @waypoint/sdk @aptos-labs/ts-sdk
```

## Basic Setup

### 1. Import the SDK

```typescript
import { AptosWaypointClient } from '@waypoint/sdk';
import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';
```

### 2. Initialize

```typescript
// Initialize Aptos SDK
const aptos = new Aptos(new AptosConfig({ 
  network: Network.MAINNET 
}));

// Initialize Waypoint SDK
const waypoint = new AptosWaypointClient({
  network: 'mainnet', // or 'testnet'
});
```

## Common Tasks

### Create a Linear Streaming Route

```typescript
// Build the transaction
const transaction = await waypoint.buildCreateLinearRouteTransaction({
  sender: yourAddress,
  beneficiary: recipientAddress,
  tokenMetadata: tokenMetadataAddress,
  amount: 1000_000000n, // Amount in smallest units
  startTimestamp: Math.floor(Date.now() / 1000),
  periodSeconds: 2592000, // 30 days
  payoutAmount: 100_000000n,
  maxPeriods: 10,
});

// Sign and submit (using your wallet)
const result = await aptos.signAndSubmitTransaction({
  signer: account,
  transaction,
});

// Wait for confirmation
await aptos.waitForTransaction({ 
  transactionHash: result.hash 
});
```

### Query Routes

```typescript
// List all routes
const routes = await waypoint.listLinearRoutes();

// Get details for a specific route
const details = await waypoint.getLinearRouteDetails(routeAddress);

// Calculate claimable amount
const claimable = await waypoint.getLinearClaimableAmount(routeAddress);
```

### Claim Tokens

```typescript
// Check if there's anything to claim
const claimable = await waypoint.getLinearClaimableAmount(routeAddress);

if (claimable > 0n) {
  // Build claim transaction
  const transaction = await waypoint.buildClaimLinearTransaction({
    caller: yourAddress,
    routeAddress,
  });

  // Sign and submit
  const result = await aptos.signAndSubmitTransaction({
    signer: account,
    transaction,
  });

  await aptos.waitForTransaction({ 
    transactionHash: result.hash 
  });
}
```

### Register with Backend (Optional)

```typescript
// After creating a route, register it with Waypoint backend
await waypoint.registerRouteWithBackend({
  sender: yourAddress,
  recipient: recipientAddress,
  tokenId: 1, // Your backend token ID
  amountTokenUnits: amount.toString(),
  amountPerPeriodTokenUnits: payoutAmount.toString(),
  startDate: new Date(),
  paymentFrequencyUnit: 'months',
  paymentFrequencyNumber: 1,
  blockchainTxHash: result.hash,
  routeObjAddress: routeAddress,
  routeType: 'simple',
});
```

## With React and Wallet Adapter

```typescript
import { useWallet } from '@aptos-labs/wallet-adapter-react';

function MyComponent() {
  const { account, signAndSubmitTransaction } = useWallet();
  const waypoint = new AptosWaypointClient({ network: 'mainnet' });

  const createRoute = async () => {
    const tx = await waypoint.buildCreateLinearRouteTransaction({
      sender: account.address,
      // ... other params
    });

    const result = await signAndSubmitTransaction({
      sender: account.address,
      data: tx,
    });

    return result;
  };
}
```

## Important Notes

- **Fee**: A 0.5% protocol fee is automatically calculated
- **Validation**: The SDK validates all inputs before building transactions
- **Timestamps**: Use Unix timestamps in seconds
- **Amounts**: Use bigint for token amounts (smallest units)
- **Addresses**: All addresses must be valid Aptos addresses with 0x prefix

## Next Steps

- Read the full [README.md](README.md) for detailed API documentation
- Check out [examples/](examples/) for complete working examples
- Visit [docs.waypoint.com](https://docs.waypoint.com) for more information

## Support

- Discord: [https://discord.gg/waypoint](https://discord.gg/waypoint)
- GitHub Issues: [https://github.com/waypoint/sdk/issues](https://github.com/waypoint/sdk/issues)

