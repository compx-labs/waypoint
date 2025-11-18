# Invoice Contract SDK Integration - Complete ✅

## What Was Added

### 1. Types (`algorand/types.ts`)
- `InvoiceRouteStatus` enum (UNINITIALIZED, PENDING, FUNDED, DECLINED)
- `AlgorandInvoiceRouteDetails` interface (extends base route with invoice-specific fields)
- `CreateAlgorandInvoiceParams` (for creating invoice requests)
- `AcceptAlgorandInvoiceParams` (for payer accepting/funding)
- `DeclineAlgorandInvoiceParams` (for payer declining)

### 2. Transactions (`algorand/transactions.ts`)
- `createInvoiceRequest()` - Requester creates payment request
- `acceptInvoiceRoute()` - Payer funds the invoice
- `declineInvoiceRoute()` - Payer rejects the invoice

### 3. Queries (`algorand/queries.ts`)
- `getInvoiceRouteDetails()` - Fetch invoice state
- `isInvoicePending()` - Check if awaiting payer
- `isInvoiceFunded()` - Check if active
- `isInvoiceDeclined()` - Check if rejected
- `calculateInvoiceClaimableAmount()` - Calculate claimable tokens

### 4. Client (`algorand/client.ts`)
All invoice methods integrated into main `AlgorandWaypointClient` class

### 5. Exports (`index.ts`)
All new types and `WaypointInvoiceClient` exported

## Key Differences: Invoice vs Linear

**Linear**: Depositor creates → deposits tokens → route active  
**Invoice**: Requester creates request → Payer accepts/declines → if accepted, route active

## Usage Example

```typescript
// 1. Beneficiary creates invoice request
const invoice = await client.createInvoiceRequest({
  requester: beneficiaryAddress,
  beneficiary: beneficiaryAddress,
  payer: payerAddress,
  tokenId: 123456n,
  grossInvoiceAmount: 1000n,
  payoutAmount: 1000n,
  startTimestamp: 0n,
  periodSeconds: 1n,
  maxPeriods: 1n,
  signer: beneficiarySigner,
});

// 2. Payer accepts and funds
await client.acceptInvoiceRoute({
  routeAppId: invoice.routeAppId,
  payer: payerAddress,
  signer: payerSigner,
});

// Or payer declines
await client.declineInvoiceRoute({
  routeAppId: invoice.routeAppId,
  payer: payerAddress,
  signer: payerSigner,
});

// 3. Check status
const status = await client.getInvoiceStatus(invoice.routeAppId);
if (status === InvoiceRouteStatus.FUNDED) {
  // Beneficiary can now claim
  await client.claimFromRoute({...});
}
```

## Integration Complete ✅

All invoice contract functionality is now available in the SDK with the same patterns as linear routes.

