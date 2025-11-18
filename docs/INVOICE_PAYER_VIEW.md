# Invoice Payer View & Approval System

## Overview

This feature enables invoice payers to view, review, and interact with invoice routes they've received. Payers can approve (accept & fund) or decline invoice requests directly from the dashboard.

## User Experience

### For Invoice Creators (Beneficiaries)

1. **Create Invoice Route** - Follow the invoice creation wizard to request payment
2. **View Sent Invoices** - Navigate to the "Invoices" tab to see all invoices you've sent
3. **Track Status** - Monitor whether payers have accepted or declined your invoices

### For Invoice Payers

1. **View Received Invoices** - Navigate to the "Invoices" tab to see pending payment requests
2. **Review Details** - Expand invoice cards to see:
   - Token amount and schedule
   - Beneficiary (who will receive payments)
   - Start date and payment frequency
   - Route type and blockchain details
3. **Take Action**:
   - **Accept & Fund** - Approve the invoice and transfer tokens to the route contract
   - **Decline** - Reject the invoice request

## Features

### Dashboard Integration

#### Invoices Tab
The dashboard now includes a dedicated "Invoices" tab with two sections:

**Received Invoices** (Top Section)
- Shows invoices where you are the payer
- Pending invoices display action buttons (Accept/Decline)
- Badge notification shows count of pending invoices
- Displays invoice status: Pending, Funded, or Declined

**Sent Invoices** (Bottom Section)
- Shows invoices you've created as beneficiary
- View-only cards showing invoice status
- No action buttons (payer controls the approval)

### Invoice Card Component

Each invoice card displays:

**Header**
- Token logo and symbol
- Total invoice amount
- Status badge (Pending/Funded/Declined)

**Key Details**
- From (Requester/Beneficiary)
- To (Beneficiary)
- Payment schedule
- Start date

**Expandable Details**
- Route type
- Route ID
- Creation date
- Transaction hash

**Action Buttons** (For pending invoices only)
- **Accept & Fund** - Green button with loading state
- **Decline** - Red button with loading state

### Status Management

#### Invoice Statuses

| Status | Description | Who Can Update |
|--------|-------------|----------------|
| `pending` | Invoice created, awaiting payer approval | System (on creation) |
| `active` | Payer has accepted and funded the invoice | Payer (via Accept) |
| `declined` | Payer has rejected the invoice | Payer (via Decline) |
| `completed` | All tokens have been claimed | System |
| `cancelled` | Route was cancelled | Creator/Admin |

### SDK Integration

The feature uses the Algorand Waypoint SDK methods:

#### Accept Invoice
```typescript
await algorandWaypointClient.acceptInvoiceRoute({
  routeAppId: invoiceAppId,
  payer: payerAddress,
  signer: transactionSigner,
});
```

**What happens when accepting:**
1. Payer's wallet signs the transaction
2. Tokens are transferred from payer to route contract
3. Platform fee is deducted (payer pays the fee)
4. Route status changes from `pending` to `active`
5. Database is updated
6. Beneficiary can now claim tokens according to schedule

#### Decline Invoice
```typescript
await algorandWaypointClient.declineInvoiceRoute({
  routeAppId: invoiceAppId,
  payer: payerAddress,
  signer: transactionSigner,
});
```

**What happens when declining:**
1. Payer's wallet signs the transaction
2. Route status changes from `pending` to `declined`
3. Database is updated
4. No tokens are transferred
5. Invoice becomes inactive

## Technical Implementation

### Backend Changes

#### Database Schema (`Route` Model)
- Updated `status` enum to include `pending` and `declined`
- Added `payer_address` field for invoice routes
- Migration: `add-invoice-statuses.js`

#### API Endpoints
Updated `/api/routes` to support:
- Filtering by `payer_address`
- Filtering by `route_type`
- Filtering by `status`

Example:
```javascript
GET /api/routes?payer_address=ADDR123...&status=pending&route_type=invoice-routes
```

#### Route Creation
Invoice routes are automatically created with:
- `status: "pending"`
- `route_type: "invoice-routes"`
- `payer_address: <payer-wallet-address>`

### Frontend Changes

#### New Components
- **InvoiceCard.tsx** - Displays invoice details with approve/decline buttons
  - Expandable details section
  - Status badges
  - Loading states during transactions
  - Error handling with toast notifications

#### Updated Components
- **app.tsx (Dashboard)** - Added Invoices tab
  - Two-section layout (Received/Sent)
  - Badge notification for pending invoices
  - Tab switching functionality
  - Integrated SDK methods for accept/decline

#### API Type Updates
- Updated `RouteData` interface to include new statuses and `payer_address`
- Updated `CreateRoutePayload` to accept invoice fields

### Data Flow

#### Creating an Invoice
```
User (Beneficiary)
  ↓
RouteCreationWizard
  ↓
algorandWaypointClient.createInvoiceRequest()
  ↓
Backend API (POST /api/routes)
  ↓
Database (status: "pending", payer_address: X)
```

#### Accepting an Invoice
```
User (Payer) clicks "Accept & Fund"
  ↓
handleAcceptInvoice()
  ↓
algorandWaypointClient.acceptInvoiceRoute()
  ↓
Blockchain transaction (tokens transferred)
  ↓
Status updates to "active"
  ↓
Database updated
  ↓
UI refreshes via refetch()
```

#### Declining an Invoice
```
User (Payer) clicks "Decline"
  ↓
handleDeclineInvoice()
  ↓
algorandWaypointClient.declineInvoiceRoute()
  ↓
Blockchain transaction (status change)
  ↓
Status updates to "declined"
  ↓
Database updated
  ↓
UI refreshes via refetch()
```

## Setup & Migration

### 1. Run Database Migration

```bash
cd backend
node src/migrations/add-invoice-statuses.js
```

This adds `pending` and `declined` to the status enum.

### 2. Verify SDK Version

Ensure you have the latest Waypoint SDK with invoice support:
- `acceptInvoiceRoute()` method
- `declineInvoiceRoute()` method
- `getInvoiceStatus()` method

### 3. Test the Feature

#### Create an Invoice (as Beneficiary)
1. Connect your Algorand wallet
2. Navigate to "Create Route"
3. Select "Invoice Routes"
4. Complete the wizard with a test payer address
5. Sign and submit

#### Accept Invoice (as Payer)
1. Switch to the payer wallet
2. Navigate to "Invoices" tab
3. View the pending invoice
4. Click "Accept & Fund"
5. Sign the transaction
6. Verify status changes to "Funded"

#### Decline Invoice (as Payer)
1. Switch to the payer wallet
2. Navigate to "Invoices" tab
3. View the pending invoice
4. Click "Decline"
5. Sign the transaction
6. Verify status changes to "Declined"

## User Interface

### Desktop View
- Full-width cards in responsive grid (3 columns on XL, 2 on MD)
- Side-by-side action buttons
- Expandable details section
- Tab navigation at top

### Mobile View
- Single column layout
- Stacked action buttons
- Touch-optimized tap targets
- Responsive tab navigation

### Visual Feedback

**Status Badges**
- 🟡 Pending - Yellow with clock icon
- 🟢 Funded - Green with checkmark
- 🔴 Declined - Red with X

**Loading States**
- Animated spinner during transactions
- Button text changes: "Accepting..." / "Declining..."
- Buttons disabled during processing

**Toast Notifications**
- Success: "Invoice accepted successfully!"
- Error: Displays specific error message
- Info: "Invoice declined"

## Security Considerations

1. **Wallet Verification** - Only the designated payer can accept/decline
2. **Transaction Signing** - All actions require wallet signature
3. **Status Validation** - Only pending invoices can be accepted/declined
4. **Address Validation** - Payer address must match connected wallet
5. **Error Handling** - Graceful error messages for failed transactions

## Future Enhancements

### Phase 2
- [ ] Email/push notifications when payer receives invoice
- [ ] Email/push notifications when invoice is accepted/declined
- [ ] Invoice expiration dates
- [ ] Invoice memo/notes field
- [ ] Partial payment acceptance
- [ ] Bulk invoice actions

### Phase 3
- [ ] Invoice templates for recurring requests
- [ ] CSV import/export for bulk invoicing
- [ ] Invoice analytics dashboard
- [ ] Multi-token invoices
- [ ] Payment milestones/installments
- [ ] Dispute resolution system

## Troubleshooting

### "Wallet not connected" Error
**Solution:** Ensure your Algorand wallet is connected and on the correct network

### Invoice doesn't appear in "Received Invoices"
**Solution:** Verify that:
- The payer address in the invoice matches your connected wallet
- Database contains the correct `payer_address`
- Route type is set to `invoice-routes`

### Accept button is disabled
**Solution:** Check:
- Invoice status is `pending` (not already accepted/declined)
- You have sufficient tokens + fee in your wallet
- Wallet is connected to the correct network

### Transaction fails after signing
**Solution:** 
- Check wallet balance (need tokens + fee + gas)
- Verify token opt-in (must be opted into the token)
- Check network connectivity
- Review browser console for specific error

## Related Documentation

- [Invoice Routes Feature](./INVOICE_ROUTES_FEATURE.md) - Creating invoices
- [Algorand Integration](./ALGORAND_INTEGRATION.md) - Blockchain details
- [SDK Documentation](../sdk/README.md) - SDK methods
- [Invoice Examples](../sdk/examples/algorand-invoice-node.ts) - Code examples

## Support

For issues or questions:
1. Check the browser console for errors
2. Verify SDK version and methods
3. Review transaction history on blockchain explorer
4. Check database for correct status and payer_address

---

**Last Updated:** November 18, 2024  
**Version:** 1.0  
**Status:** ✅ Production Ready

