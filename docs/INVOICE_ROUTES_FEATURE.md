# Invoice Routes Feature

## Overview

Invoice routes allow users to **request payment** from a third party (payer) with flexible payment schedules. Unlike regular routes where the sender deposits tokens immediately, invoice routes create a payment request that the payer must **accept and fund** before tokens are routed to the beneficiary.

## Key Differences: Invoice vs. Regular Routes

| Aspect | Regular Routes | Invoice Routes |
|--------|---------------|----------------|
| **Flow** | Sender deposits → Route active | Requester creates → Payer accepts → Route active |
| **Token Deposit** | Sender deposits immediately | Payer deposits after accepting |
| **Fee Payment** | Sender pays fee | Payer pays fee when accepting |
| **Parties** | 2 (Sender & Recipient) | 3 (Requester, Payer & Beneficiary) |
| **Status** | Active immediately | Pending until payer accepts |

## User Flow

### Creating an Invoice (Requester/Beneficiary)

1. **Select Token** - Choose which token to request payment in
2. **Amount & Schedule** - Specify total amount and unlock schedule
3. **Timing** - Set when the route should start (after payer accepts)
4. **Payer** - Specify who should receive the invoice and pay for it
5. **Review & Create** - Review and sign the invoice request transaction

**Note:** You (the connected wallet) are automatically set as the beneficiary who will receive the payments.

**Important Notes:**
- ✅ The requester does NOT need to own the selected token
- ✅ You can select any token - no balance checks are performed
- ✅ No fee is charged to the requester (payer pays fee when accepting)
- ✅ The invoice is in "pending" status until the payer accepts
- ✅ You (the connected wallet) are automatically set as the beneficiary

### Accepting an Invoice (Payer)

Once an invoice is created, the payer can:
1. **Accept** - Approve and fund the invoice (pays route amount + platform fee)
2. **Decline** - Reject the invoice request

After acceptance:
- Tokens are locked in the route contract
- The beneficiary can claim payments according to the schedule
- The route becomes active

## Implementation Details

### Frontend Changes (`RouteCreationWizard.tsx`)

#### New Components
- **PayerStep** - New wizard step for specifying the payer address (with NFD support)

#### Updated Components
- **TokenSelectionStep** - Updated for invoice routes:
  - Changed description text: "Choose which stablecoin you want to request payment in"
  - Skips balance checks (requester doesn't need tokens)
  - Hides "Buy on CompX" / "Get on Orbital" buttons (not needed for requesters)
  - Shows "Request payment in [TOKEN]" text instead of balance info
  - All tokens are selectable regardless of user's balance
  
- **RecipientStep** - Skipped entirely for invoice routes (not needed)
  
- **AmountScheduleStep** - No balance checks for invoice routes (requester doesn't need tokens)
  
- **SummaryStep** - Enhanced for invoice routes:
  - Shows "Beneficiary (You)" with helper text
  - Displays payer information prominently
  - Clarifies that payer will pay the fee when accepting

#### Conditional Flow
The wizard now dynamically adjusts based on route type:
```
Regular Routes: Token → Amount → Timing → Recipient → Review (5 steps)
Invoice Routes: Token → Amount → Timing → Payer → Review (4 steps)
```

**Key Differences for Invoice Routes:**
1. **Beneficiary is auto-set** - The connected wallet is automatically set as the beneficiary
2. **No balance required** - Any token can be selected, regardless of the requester's balance
3. **No fee for requester** - Fee calculation and payment is deferred to the payer
4. **Recipient step skipped** - Since beneficiary is always the requester

#### Fee Handling
- **Regular Routes**: Sender pays fee immediately (shown in Amount & Review steps)
- **Invoice Routes**: No fee shown to requester (payer pays when accepting the invoice)

### Backend Changes

#### Database Schema (`Route` model)
Added new field:
- `payer_address` (STRING, nullable) - The wallet address that will fund the invoice

Migration: `add-payer-address-to-routes.js`

#### Route Types (`seed-route-types.js`)
Added new route type for Algorand:
```javascript
{
  route_type_id: 'invoice-routes',
  display_name: 'Invoice Routes',
  description: 'Request payment from a third party...',
  network: 'algorand',
  module_name: 'waypoint-invoice',
  enabled: true,
}
```

### SDK Integration

The frontend uses the Algorand Waypoint SDK methods:

#### Creating an Invoice
```typescript
await algorandWaypointClient.createInvoiceRequest({
  requester: connectedWalletAddress,
  beneficiary: beneficiaryAddress,
  payer: payerAddress,
  tokenId: tokenAssetId,
  grossInvoiceAmount: amountInUnits,
  payoutAmount: payoutAmountInUnits,
  startTimestamp: startTs,
  periodSeconds: periodSecs,
  maxPeriods: maxPeriods,
  signer: transactionSigner,
});
```

## 🎯 Key Features

✅ **Simplified Invoice Flow** - Only 4 steps (skips recipient selection)  
✅ **Auto-Beneficiary** - Creator is automatically set as beneficiary  
✅ **No Balance Required** - Requester can select any token without owning it  
✅ **No Balance Checks** - Token selection doesn't check user's balance  
✅ **No "Get Token" Buttons** - Buy/Get buttons hidden (requester doesn't need tokens)  
✅ **NFD Support** - Payer can use NFD addresses (e.g., alice.algo)  
✅ **Address Book** - Select payer from saved addresses  
✅ **Clear Fee Messaging** - Shows payer will pay fee when accepting  
✅ **Network Validation** - Payer addresses validated for Algorand  
✅ **Database Support** - Payer address and route type saved to database  
✅ **SDK Integration** - Uses `createInvoiceRequest()` method  

## Use Cases

### Freelance/Contractor Payments
A freelancer creates an invoice route for their client:
- **Beneficiary**: Freelancer's wallet (automatically set)
- **Payer**: Client's wallet
- **Schedule**: Monthly payments over 6 months

### Service Subscriptions
A service provider creates invoice routes for customers:
- **Beneficiary**: Service provider's wallet (automatically set)
- **Payer**: Customer's wallet
- **Schedule**: Weekly or monthly recurring payments

### Delegated Payroll
A payroll service creates invoice routes on behalf of employees:
- **Beneficiary**: Employee wallet (specified by payroll service)
- **Payer**: Company treasury wallet
- **Schedule**: Bi-weekly or monthly salary payments

**Note:** For employee payroll, you would need to use the regular route type, not invoice routes, since the beneficiary is not the creator. Invoice routes are specifically for requesting payment for yourself.

### B2B Payments
A supplier creates invoice routes for business customers:
- **Beneficiary**: Supplier's wallet (automatically set)
- **Payer**: Business customer's wallet
- **Schedule**: Installment payments

## Testing the Feature

### Prerequisites
1. Run the database migration:
   ```bash
   cd backend
   node src/migrations/add-payer-address-to-routes.js
   ```

2. Update route types:
   ```bash
   node src/seeders/seed-route-types.js
   ```

3. Ensure you have the latest Waypoint SDK with invoice support

### Test Flow

#### Step 1: Create Invoice (Requester Side)
1. **Connect Algorand wallet** (This will be the beneficiary)
2. **Navigate to "Create Route"** from dashboard
3. **Select "Invoice Routes"** route type
4. **Complete the 4-step wizard:**
   
   **Step 1 - Token Selection:**
   - Choose any token (USDC, xUSD, etc.)
   - ✅ No balance required - all tokens are selectable
   - Notice: Shows "Request payment in [TOKEN]" instead of balance
   - Notice: No "Buy" or "Get" buttons appear
   
   **Step 2 - Amount & Schedule:**
   - Set invoice amount (e.g., 100 USDC)
   - Set unlock schedule (e.g., 10 per day)
   - ✅ No balance check or warnings appear
   
   **Step 3 - Start Time:**
   - Choose when route should start after acceptance
   - Can be immediate or scheduled for future
   
   **Step 4 - Payer:**
   - Enter payer wallet address (or NFD like `client.algo`)
   - Use a different wallet you control for testing
   - Can select from address book if available
   
5. **Review & Sign:**
   - Verify beneficiary is YOU (automatic)
   - Verify payer address is correct
   - Sign 3 transactions (create app, initialize, create route)
   - ✅ Invoice created in "pending" status!

#### Step 2: Accept Invoice (Payer Side)
1. Switch to the payer wallet in your Algorand wallet app
2. View the pending invoice in your dashboard (future feature)
3. Accept or decline the invoice
4. If accepted, payer pays: invoice amount + platform fee

## 📋 What's Next

The invoice creation flow is complete! To fully enable the invoice routes feature, you'll need to implement the payer acceptance flow:

### Immediate Next Steps

1. **Dashboard Enhancements** - Show invoices by status:
   - "Sent Invoices" tab - invoices you created (as beneficiary)
   - "Received Invoices" tab - invoices you need to pay (as payer)
   - Status badges: "Pending", "Funded", "Declined"

2. **Invoice Acceptance UI** - Allow payers to:
   - View invoice details (amount, schedule, beneficiary)
   - See fee calculation before accepting
   - Accept button → calls `acceptInvoiceRoute()`
   - Decline button → calls `declineInvoiceRoute()`

3. **Status Management** - Update invoice status:
   - Show "Pending Acceptance" for new invoices
   - Show "Active" after payer accepts
   - Show "Declined" if payer rejects
   - Show "Completed" when fully claimed

### Future Enhancements

4. **Notifications** - Alert users when:
   - Payer receives new invoice
   - Invoice is accepted/declined
   - Payments become claimable

5. **Invoice Metadata** - Add:
   - Invoice description/memo
   - Due date / expiration
   - Invoice reference number
   - Attachments or notes

6. **Bulk Operations** - Enable:
   - Create multiple invoices at once
   - Recurring invoice templates
   - CSV import for bulk invoicing

7. **Aptos Support** - Extend invoice routes to Aptos network

## Technical Notes

### NFD Support
The payer step supports NFD (Algorand Name Service) resolution:
- Enter `alice.algo` instead of full address
- Automatic resolution and validation
- Shows resolved address for confirmation

**Note:** The beneficiary doesn't need NFD support since it's automatically set to the connected wallet.

### Balance-Free Token Selection
For invoice routes, the token selection process:
- Does NOT call `getTokenBalance()` 
- Does NOT check if user has sufficient balance
- Does NOT display balance information
- Does NOT show "Buy on CompX" or "Get on Orbital" buttons
- Allows selection of any token regardless of user's holdings
- Shows "Request payment in [TOKEN]" helper text instead

### Transaction Flow (Algorand)
Creating an invoice requires 3 transactions:
1. **Create App** - Deploy the invoice route smart contract
2. **Initialize App** - Fund with minimum balance (0.4 ALGO)
3. **Create Route** - Set up the invoice parameters (no token transfer)

Accepting an invoice requires 1 transaction:
1. **Accept Route** - Transfer tokens to the route contract (includes platform fee)

### Status Management
Invoice routes have an additional status workflow:
- **PENDING** - Invoice created, awaiting payer acceptance
- **FUNDED** - Payer accepted and funded the invoice (route active)
- **DECLINED** - Payer rejected the invoice request

Regular route statuses:
- **active** - Route is active and claimable
- **completed** - All tokens have been claimed
- **cancelled** - Route was cancelled

## Support

For issues or questions about invoice routes:
1. Check the SDK documentation: `sdk/INVOICE_INTEGRATION_SUMMARY.md`
2. Review example code: `sdk/examples/algorand-invoice-node.ts`
3. Check the Algorand integration docs: `docs/ALGORAND_INTEGRATION.md`

