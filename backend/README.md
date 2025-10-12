# Waypoint Backend API

Node.js + Express + Sequelize backend for Waypoint token routing.

## Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Configure environment:**
```bash
cp .env.example .env
# Edit .env with your Supabase credentials
```

3. **Run migrations:**
```bash
npm run migrate
```

**Optional: Add shortname column to existing address_book table:**
```bash
node src/migrations/add-shortname-to-address-book.js
```

4. **Seed token data:**
```bash
npm run seed
```

5. **Start development server:**
```bash
npm run dev
```

## API Endpoints

### Tokens
- `GET /api/tokens` - List all supported tokens
- `GET /api/tokens/:id` - Get single token

### Routes
- `GET /api/routes` - List routes (filters: sender, token_id, status)
- `GET /api/routes/:id` - Get single route
- `POST /api/routes` - Create new route
- `PATCH /api/routes/:id` - Update route status

### Analytics
- `GET /api/analytics` - Get overall analytics
- `GET /api/analytics/:network` - Get network-specific analytics

### Address Book
- `GET /api/address-book?owner_wallet=ADDRESS` - List all address book entries for a wallet
- `GET /api/address-book/:id` - Get single address book entry
- `POST /api/address-book` - Create new address book entry
- `PUT /api/address-book/:id` - Update address book entry
- `DELETE /api/address-book/:id` - Delete address book entry

## Database Schema

### Tokens Table
- id, symbol, name, logo_url, network, contract_address, decimals

### Routes Table
- id, sender, recipient, token_id, amount_token_units
- start_date, payment_frequency_unit, payment_frequency_number
- blockchain_tx_hash, status

### Address Book Table
- id, owner_wallet, name, wallet_address
- shortname (optional - stores NFDs and other blockchain shortnames)
- created_at, updated_at

## Production Deployment

1. Set `NODE_ENV=production`
2. Use proper DATABASE_URL from Supabase
3. Configure FRONTEND_URL for CORS
4. Deploy to Digital Ocean App Platform or similar

