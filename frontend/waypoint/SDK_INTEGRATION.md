# Waypoint SDK Integration Guide

## Overview

The Waypoint SDK has been integrated into the frontend application to simplify route creation and management. The SDK handles all transaction building, validation, and backend registration.

## What Changed

### 1. SDK Installation

The SDK is now included as a dependency in `package.json`:

```json
"@waypoint/sdk": "^0.1.0"
```

During development, the SDK is linked locally using `npm link`.

### 2. AptosContext Updates

The `AptosContext` now initializes and provides the `AptosWaypointClient`:

```typescript
import { AptosWaypointClient } from '@waypoint/sdk';

// Context includes waypointClient
interface AptosContextType {
  aptos: Aptos | null;
  waypointClient: AptosWaypointClient | null;
  // ... other fields
}

// SDK is initialized with network and backend URL
const waypoint = new AptosWaypointClient({
  network: sdkNetwork,
  aptosConfig: config,
  backendUrl: BACKEND_API_URL,
});
```

### 3. Route Creation Logic

The `handleCreateAptosRoute` function in `RouteCreationWizard.tsx` now uses the SDK:

**Before:**
```typescript
// Manually building transaction payload
const response = await aptosWallet.signAndSubmitTransaction({
  data: {
    function: `${moduleAddress}::${moduleName}::${functionName}`,
    functionArguments: [...]
  }
});

// Manually saving to backend
await createRouteMutation.mutateAsync(routePayload);
```

**After:**
```typescript
// SDK builds the transaction
const transactionPayload = await waypointClient.buildCreateRouteTransaction({
  sender: aptosWallet.account.address.toString(),
  beneficiary: data.recipientAddress,
  tokenMetadata: data.selectedToken.contract_address,
  amount: amountInUnits,
  startTimestamp: startTimestamp,
  periodSeconds: periodInSeconds,
  payoutAmount: payoutAmountInUnits,
  maxPeriods: maxPeriods,
  feeAmount: 0n, // SDK calculates this
  routeType: routeType === "milestone-routes" ? "milestone" : "simple",
});

// Wallet signs the pre-built transaction
const response = await aptosWallet.signAndSubmitTransaction({
  data: transactionPayload,
});

// SDK handles backend registration
await waypointClient.registerRouteWithBackend(
  routeObjAddress,
  response.hash,
  params,
  tokenId
);
```

## Benefits

1. **Simplified Transaction Building**: No need to manually construct function arguments or module addresses
2. **Automatic Fee Calculation**: SDK calculates the 0.5% fee automatically
3. **Type Safety**: All parameters are strongly typed with TypeScript
4. **Validation**: SDK validates all inputs before building transactions
5. **Network Switching**: SDK automatically uses the correct contract addresses for mainnet/testnet
6. **Backend Integration**: Optional but recommended backend registration is now a single function call
7. **Reusability**: Same SDK can be used across different applications

## Configuration

### Environment Variables

Set the backend URL via environment variable:

```bash
VITE_API_URL=https://your-backend-api.com
```

Or it defaults to `http://localhost:3000` during development.

### Network Switching

The SDK automatically detects the network from the Aptos context:

```typescript
const sdkNetwork = network === Network.MAINNET ? 'mainnet' : 'testnet';
```

## Testing

To test the integration:

1. Start the frontend dev server: `npm run dev`
2. Connect an Aptos wallet (Petra, Martian, etc.)
3. Create a route through the UI
4. Verify the SDK:
   - Builds the correct transaction payload
   - Signs and submits via the wallet
   - Registers the route with the backend
   - Shows appropriate toast notifications

## Troubleshooting

### SDK Not Initialized

If you see "Waypoint SDK not initialized":
- Check that `AptosContext` is properly wrapping your app
- Verify the network is set correctly
- Check browser console for initialization errors

### Transaction Fails

If transactions fail:
- Verify the wallet is connected
- Check sufficient token and gas balances
- Ensure the token metadata address is correct
- Look for validation errors in the console

### Backend Registration Fails

Backend registration failure doesn't stop the transaction:
- The route is still created on-chain
- Check network connectivity to the backend
- Verify the backend URL is correct
- Check backend logs for errors

## Future Enhancements

- Add claim transaction building via SDK
- Add approve milestone transaction building via SDK
- Use SDK query functions for reading route state
- Add batch transaction support
- Implement transaction simulation before signing

## Related Files

- `sdk/` - SDK source code
- `app/contexts/AptosContext.tsx` - SDK initialization
- `app/components/RouteCreationWizard.tsx` - Route creation using SDK
- `sdk/README.md` - Full SDK documentation
- `sdk/examples/` - Usage examples

