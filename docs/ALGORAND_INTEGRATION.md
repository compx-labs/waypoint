# Algorand Integration Guide

## Overview

Waypoint now supports both Aptos and Algorand blockchains with a unified wallet connection experience. Users can select their preferred network and connect their wallet through a single, intuitive modal interface.

## Supported Tokens

Waypoint on Algorand currently supports:

- **USDC** - USD Coin (Circle's regulated stablecoin)
- **xUSD** - CompX over-collateralized stablecoin

Both tokens are available for creating routes and streaming payments on the Algorand blockchain.

## Architecture

### Context Providers

The integration uses a layered architecture with the following providers:

1. **NetworkProvider** - Manages network selection (Aptos/Algorand)
2. **AlgorandProvider** - Initializes Algorand WalletManager and provides blockchain interaction methods
3. **AptosProvider** - Handles Aptos client initialization and blockchain interactions
4. **UnifiedWalletProvider** - Provides a consistent API across both networks
5. **WalletProvider** (Algorand) - Wraps children with `@txnlab/use-wallet-react` provider

### Component Structure

```
NetworkProvider
├── AlgorandProvider
│   └── WalletProvider (@txnlab/use-wallet-react)
│       └── AlgorandContext
└── AptosProvider
    └── AptosWalletAdapterProvider
        └── UnifiedWalletProvider
            └── Your App
```

## Wallet Connection Flow

### 1. User Clicks "Connect" Button

Located in `AppNavigation.tsx`, the connect button opens the `NetworkWalletModal`.

### 2. Network Selection

The modal first displays two options:
- **Aptos** - Connect to Aptos blockchain
- **Algorand** - Connect to Algorand blockchain

### 3. Wallet Selection

After selecting a network:

**For Aptos:**
- Shows the built-in Aptos Wallet Selector from `@aptos-labs/wallet-adapter-ant-design`
- Supports all Aptos-compatible wallets (Petra, Martian, Pontem, etc.)

**For Algorand:**
- Shows the Algorand wallet UI from `@txnlab/use-wallet-ui-react`
- Supports:
  - Defly Wallet
  - Pera Wallet
  - Lute Wallet

### 4. Connected State

Once connected, the navigation bar shows:
- Network logo (Aptos or Algorand)
- Shortened wallet address
- Clicking opens the modal again to view details or disconnect

## Key Components

### NetworkWalletModal.tsx

The main UI component that handles:
- Network selection
- Wallet connection for both networks
- Display of connected state
- Disconnect functionality

**Features:**
- Responsive design matching Waypoint's theme
- Back button to return to network selection
- Loading states for wallet UI components
- Clean, modern interface with gradient backgrounds

### AppNavigation.tsx

Updated to include:
- Unified wallet connection button
- Display of connected state with network logo
- Integration with the NetworkWalletModal
- Responsive design (mobile + desktop)

## Supported Wallets

### Aptos Wallets
- Petra Wallet
- Martian Wallet
- Pontem Wallet
- Nightly Wallet
- Rise Wallet
- And all Aptos-compatible wallets

### Algorand Wallets
- [Defly Wallet](https://defly.app/)
- [Pera Wallet](https://perawallet.app/)
- [Lute Wallet](https://lute.app/)

## Configuration

### Algorand Network

The Algorand provider is configured in `AlgorandContext.tsx`:

```typescript
const walletManager = new WalletManager({
  wallets: [
    WalletId.DEFLY,
    WalletId.PERA,
    {
      id: WalletId.LUTE,
      options: { siteName: 'Waypoint' },
    },
  ],
  network: NetworkId.MAINNET, // or NetworkId.TESTNET
});
```

### Aptos Network

The Aptos provider is configured in `root.tsx`:

```typescript
<AptosProvider initialNetwork={Network.MAINNET}>
  <WalletProvider
    autoConnect={true}
    dappConfig={{ network: Network.MAINNET }}
  >
    {/* App content */}
  </WalletProvider>
</AptosProvider>
```

## Usage in Components

### Basic Wallet Connection

```typescript
import { useWallet } from './hooks/useWallet';

function MyComponent() {
  const { connected, account, selectedNetwork } = useWallet();
  
  return (
    <div>
      {connected ? (
        <p>Connected on {selectedNetwork}: {account}</p>
      ) : (
        <p>Not connected</p>
      )}
    </div>
  );
}
```

### Network-Specific Logic

```typescript
import { useWallet } from './hooks/useWallet';
import { BlockchainNetwork } from './contexts/NetworkContext';

function RouteCreator() {
  const { selectedNetwork, isAptos, isAlgorand } = useWallet();
  
  const createRoute = async () => {
    if (isAptos) {
      // Use Aptos-specific logic
    } else if (isAlgorand) {
      // Use Algorand-specific logic
    }
  };
  
  return <button onClick={createRoute}>Create Route</button>;
}
```

### Using the Unified Wallet API

```typescript
import { useUnifiedWallet } from './contexts/UnifiedWalletContext';

function TransactionButton() {
  const { signAndSubmitTransaction, connected } = useUnifiedWallet();
  
  const handleTransaction = async () => {
    if (!connected) return;
    
    const transaction = {
      data: {
        function: "0x123::module::function",
        functionArguments: [/* args */],
      }
    };
    
    const result = await signAndSubmitTransaction(transaction);
    console.log('Transaction hash:', result.hash);
  };
  
  return <button onClick={handleTransaction}>Submit</button>;
}
```

## Styling

The integration uses Tailwind CSS with Waypoint's custom theme:

**Color Scheme:**
- `forest-*` - Dark green backgrounds (700, 800, 900)
- `primary-*` - Text colors (100, 200, 300)
- `sunset-*` - Accent colors for buttons and highlights (400, 500, 600, 700)

**Fonts:**
- `font-display` - Headings and important text
- `font-mono` - Wallet addresses and technical data

## Testing

To test the integration:

1. **Start the development server:**
   ```bash
   cd frontend/waypoint
   npm run dev
   ```

2. **Navigate to the app:**
   - Go to `/app` route
   - You should see the "Connect" button in the navigation

3. **Test Aptos Connection:**
   - Click "Connect"
   - Select "Aptos"
   - Choose a wallet (e.g., Petra)
   - Approve the connection

4. **Test Algorand Connection:**
   - Disconnect if already connected
   - Click "Connect"
   - Select "Algorand"
   - Choose a wallet (e.g., Pera)
   - Approve the connection

5. **Test Network Switching:**
   - While connected, disconnect
   - Select the other network
   - Connect a wallet for that network

## Troubleshooting

### Wallet UI Not Loading

If wallet options don't appear:
- Check browser console for errors
- Ensure wallet browser extensions are installed
- Try refreshing the page

### Connection Fails

If connection attempts fail:
- Check wallet extension is unlocked
- Verify you're on the correct network (mainnet/testnet)
- Check browser console for specific error messages

### Modal Not Appearing

If the modal doesn't show:
- Check that `NetworkWalletModal` is imported in `AppNavigation`
- Verify the modal's `isOpen` prop is being set correctly
- Check for CSS conflicts (z-index issues)

## Next Steps

### For Complete Algorand Integration:

1. **Implement Smart Contract Interactions**
   - Update `getRouteCore` in `AlgorandContext.tsx`
   - Update `listAllRoutes` in `AlgorandContext.tsx`
   - Add Algorand SDK for contract calls

2. **Transaction Building**
   - Implement Algorand transaction format in `UnifiedWalletContext.tsx`
   - Add transaction signing logic
   - Handle transaction confirmation

3. **Contract Deployment**
   - Deploy Waypoint Algorand contracts
   - Update `MODULE_APP_ID` in `AlgorandContext.tsx`

4. **UI Updates**
   - Add network switcher in settings
   - Update route creation wizard for Algorand
   - Add Algorand-specific transaction history

## Resources

- [Algorand Use Wallet Documentation](https://github.com/TxnLab/use-wallet)
- [Algorand Use Wallet UI](https://github.com/Algorand-Developer-Retreat/use-wallet-ui)
- [Aptos Wallet Adapter](https://github.com/aptos-labs/aptos-wallet-adapter)
- [Waypoint Documentation](./WAYPOINT_OVERVIEW.md)

## Credits

- Algorand wallet integration powered by [@txnlab/use-wallet-react](https://github.com/TxnLab/use-wallet)
- Algorand wallet UI by [@txnlab/use-wallet-ui-react](https://github.com/Algorand-Developer-Retreat/use-wallet-ui)
- Aptos wallet adapter by [@aptos-labs/wallet-adapter-react](https://github.com/aptos-labs/aptos-wallet-adapter)

