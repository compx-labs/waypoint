# Unified Wallet System - Quick Reference

## Import Statements

```tsx
// Main unified hook (recommended for most cases)
import { useWallet } from './hooks/useWallet';

// Individual contexts (for advanced usage)
import { useUnifiedWallet } from './contexts/UnifiedWalletContext';
import { useNetwork, BlockchainNetwork } from './contexts/NetworkContext';
import { useAptos } from './contexts/AptosContext';
import { useAlgorand } from './contexts/AlgorandContext';
```

## Quick Examples

### 1. Connect/Disconnect Wallet (Any Network)

```tsx
function WalletButton() {
  const { connected, connecting, connect, disconnect, account } = useWallet();
  
  if (!connected) {
    return (
      <button onClick={connect} disabled={connecting}>
        {connecting ? 'Connecting...' : 'Connect'}
      </button>
    );
  }
  
  return (
    <div>
      <span>{account}</span>
      <button onClick={disconnect}>Disconnect</button>
    </div>
  );
}
```

### 2. Network Switcher

```tsx
function NetworkSelector() {
  const { selectedNetwork, setSelectedNetwork } = useWallet();
  
  return (
    <select 
      value={selectedNetwork} 
      onChange={(e) => setSelectedNetwork(e.target.value as BlockchainNetwork)}
    >
      <option value={BlockchainNetwork.APTOS}>Aptos</option>
      <option value={BlockchainNetwork.ALGORAND}>Algorand</option>
    </select>
  );
}
```

### 3. Submit Transaction

```tsx
function TransactionButton() {
  const { signAndSubmitTransaction, isAptos, connected } = useWallet();
  
  const handleTransaction = async () => {
    if (!connected) return;
    
    const tx = isAptos 
      ? { data: { function: "0x1::module::fn", functionArguments: [] } }
      : { /* Algorand tx format */ };
      
    try {
      const result = await signAndSubmitTransaction(tx);
      console.log('Success:', result);
    } catch (error) {
      console.error('Failed:', error);
    }
  };
  
  return <button onClick={handleTransaction}>Send Transaction</button>;
}
```

### 4. Fetch Blockchain Data

```tsx
function RoutesList() {
  const { getNetworkContext, isAptos } = useWallet();
  const [routes, setRoutes] = useState([]);
  
  useEffect(() => {
    const fetchRoutes = async () => {
      const context = getNetworkContext();
      if (context) {
        const routesList = await context.listAllRoutes();
        setRoutes(routesList || []);
      }
    };
    
    fetchRoutes();
  }, [isAptos]);
  
  return <div>{/* render routes */}</div>;
}
```

### 5. Network-Specific Logic

```tsx
function SmartComponent() {
  const { isAptos, isAlgorand, aptosContext, algorandContext } = useWallet();
  
  if (isAptos) {
    // Use aptosContext for Aptos-specific features
    console.log('Aptos network:', aptosContext?.network);
  }
  
  if (isAlgorand) {
    // Use algorandContext for Algorand-specific features  
    console.log('Algorand network:', algorandContext?.network);
  }
  
  return <div>Network-aware component</div>;
}
```

## Available Properties

### From `useWallet()` hook:

| Property | Type | Description |
|----------|------|-------------|
| `connected` | boolean | Is wallet connected? |
| `connecting` | boolean | Is connection in progress? |
| `account` | string \| null | Current account address |
| `connect` | () => Promise<void> | Connect wallet |
| `disconnect` | () => Promise<void> | Disconnect wallet |
| `signAndSubmitTransaction` | (tx) => Promise<any> | Sign and submit transaction |
| `currentNetwork` | BlockchainNetwork | Currently active network |
| `selectedNetwork` | BlockchainNetwork | Selected blockchain |
| `setSelectedNetwork` | (network) => void | Switch blockchain |
| `isAptos` | boolean | Is Aptos selected? |
| `isAlgorand` | boolean | Is Algorand selected? |
| `aptosContext` | AptosContextType \| null | Aptos-specific context |
| `algorandContext` | AlgorandContextType \| null | Algorand-specific context |
| `getNetworkContext` | () => any | Get active network context |
| `error` | string \| null | Current error state |

## Common Patterns

### Check Connection Before Action

```tsx
const { connected, connect } = useWallet();

const doSomething = async () => {
  if (!connected) {
    await connect();
  }
  // proceed with action
};
```

### Handle Errors Gracefully

```tsx
const { signAndSubmitTransaction, error } = useWallet();

try {
  await signAndSubmitTransaction(tx);
} catch (err) {
  console.error('Transaction failed:', err);
}

// Or check error state
if (error) {
  return <div>Error: {error}</div>;
}
```

### Switch Network and Reconnect

```tsx
const { setSelectedNetwork, disconnect, connect } = useWallet();

const switchAndReconnect = async (network: BlockchainNetwork) => {
  await disconnect();
  setSelectedNetwork(network);
  await connect();
};
```

## Network Enum Values

```tsx
BlockchainNetwork.APTOS     // "APTOS"
BlockchainNetwork.ALGORAND  // "ALGORAND"
```

## Supported Wallets

**Aptos:**
- Petra Wallet
- Martian Wallet
- Pontem Wallet
- And all Aptos-compatible wallets

**Algorand:**
- Defly Wallet
- Pera Wallet
- Lute Wallet

## Notes

1. **Automatic Provider Selection**: The system automatically uses the correct wallet provider based on `selectedNetwork`
2. **Persistent State**: Wallet connection state persists within the same session
3. **SSR Safe**: All wallet operations are client-side only
4. **Type Safe**: Full TypeScript support throughout
5. **Error Handling**: Always check `error` state or wrap operations in try-catch

