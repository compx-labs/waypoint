# Waypoint SDK

> TypeScript SDK for interacting with Waypoint's token routing contracts on Aptos

The Waypoint SDK is a lightweight TypeScript library that makes it easy to interact with Waypoint's smart contracts on the Aptos blockchain. It generates unsigned transactions and reads on-chain state - you handle wallet connections and transaction signing in your own application.

## Features

- ✅ **Transaction Building**: Generate unsigned transactions for creating routes, claiming tokens, and approving milestones
- ✅ **State Reading**: Query routes, calculate claimable amounts, and read contract configuration
- ✅ **Network Support**: Works on both mainnet and testnet
- ✅ **Type-Safe**: Full TypeScript support with comprehensive type definitions
- ✅ **Universal**: Compatible with Node.js and browser environments
- ✅ **Backend Integration**: Optional API client for registering routes with Waypoint's backend
- ✅ **No Wallet Management**: You control wallet connections and signing

## Installation

```bash
npm install @compx/waypoint-sdk @aptos-labs/ts-sdk
```

## Requirements

- Node.js >= 22.0.0
- TypeScript >= 5.x (if using TypeScript)

## Quick Start

```typescript
import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';
import { AptosWaypointClient } from '@compx/waypoint-sdk';

// Initialize Aptos SDK
const aptos = new Aptos(new AptosConfig({ network: Network.MAINNET }));

// Initialize Waypoint SDK
const waypoint = new AptosWaypointClient({
  network: 'mainnet', // or 'testnet'
});

// Build a transaction to create a route
const transaction = await waypoint.buildCreateLinearRouteTransaction({
  sender: '0x123...',
  beneficiary: '0x456...',
  tokenMetadata: '0xabc...',
  amount: 1000_000000n, // 1000 tokens (6 decimals)
  startTimestamp: Math.floor(Date.now() / 1000),
  periodSeconds: 2592000, // 30 days
  payoutAmount: 100_000000n, // 100 tokens per period
  maxPeriods: 10,
});

// Sign and submit (using your wallet)
const result = await aptos.signAndSubmitTransaction({
  signer: account,
  transaction,
});
```

## Network Configuration

### Mainnet

```typescript
const waypoint = new AptosWaypointClient({
  network: 'mainnet',
  // Optional: custom backend URL
  backendUrl: 'https://your-backend.com',
});
```

- Module Address: `0x12dd47c0156dc2237a6e814b227bb664f54e85332ff636a64bc9dd1ce7d1bdb0`
- Linear Module: `0x12dd47c0156dc2237a6e814b227bb664f54e85332ff636a64bc9dd1ce7d1bdb0::linear_stream_fa`
- Milestone Module: `0x12dd47c0156dc2237a6e814b227bb664f54e85332ff636a64bc9dd1ce7d1bdb0::milestone_stream_fa`

### Testnet

```typescript
const waypoint = new AptosWaypointClient({
  network: 'testnet',
});
```

## API Reference

### Creating Routes

#### Linear Streaming Route

Linear routes release tokens gradually over time based on a fixed schedule.

```typescript
const transaction = await waypoint.buildCreateLinearRouteTransaction({
  sender: '0x...', // Your wallet address
  beneficiary: '0x...', // Recipient address
  tokenMetadata: '0x...', // Token metadata object address
  amount: 1000_000000n, // Total amount to stream
  startTimestamp: Math.floor(Date.now() / 1000), // When vesting starts
  periodSeconds: 2592000, // Duration of each period (30 days)
  payoutAmount: 100_000000n, // Amount released per period
  maxPeriods: 10, // Total number of periods
});

// Sign and submit with your wallet
const result = await signAndSubmitTransaction({ transaction });
```

**Note**: A 0.5% protocol fee is automatically calculated and included.

#### Milestone-Based Route

Milestone routes require depositor approval before tokens can be claimed.

```typescript
const transaction = await waypoint.buildCreateMilestoneRouteTransaction({
  sender: '0x...',
  beneficiary: '0x...',
  tokenMetadata: '0x...',
  amount: 1000_000000n,
  startTimestamp: Math.floor(Date.now() / 1000),
  periodSeconds: 2592000,
  payoutAmount: 100_000000n,
  maxPeriods: 10,
});
```

### Claiming Tokens

#### Claim from Linear Route

```typescript
const transaction = await waypoint.buildClaimLinearTransaction({
  caller: '0x...', // Must be the beneficiary
  routeAddress: '0x...', // Route object address
});

await signAndSubmitTransaction({ transaction });
```

#### Claim from Milestone Route

```typescript
const transaction = await waypoint.buildClaimMilestoneTransaction({
  caller: '0x...', // Must be the beneficiary
  routeAddress: '0x...',
});

await signAndSubmitTransaction({ transaction });
```

### Approving Milestones

Only for milestone routes - depositor approves amount for release:

```typescript
const transaction = await waypoint.buildApproveMilestoneTransaction({
  caller: '0x...', // Must be the depositor
  routeAddress: '0x...',
  unlockAmount: 100_000000n, // Amount to unlock
});

await signAndSubmitTransaction({ transaction });
```

### Querying State

#### List All Routes

```typescript
// Get all linear routes
const linearRoutes = await waypoint.listLinearRoutes();
console.log(linearRoutes); // ['0xroute1...', '0xroute2...']

// Get all milestone routes
const milestoneRoutes = await waypoint.listMilestoneRoutes();
```

#### Get Route Details

```typescript
const details = await waypoint.getLinearRouteDetails('0xroute...');
console.log({
  depositor: details.depositor,
  beneficiary: details.beneficiary,
  depositAmount: details.depositAmount,
  claimedAmount: details.claimedAmount,
  startTimestamp: details.startTimestamp,
  periodSeconds: details.periodSeconds,
  payoutAmount: details.payoutAmount,
  maxPeriods: details.maxPeriods,
});
```

#### Calculate Claimable Amount

```typescript
// Linear route
const claimable = await waypoint.getLinearClaimableAmount('0xroute...');
console.log(`Claimable: ${claimable} tokens`);

// Milestone route
const claimable = await waypoint.getMilestoneClaimableAmount('0xroute...');

// Calculate at a specific timestamp
const claimableAt = await waypoint.getLinearClaimableAmount(
  '0xroute...',
  1234567890 // Unix timestamp
);
```

### Backend Integration (Optional)

Register routes with Waypoint's backend to make them visible in the web app:

```typescript
// After creating a route on-chain
await waypoint.registerRouteWithBackend({
  sender: '0x...',
  recipient: '0x...',
  tokenId: 1, // Your backend token ID
  amountTokenUnits: '1000000000',
  amountPerPeriodTokenUnits: '100000000',
  startDate: new Date(),
  paymentFrequencyUnit: 'months',
  paymentFrequencyNumber: 1,
  blockchainTxHash: txHash,
  routeObjAddress: routeAddress,
  routeType: 'simple', // or 'milestone'
});

// Query routes from backend
const backendRoutes = await waypoint.getBackendRoutes('0xaddress...');

// Update route status
await waypoint.updateBackendRouteStatus(routeId, 'completed');
```

### Utility Functions

```typescript
// Calculate protocol fee (0.5%)
const fee = waypoint.calculateFee(1000_000000n);
console.log(`Fee: ${fee}`); // 5000000 (0.5% of 1000)

// Validate address
import { isValidAptosAddress } from '@compx/waypoint-sdk';
const valid = isValidAptosAddress('0x123...');
```

## Usage Examples

### Node.js Example

See [examples/aptos-node.ts](examples/aptos-node.ts) for a complete Node.js example.

```typescript
import { Account, Ed25519PrivateKey } from '@aptos-labs/ts-sdk';
import { AptosWaypointClient } from '@compx/waypoint-sdk';

// Initialize SDK
const waypoint = new AptosWaypointClient({ network: 'mainnet' });

// Create account (use your own private key management)
const privateKey = new Ed25519PrivateKey('0x...');
const account = Account.fromPrivateKey({ privateKey });

// Create route
const tx = await waypoint.buildCreateLinearRouteTransaction({...});
const result = await aptos.signAndSubmitTransaction({
  signer: account,
  transaction: tx,
});
```

### React Example

See [examples/aptos-react.tsx](examples/aptos-react.tsx) for a complete React + Petra wallet example.

```typescript
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { AptosWaypointClient } from '@compx/waypoint-sdk';

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
  };
}
```

## TypeScript Support

Full TypeScript support with comprehensive type definitions:

```typescript
import type {
  RouteDetails,
  CreateLinearRouteParams,
  ClaimParams,
  Network,
} from '@compx/waypoint-sdk';
```

## Error Handling

```typescript
try {
  const tx = await waypoint.buildCreateLinearRouteTransaction(params);
  await signAndSubmitTransaction({ transaction: tx });
} catch (error) {
  if (error.message.includes('Invalid address')) {
    console.error('Invalid address provided');
  } else if (error.message.includes('Amount must be greater')) {
    console.error('Invalid amount');
  } else {
    console.error('Transaction failed:', error);
  }
}
```

## Best Practices

1. **Always validate inputs** - The SDK includes built-in validation
2. **Check claimable amounts** before claiming to avoid failed transactions
3. **Wait for transaction confirmation** before updating UI
4. **Register routes with backend** (optional) for better UX in Waypoint app
5. **Handle errors gracefully** - Network issues can occur
6. **Use environment variables** for private keys and API URLs

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Type check
npm run typecheck

# Watch mode
npm run dev
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Support

- Documentation: [https://docs.waypoint.com](https://docs.waypoint.com)
- Discord: [https://discord.gg/waypoint](https://discord.gg/waypoint)
- GitHub Issues: [https://github.com/waypoint/sdk/issues](https://github.com/waypoint/sdk/issues)

