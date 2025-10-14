# Address Book NFD Support

This document describes the NFD (Algorand Name Service) support added to the Waypoint Address Book feature.

## Overview

The Address Book now supports NFDs (Algorand Name Service) with intelligent auto-resolution. Users can enter EITHER an NFD (e.g., `alice.algo`) OR a direct wallet address in a single field. When an NFD is detected, the system automatically resolves it to the corresponding Algorand wallet address and stores both the NFD and the resolved address.

## Features

### 1. **NFD Auto-Resolution**
- Users enter EITHER an NFD (e.g., `alice.algo`) OR a wallet address in a single field
- When input ends with `.algo`, the system automatically resolves it to the corresponding Algorand address
- Resolution happens with a 500ms debounce to avoid excessive API calls
- A "Resolving NFD..." indicator shows during the resolution process
- The resolved address is displayed in a confirmation box below the input

### 2. **Shortname Storage**
- When an NFD is used, both the NFD (as shortname) and resolved address are stored
- When a direct address is entered, only the address is stored (no shortname)
- Users don't need to enter both - just one or the other!

### 3. **Display Enhancement**
- Address book entries show two or three lines of information:
  1. **Name** (user-defined label in white)
  2. **Shortname** (NFD in sunset orange) - only shown if an NFD was used
  3. **Wallet Address** (full address in gray monospace font)

### 4. **Network-Aware Placeholders**
- Placeholder text adapts to the selected network:
  - **Algorand**: `alice.algo or ALGORAND_ADDRESS...` (base64 format)
  - **Aptos**: `name.apt or 0x...` (hex format)

### 5. **Address Validation**
- Real-time validation of wallet addresses
- Save button is disabled until address is validated:
  - **For NFDs**: Button stays disabled while resolving, enables only when NFD resolves successfully to a valid address
  - **For Direct Addresses**: Button enables only when address format is valid
- **Algorand validation**: Base64 encoded, 58 characters (A-Z, 2-7)
- **Aptos validation**: Hex format with 0x prefix, 1-64 hex characters
- Prevents saving invalid or malformed addresses

## Database Changes

### New Column: `shortname`
```sql
ALTER TABLE address_book 
ADD COLUMN shortname VARCHAR(255) NULL;
```

**Properties:**
- Type: VARCHAR(255)
- Nullable: Yes (optional field)
- Purpose: Store NFDs and other blockchain shortnames

## API Changes

### Updated Endpoints

**POST /api/address-book**
```json
{
  "owner_wallet": "0x123...",
  "name": "Alice's Wallet",
  "wallet_address": "ALGORAND_ADDRESS_HERE",
  "shortname": "alice.algo"  // NEW: Optional field
}
```

**PUT /api/address-book/:id**
```json
{
  "name": "Alice's Wallet",
  "wallet_address": "ALGORAND_ADDRESS_HERE",
  "shortname": "alice.algo"  // NEW: Optional field
}
```

**Response:**
```json
{
  "id": 1,
  "owner_wallet": "0x123...",
  "name": "Alice's Wallet",
  "wallet_address": "ALGORAND_ADDRESS_HERE",
  "shortname": "alice.algo",
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

## NFD Resolution

### API Used
The system uses the official NFD API direct lookup endpoint (as documented at [NFD API](https://api.nf.domains)):
```
https://api.nf.domains/nfd/{nfdName}?view=tiny&poll=false&nocache=false
```

### Resolution Logic
1. User types in the address/NFD field
2. System checks if input ends with `.algo`
3. If yes, waits 500ms (debounce)
4. Calls NFD API to resolve the name
5. Shows "Resolving NFD..." indicator during lookup
6. On success: Shows resolved address in confirmation box
7. On failure: Shows "NFD not found" error message

### Example NFD Resolution

**Successful Resolution:**
```javascript
// Input
"xxiled.algo"

// API Call
GET https://api.nf.domains/nfd/xxiled.algo?view=tiny&poll=false&nocache=false

// API Response
{
  "name": "xxiled.algo",
  "owner": "RS7TLLQRXKBAQDAVTSZC2ZLMVMLNSCL3FOUOESJJZ5XSKFFL56UI6X33CI",
  "caAlgo": ["RS7TLLQRXKBAQDAVTSZC2ZLMVMLNSCL3FOUOESJJZ5XSKFFL56UI6X33CI"],
  "depositAccount": "RS7TLLQRXKBAQDAVTSZC2ZLMVMLNSCL3FOUOESJJZ5XSKFFL56UI6X33CI",
  "properties": {...}
}

// Result
Shows: "✓ Resolved to: RS7TLLQRXKBAQDAVTSZC2ZLMVMLNSCL3FOUOESJJZ5XSKFFL56UI6X33CI"
Saves: shortname="xxiled.algo", wallet_address="RS7TLL..."
```

**Failed Resolution:**
```javascript
// Input
"nonexistent.algo"

// API Response
{
  "name": "notFound",
  "id": "S6sbAuHr",
  "message": "not found",
  "temporary": true,
  "timeout": false,
  "fault": false
}

// Result
Shows: "⚠ NFD not found. Please check the name or enter a wallet address directly."
User can correct NFD or enter direct address instead
```

## Setup Instructions

### 1. Run Database Migration

**For new installations:**
The migration runs automatically when you run:
```bash
npm run migrate
```

**For existing databases:**
Run the specific migration:
```bash
cd backend
node src/migrations/add-shortname-to-address-book.js
```

### 2. No Frontend Changes Required
The frontend automatically picks up the new field through the updated API.

## Usage Examples

### Example 1: Adding an NFD Entry
1. Open Address Book
2. Click "Add New Address"
3. Enter:
   - **Name:** "Alice" (required)
   - **NFD or Wallet Address:** "alice.algo"
4. Wait for NFD to resolve (shows "Resolving NFD...")
   - Save button is **disabled** during resolution
5. See confirmation: "✓ Resolved to: ALGORAND_ADDRESS..."
   - Save button becomes **enabled** (green)
6. Click "Save"

Result: Both the NFD (`alice.algo`) and resolved address are saved.

### Example 2: Adding a Direct Address
1. Open Address Book
2. Click "Add New Address"
3. Enter:
   - **Name:** "Bob's Wallet" (required)
   - **NFD or Wallet Address:** "RS7TLLQRXKBAQDAVTSZC2ZLMVMLNSCL3FOUOESJJZ5XSKFFL56UI6X33CI"
4. Address is validated automatically
   - Save button becomes **enabled** when valid Algorand address is detected
5. Click "Save"

Result: Only the address is saved (no shortname).

**Note:** If you enter an invalid address format, the Save button will remain disabled until you correct it.

### Example 3: Different Networks
**On Algorand:**
- Placeholder shows: `alice.algo or ALGORAND_ADDRESS...`
- Supports base64-encoded addresses

**On Aptos:**
- Placeholder shows: `name.apt or 0x...`
- Supports hex addresses (0x...)

## Technical Implementation

### Backend Files Modified
- `backend/src/models/AddressBook.js` - Added `shortname` field
- `backend/src/routes/addressBook.js` - Updated POST and PUT endpoints
- `backend/src/migrations/add-shortname-to-address-book.js` - New migration file

### Frontend Files Modified
- `frontend/waypoint/app/lib/api.ts` - Updated TypeScript interfaces
- `frontend/waypoint/app/components/AddressBookModal.tsx` - Added UI and NFD resolution logic

### Key Functions

**NFD Resolution (AddressBookModal.tsx):**
```typescript
// Auto-resolve NFD when input changes
useEffect(() => {
  const resolveIfNFD = async () => {
    if (formAddressOrNFD && formAddressOrNFD.endsWith('.algo')) {
      const address = await resolveNFD(formAddressOrNFD);
      if (address) {
        setResolvedAddress(address);
        setNfdResolved(true);
      }
    } else {
      // Not an NFD, treat as direct address
      setResolvedAddress("");
      setNfdResolved(false);
    }
  };

  const timeoutId = setTimeout(resolveIfNFD, 500); // Debounce
  return () => clearTimeout(timeoutId);
}, [formAddressOrNFD]);

// Save logic - determine what to store
const handleAdd = async () => {
  const finalAddress = nfdResolved ? resolvedAddress : formAddressOrNFD.trim();
  const finalShortname = nfdResolved ? formAddressOrNFD.trim() : null;
  
  await createMutation.mutateAsync({
    owner_wallet: wallet.account,
    name: formName.trim(),
    wallet_address: finalAddress,
    shortname: finalShortname,
  });
};

// Address validation
const validateAddress = (address: string, network: string): boolean => {
  if (!address || address.trim() === "") return false;
  
  if (network === 'ALGORAND') {
    // Algorand addresses: 58 chars, base32 encoded (A-Z, 2-7)
    const algorandRegex = /^[A-Z2-7]{58}$/;
    return algorandRegex.test(address);
  } else if (network === 'APTOS') {
    // Aptos addresses: hex with 0x prefix
    const aptosRegex = /^0x[a-fA-F0-9]{1,64}$/;
    return aptosRegex.test(address);
  }
  
  return false;
};
```

### Button State Management
The Save button is disabled when:
- Name is empty
- Address/NFD field is empty
- NFD is currently being resolved (`isResolvingNFD === true`)
- Address validation fails (`isAddressValid === false`)
- Mutation is in progress (`isMutating === true`)

This ensures users cannot save invalid or incomplete entries.

## Future Enhancements

Possible future improvements:
1. **ANS Support** - Add Aptos Name Service resolution for Aptos addresses
2. **Validation** - Add validation to ensure NFD matches the stored address
3. **Caching** - Cache NFD resolutions to reduce API calls
4. **Reverse Lookup** - Auto-detect if an address has an NFD
5. **Multiple Networks** - Support for other name services (ENS, etc.)

## Troubleshooting

### NFD Not Resolving
**Symptoms:** "⚠ NFD not found" error appears

**Solutions:**
1. Verify the NFD exists at https://app.nf.domains/
2. Ensure it ends with `.algo` (e.g., `alice.algo`)
3. Check browser console for API errors
4. Test the NFD directly: `https://api.nf.domains/nfd/{yourname}.algo?view=tiny`

**Common Issues:**
- Typo in NFD name
- NFD doesn't exist on mainnet
- Network connectivity issues

### Migration Failed
**Symptoms:** Error when running migration script

**Solutions:**
1. Ensure database connection is working
2. Check if column already exists (migration is safe to re-run)
3. Verify DATABASE_URL environment variable
4. Check Sequelize configuration in `backend/src/config/database.js`

### NFD Resolves but Shows Wrong Address
**Issue:** The `depositAccount` field is the correct field to use for NFD resolution

**Note:** The API returns both `owner` and `depositAccount`. We use `depositAccount` which is the receiving address for the NFD.

### Save Button Stays Disabled
**Symptoms:** Cannot click Save even after entering information

**Possible Causes:**
1. **NFD is still resolving** - Wait for "Resolving NFD..." to complete
2. **NFD not found** - See red error message, correct the NFD or use direct address
3. **Invalid address format**:
   - **Algorand**: Must be exactly 58 characters, uppercase letters and numbers (A-Z, 2-7)
   - **Aptos**: Must start with `0x` followed by 1-64 hex characters (0-9, a-f, A-F)
4. **Name field is empty** - Enter a name for the entry

**Solutions:**
- Wait for validation to complete
- Check address format matches the expected pattern for your network
- If using NFD, ensure it resolves successfully (green checkmark appears)

## Resources

- [NFD Official Documentation](https://docs.nf.domains/)
- [NFD API Reference](https://api.nf.domains/)
- [Algorand Name Service](https://nf.domains/)

