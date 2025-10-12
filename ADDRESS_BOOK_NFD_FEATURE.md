# Address Book NFD Support

This document describes the NFD (Algorand Name Service) support added to the Waypoint Address Book feature.

## Overview

The Address Book now supports storing NFDs (e.g., `alice.algo`) alongside wallet addresses. When users enter an NFD in the shortname field, it automatically resolves to the corresponding Algorand wallet address.

## Features

### 1. **NFD Auto-Resolution**
- When a user types an NFD ending in `.algo` in the shortname field
- The system automatically resolves it to the corresponding Algorand address
- Resolution happens with a 500ms debounce to avoid excessive API calls
- A "Resolving NFD..." indicator shows during the resolution process

### 2. **Shortname Storage**
- Any shortname (not just NFDs) can be stored
- The `shortname` field is optional
- Useful for storing memorable names like "alice.algo" instead of long addresses

### 3. **Display Enhancement**
- Address book entries show three lines of information:
  1. **Name** (user-defined label in white)
  2. **Shortname** (NFD or custom shortname in sunset orange) - optional
  3. **Wallet Address** (full address in gray monospace font)

### 4. **Cross-Blockchain Support**
- While NFD resolution is specific to Algorand, the shortname field works for any blockchain
- Users can store any shortname for Aptos addresses as well

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
The system uses the official NFD API:
```
https://api.nf.domains/nfd/lookup?name={nfdName}&view=brief
```

### Resolution Logic
1. User types in shortname field
2. System checks if it ends with `.algo`
3. If yes, waits 500ms (debounce)
4. Calls NFD API to resolve the name
5. If successful, auto-fills the wallet address field
6. Shows "Resolving NFD..." indicator during lookup

### Example NFD Resolution
```javascript
// Input
shortname: "alice.algo"

// API Response
{
  "depositAccount": "ALGORAND_ADDRESS_HERE",
  // ... other NFD data
}

// Result
wallet_address: "ALGORAND_ADDRESS_HERE" (auto-filled)
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
   - **NFD/Shortname:** "alice.algo" (optional)
   - **Wallet Address:** (auto-filled after NFD resolves)
4. Click "Save"

### Example 2: Adding Without NFD
1. Open Address Book
2. Click "Add New Address"
3. Enter:
   - **Name:** "Bob's Wallet" (required)
   - **NFD/Shortname:** (leave empty)
   - **Wallet Address:** "ALGORAND_ADDRESS_HERE" (manual entry)
4. Click "Save"

### Example 3: Using Custom Shortname (Non-NFD)
1. Open Address Book
2. Click "Add New Address"
3. Enter:
   - **Name:** "Carol" (required)
   - **NFD/Shortname:** "carol-test" (optional, won't auto-resolve)
   - **Wallet Address:** "ALGORAND_ADDRESS_HERE" (manual entry)
4. Click "Save"

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
const resolveNFD = async (nfdName: string): Promise<string | null> => {
  if (!nfdName || !nfdName.endsWith('.algo')) {
    return null;
  }

  try {
    setIsResolvingNFD(true);
    const response = await fetch(
      `https://api.nf.domains/nfd/lookup?name=${encodeURIComponent(nfdName)}&view=brief`
    );
    const data = await response.json();
    
    if (data && data.depositAccount) {
      return data.depositAccount;
    }
    return null;
  } catch (error) {
    console.error('Failed to resolve NFD:', error);
    return null;
  } finally {
    setIsResolvingNFD(false);
  }
};
```

## Future Enhancements

Possible future improvements:
1. **ANS Support** - Add Aptos Name Service resolution for Aptos addresses
2. **Validation** - Add validation to ensure NFD matches the stored address
3. **Caching** - Cache NFD resolutions to reduce API calls
4. **Reverse Lookup** - Auto-detect if an address has an NFD
5. **Multiple Networks** - Support for other name services (ENS, etc.)

## Troubleshooting

### NFD Not Resolving
- Check if the NFD actually exists at https://app.nf.domains/
- Ensure it ends with `.algo`
- Check browser console for API errors

### Migration Failed
- Ensure database connection is working
- Check if column already exists
- Verify Sequelize configuration

### UI Not Showing Shortname Field
- Clear browser cache
- Check browser console for errors
- Verify TypeScript types are updated

## Resources

- [NFD Official Documentation](https://docs.nf.domains/)
- [NFD API Reference](https://api.nf.domains/)
- [Algorand Name Service](https://nf.domains/)

