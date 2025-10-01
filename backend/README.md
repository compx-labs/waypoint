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

## Database Schema

### Tokens Table
- id, symbol, name, logo_url, network, contract_address, decimals

### Routes Table
- id, sender, recipient, token_id, amount_token_units
- start_date, payment_frequency_unit, payment_frequency_number
- blockchain_tx_hash, status

## Production Deployment

1. Set `NODE_ENV=production`
2. Use proper DATABASE_URL from Supabase
3. Configure FRONTEND_URL for CORS
4. Deploy to Digital Ocean App Platform or similar

