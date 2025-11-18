# Waypoint SDK Examples

This directory contains examples demonstrating how to use the Waypoint SDK with both Aptos and Algorand blockchains.

## 📁 Examples

### Aptos Examples
- **`aptos-node.ts`** - Node.js example for Aptos linear routes
- **`aptos-react.tsx`** - React example for Aptos integration with wallet adapters

### Algorand Examples
- **`algorand-linear-node.ts`** - Node.js example for Algorand linear streaming routes
- **`algorand-invoice-node.ts`** - Node.js example for Algorand invoice/payment request routes
- **`algorand-react.tsx`** - React example for Algorand integration with wallet adapters

## 🚀 Running the Examples

### Prerequisites

```bash
# Install dependencies
npm install

# Build the SDK
npm run build
```

### Node.js Examples

#### Aptos Linear Route
```bash
# Set your private key
export PRIVATE_KEY="0x..."

# Run the example
npx tsx examples/aptos-node.ts
```

#### Algorand Linear Route
```bash
# Set wallet mnemonics (test accounts only!)
export DEPOSITOR_MNEMONIC="word1 word2 ..."
export BENEFICIARY_MNEMONIC="word1 word2 ..."

# Run the example
npx tsx examples/algorand-linear-node.ts
```

#### Algorand Invoice Route
```bash
# Set wallet mnemonics (test accounts only!)
export REQUESTER_MNEMONIC="word1 word2 ..."
export PAYER_MNEMONIC="word1 word2 ..."

# Optional: Set payer decision
export PAYER_DECISION="accept"  # or "decline"

# Run the example
npx tsx examples/algorand-invoice-node.ts
```

### React Examples

The React examples (`aptos-react.tsx` and `algorand-react.tsx`) are meant to be integrated into your React application. Copy the code and adapt it to your project structure.

**Key Integration Steps:**

1. Install wallet adapters:
   ```bash
   # For Aptos
   npm install @aptos-labs/wallet-adapter-react

   # For Algorand
   npm install @perawallet/connect
   # or
   npm install @blockshake/defly-connect
   ```

2. Wrap your app with wallet provider:
   ```tsx
   // Aptos
   import { AptosWalletAdapterProvider } from '@aptos-labs/wallet-adapter-react';
   
   // Algorand - use your wallet's provider
   ```

3. Copy and customize the example component

4. Implement wallet signing functions based on your wallet adapter

## 📚 Example Descriptions

### Linear Routes (Single-Phase)

Linear routes are for direct streaming payments where the depositor creates and funds the route immediately.

**Use Cases:**
- Payroll (company → employee)
- Subscriptions (customer → service provider)
- Token vesting schedules

**Flow:**
1. Depositor creates route with tokens
2. Route is immediately active
3. Beneficiary claims vested tokens over time

### Invoice Routes (Two-Phase) - Algorand Only

Invoice routes are for payment requests where the beneficiary creates a request that the payer must approve.

**Use Cases:**
- B2B invoicing (contractor → client)
- Freelance payments (freelancer → client)
- Payment requests

**Flow:**
1. Requester creates invoice/payment request
2. Payer reviews request
3. Payer accepts (funds) or declines
4. If accepted, beneficiary claims payment

## 🔑 Environment Variables

### Aptos Examples
- `PRIVATE_KEY` - Private key for your Aptos account (hex format)

### Algorand Examples
- `DEPOSITOR_MNEMONIC` - 25-word mnemonic for depositor/sender account
- `BENEFICIARY_MNEMONIC` - 25-word mnemonic for beneficiary/recipient account
- `REQUESTER_MNEMONIC` - 25-word mnemonic for invoice requester account
- `PAYER_MNEMONIC` - 25-word mnemonic for invoice payer account
- `PAYER_DECISION` - Optional: "accept" or "decline" for invoice example

⚠️ **WARNING:** Never commit private keys or mnemonics to version control! Use environment variables or secure key management systems.

## 🧪 Testing on Testnet

All examples are configured to use testnets by default:

- **Aptos:** Network.TESTNET
- **Algorand:** testnet

You can get test tokens from:
- Aptos Testnet Faucet: https://aptoslabs.com/testnet-faucet
- Algorand Testnet Faucet: https://bank.testnet.algorand.network/

## 📖 Key Concepts

### Fee Calculation
Both networks charge platform fees based on FLUX tier:
- Tier 0 (no FLUX): Standard fees
- Tier 1-4: Increasing discounts
- Nominated assets get better fee rates

### Token Amounts
Token amounts are in base units (considering decimals):
- USDC (6 decimals): `1_000000` = 1 USDC
- APT (8 decimals): `100_000000` = 1 APT

### Time Units
- **Aptos:** Uses seconds for periods
- **Algorand:** Uses seconds for periods and Unix timestamps

### Vesting Calculation
Tokens vest linearly over time:
```
vested = (payoutAmount × periodsElapsed)
claimable = vested - alreadyClaimed
```

## 🛠️ Troubleshooting

### "Insufficient funds" error
Make sure your account has enough tokens plus fees (0.5% default).

### "Transaction failed" error
- Check that you've approved the token transfer
- Verify token asset IDs are correct for your network
- Ensure accounts are opted into the tokens (Algorand)

### "Route not found" error
- Verify the route/invoice app ID is correct
- Make sure the transaction was confirmed

## 📝 Additional Resources

- [SDK Documentation](../README.md)
- [Aptos Documentation](https://aptos.dev)
- [Algorand Documentation](https://developer.algorand.org)
- [Waypoint Overview](../../docs/WAYPOINT_OVERVIEW.md)

## 💡 Next Steps

After running these examples:

1. **Integrate with your app** - Adapt the React examples to your UI
2. **Add error handling** - Implement proper error handling and user feedback
3. **Test thoroughly** - Test all flows on testnet before mainnet
4. **Monitor transactions** - Track route creation and claims in your backend
5. **Optimize UX** - Add loading states, transaction confirmations, and notifications

Happy building! 🚀

