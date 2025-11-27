# Waypoint SDK

> TypeScript SDK for interacting with Waypoint's token routing contracts on Aptos and Algorand

The Waypoint SDK is a lightweight TypeScript library that makes it easy to interact with Waypoint's smart contracts on Aptos and Algorand blockchains. It generates unsigned transactions and reads on-chain state - you handle wallet connections and transaction signing in your own application.

## Features

- ✅ **Multi-Chain**: Support for both Aptos and Algorand blockchains
- ✅ **Transaction Building**: Generate unsigned transactions for creating routes, claiming tokens, and more
- ✅ **State Reading**: Query routes, calculate claimable amounts, and read contract configuration
- ✅ **Invoice Support**: Two-phase payment requests on Algorand (create request → payer accepts/declines)
- ✅ **Network Support**: Works on both mainnet and testnet
- ✅ **Type-Safe**: Full TypeScript support with comprehensive type definitions
- ✅ **Universal**: Compatible with Node.js and browser environments
- ✅ **Backend Integration**: Optional API client for registering routes with Waypoint's backend
- ✅ **No Wallet Management**: You control wallet connections and signing

## Installation

### For Aptos
```bash
npm install @compx/waypoint-sdk @aptos-labs/ts-sdk
```

### For Algorand
```bash
npm install @compx/waypoint-sdk algosdk @algorandfoundation/algokit-utils
```

## Requirements

- Node.js >= 22.0.0
- TypeScript >= 5.x (if using TypeScript)

## Quick Start

### Aptos
```typescript
import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';
import { AptosWaypointClient } from '@compx/waypoint-sdk';

// Initialize Waypoint SDK
const waypoint = new AptosWaypointClient({
  network: 'mainnet', // or 'testnet'
});

// Build a transaction to create a route
const transaction = await waypoint.buildCreateLinearRouteTransaction({
  sender: '0x123...',
  beneficiary: '0x456...',
  tokenMetadata: '0xabc...',
  amount: 1000_000000n,
  startTimestamp: Math.floor(Date.now() / 1000),
  periodSeconds: 2592000, // 30 days
  payoutAmount: 100_000000n,
  maxPeriods: 10,
});

// Sign and submit using your wallet
const aptos = new Aptos(new AptosConfig({ network: Network.MAINNET }));
await aptos.signAndSubmitTransaction({ signer: account, transaction });
```

### Algorand
```typescript
import algosdk from 'algosdk';
import { AlgorandWaypointClient } from '@compx/waypoint-sdk';

// Initialize Waypoint SDK
const client = new AlgorandWaypointClient({
  network: 'mainnet', // or 'testnet'
});

// Create a linear streaming route
const result = await client.createLinearRoute({
  sender: depositor.addr,
  beneficiary: beneficiary.addr,
  tokenId: 31566704n, // USDC on Algorand
  depositAmount: 1000_000000n,
  payoutAmount: 100_000000n,
  startTimestamp: BigInt(Math.floor(Date.now() / 1000)),
  periodSeconds: 2_592_000n, // 30 days
  maxPeriods: 10n,
  signer: algosdk.makeBasicAccountTransactionSigner(depositor),
});

console.log('Route created:', result.routeAppId);
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

See the [examples](./examples) directory for complete, runnable examples:

### Aptos Examples
- **[aptos-node.ts](examples/aptos-node.ts)** - Complete Node.js example for linear routes
- **[aptos-react.tsx](examples/aptos-react.tsx)** - React + wallet adapter integration

### Algorand Examples
- **[algorand-linear-node.ts](examples/algorand-linear-node.ts)** - Linear streaming routes (Node.js)
- **[algorand-invoice-node.ts](examples/algorand-invoice-node.ts)** - Invoice/payment request routes (Node.js)
- **[algorand-react.tsx](examples/algorand-react.tsx)** - React + wallet adapter integration

### Running Examples
```bash
# Build the SDK first
npm run build

# Run examples
npm run example:aptos
npm run example:algo-linear
npm run example:algo-invoice
```

See [examples/README.md](examples/README.md) for detailed instructions and environment variables.

### Quick Node.js Example (Aptos)

```typescript
import { Account, Ed25519PrivateKey } from '@aptos-labs/ts-sdk';
import { AptosWaypointClient } from '@compx/waypoint-sdk';

const waypoint = new AptosWaypointClient({ network: 'mainnet' });
const account = Account.fromPrivateKey({ privateKey: new Ed25519PrivateKey('0x...') });

const tx = await waypoint.buildCreateLinearRouteTransaction({...});
const result = await aptos.signAndSubmitTransaction({ signer: account, transaction: tx });
```

### Quick Node.js Example (Algorand)

```typescript
import algosdk from 'algosdk';
import { AlgorandWaypointClient } from '@compx/waypoint-sdk';

const client = new AlgorandWaypointClient({ network: 'testnet' });
const account = algosdk.mnemonicToSecretKey('your mnemonic...');

const result = await client.createLinearRoute({
  sender: account.addr,
  beneficiary: 'BENEFICIARY_ADDRESS',
  tokenId: 10458941n,
  depositAmount: 1000_000000n,
  payoutAmount: 100_000000n,
  startTimestamp: BigInt(Math.floor(Date.now() / 1000)),
  periodSeconds: 2_592_000n,
  maxPeriods: 10n,
  signer: algosdk.makeBasicAccountTransactionSigner(account),
});
```

### React Example (Aptos)

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
    await signAndSubmitTransaction({ sender: account.address, data: tx });
  };
}
```

### React Example (Algorand)

```typescript
import { AlgorandWaypointClient, InvoiceRouteStatus } from '@compx/waypoint-sdk';

function MyComponent() {
  const [client] = useState(() => new AlgorandWaypointClient({ network: 'mainnet' }));
  
  // Create invoice request
  const createInvoice = async (walletSigner) => {
    const result = await client.createInvoiceRequest({
      requester: walletAddress,
      beneficiary: walletAddress,
      payer: payerAddress,
      tokenId: 31566704n,
      grossInvoiceAmount: 5000_000000n,
      payoutAmount: 5000_000000n,
      startTimestamp: 0n,
      periodSeconds: 1n,
      maxPeriods: 1n,
      signer: walletSigner,
    });
  };

  // Payer accepts invoice
  const acceptInvoice = async (invoiceAppId, walletSigner) => {
    await client.acceptInvoiceRoute({
      routeAppId: BigInt(invoiceAppId),
      payer: walletAddress,
      signer: walletSigner,
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

