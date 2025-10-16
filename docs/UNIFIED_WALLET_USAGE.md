# Unified Wallet System Usage Guide

## Overview

The Waypoint app now supports both Aptos and Algorand blockchains with a unified wallet abstraction layer. Users connect via a single modal interface that lets them select their network and wallet. This guide explains how to use the new wallet system.

## User Experience

When users click "Connect" in the navigation:
1. A modal appears showing network options (Aptos or Algorand)
2. After selecting a network, wallet options for that network are displayed
3. Users connect their preferred wallet
4. The navigation shows the connected state with network logo and address

See `ALGORAND_INTEGRATION.md` for details on the UI implementation.

## Architecture

The wallet system consists of several context providers:

1. **NetworkProvider** - Manages which blockchain network is selected (Aptos or Algorand)
2. **AptosProvider** - Handles Aptos-specific blockchain interactions
3. **AlgorandProvider** - Handles Algorand-specific blockchain interactions
4. **UnifiedWalletProvider** - Provides a consistent interface for wallet operations across both networks

## Basic Usage

### Switching Networks

```tsx
import { useNetwork, BlockchainNetwork } from './contexts/NetworkContext';

function NetworkSwitcher() {
  const { selectedNetwork, setSelectedNetwork } = useNetwork();

  return (
    <div>
      <button onClick={() => setSelectedNetwork(BlockchainNetwork.APTOS)}>
        Switch to Aptos
      </button>
      <button onClick={() => setSelectedNetwork(BlockchainNetwork.ALGORAND)}>
        Switch to Algorand
      </button>
      <p>Current network: {selectedNetwork}</p>
    </div>
  );
}
```

### Connecting a Wallet

```tsx
import { useUnifiedWallet } from './contexts/UnifiedWalletContext';

function WalletConnect() {
  const { connected, connecting, account, connect, disconnect, currentNetwork } = useUnifiedWallet();

  return (
    <div>
      {!connected ? (
        <button onClick={connect} disabled={connecting}>
          {connecting ? 'Connecting...' : 'Connect Wallet'}
        </button>
      ) : (
        <div>
          <p>Connected to {currentNetwork}</p>
          <p>Account: {account}</p>
          <button onClick={disconnect}>Disconnect</button>
        </div>
      )}
    </div>
  );
}
```

### Submitting Transactions

```tsx
import { useUnifiedWallet } from './contexts/UnifiedWalletContext';
import { useNetwork, BlockchainNetwork } from './contexts/NetworkContext';

function CreateRoute() {
  const { signAndSubmitTransaction, connected } = useUnifiedWallet();
  const { selectedNetwork } = useNetwork();

  const handleCreateRoute = async () => {
    if (!connected) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      if (selectedNetwork === BlockchainNetwork.APTOS) {
        // Aptos transaction format
        const transaction = {
          data: {
            function: "0x123::module::create_route",
            typeArguments: [],
            functionArguments: [recipient, amount, frequency],
          }
        };
        
        const response = await signAndSubmitTransaction(transaction);
        console.log('Transaction successful:', response);
      } else if (selectedNetwork === BlockchainNetwork.ALGORAND) {
        // Algorand transaction format (to be implemented)
        const transaction = {
          // TODO: Define Algorand transaction structure
        };
        
        const response = await signAndSubmitTransaction(transaction);
        console.log('Transaction successful:', response);
      }
    } catch (error) {
      console.error('Transaction failed:', error);
    }
  };

  return (
    <button onClick={handleCreateRoute}>
      Create Route
    </button>
  );
}
```

### Accessing Network-Specific Features

You can still access network-specific features through their respective contexts:

```tsx
import { useAptos } from './contexts/AptosContext';
import { useAlgorand } from './contexts/AlgorandContext';
import { useNetwork, BlockchainNetwork } from './contexts/NetworkContext';

function RoutesList() {
  const { selectedNetwork } = useNetwork();
  const aptosContext = useAptos();
  const algorandContext = useAlgorand();

  const fetchRoutes = async () => {
    if (selectedNetwork === BlockchainNetwork.APTOS) {
      const routes = await aptosContext.listAllRoutes();
      console.log('Aptos routes:', routes);
    } else if (selectedNetwork === BlockchainNetwork.ALGORAND) {
      const routes = await algorandContext.listAllRoutes();
      console.log('Algorand routes:', routes);
    }
  };

  return (
    <button onClick={fetchRoutes}>
      Fetch Routes
    </button>
  );
}
```

## Migration Guide

### Before (Aptos only)

```tsx
import { useWallet } from '@aptos-labs/wallet-adapter-react';

function OldComponent() {
  const { connected, account, signAndSubmitTransaction } = useWallet();
  // ...
}
```

### After (Unified)

```tsx
import { useUnifiedWallet } from './contexts/UnifiedWalletContext';

function NewComponent() {
  const { connected, account, signAndSubmitTransaction } = useUnifiedWallet();
  // Same interface! But now works with both Aptos and Algorand
}
```

## Important Notes

1. **Automatic Network Switching**: The UnifiedWalletProvider automatically uses the correct wallet provider based on the selected network.

2. **Connection State**: When switching networks, the wallet connection state is maintained separately for each network.

3. **Transaction Format**: While the `signAndSubmitTransaction` method is unified, you still need to format transactions according to each network's requirements.

4. **Algorand Wallet Selection**: For Algorand, the system supports multiple wallets:
   - Defly Wallet
   - Pera Wallet  
   - Lute Wallet

5. **Error Handling**: Always wrap wallet operations in try-catch blocks and check the `error` state from `useUnifiedWallet()`.

## TODO Items for Algorand Integration

The following items still need to be implemented for full Algorand support:

1. **Smart Contract Interactions**: Implement `getRouteCore` and `listAllRoutes` in AlgorandContext
2. **Transaction Signing**: Complete the Algorand transaction signing logic in UnifiedWalletContext
3. **Wallet UI**: Add a wallet selection modal for Algorand wallets
4. **Network Configuration**: Set the correct Algorand app ID when contracts are deployed
5. **Testing**: Test wallet connections and transactions on Algorand testnet/mainnet

## Example: Full Component with Both Networks

```tsx
import { useUnifiedWallet } from './contexts/UnifiedWalletContext';
import { useNetwork, BlockchainNetwork } from './contexts/NetworkContext';
import { useAptos } from './contexts/AptosContext';
import { useAlgorand } from './contexts/AlgorandContext';

function SmartRouteCreator() {
  const { connected, connect, signAndSubmitTransaction } = useUnifiedWallet();
  const { selectedNetwork, setSelectedNetwork } = useNetwork();
  const aptosContext = useAptos();
  const algorandContext = useAlgorand();

  const createRoute = async (recipient: string, amount: string) => {
    if (!connected) {
      await connect();
    }

    try {
      if (selectedNetwork === BlockchainNetwork.APTOS) {
        const transaction = {
          data: {
            function: `${MODULE_ADDRESS}::${MODULE_NAME}::create_route`,
            functionArguments: [recipient, amount],
          }
        };
        await signAndSubmitTransaction(transaction);
      } else {
        // Algorand implementation
        // TODO: Implement Algorand route creation
      }
    } catch (error) {
      console.error('Failed to create route:', error);
    }
  };

  return (
    <div>
      <select 
        value={selectedNetwork} 
        onChange={(e) => setSelectedNetwork(e.target.value as BlockchainNetwork)}
      >
        <option value={BlockchainNetwork.APTOS}>Aptos</option>
        <option value={BlockchainNetwork.ALGORAND}>Algorand</option>
      </select>
      
      {!connected && (
        <button onClick={connect}>Connect Wallet</button>
      )}
      
      {connected && (
        <button onClick={() => createRoute('0x123...', '1000')}>
          Create Route on {selectedNetwork}
        </button>
      )}
    </div>
  );
}
```

