# Route Types Setup

This guide explains how to set up and manage route types in the Waypoint backend.

## Database Setup

### 1. Run Migrations

First, run the migrations to create the `route_types` table:

```bash
cd backend
npm run migrate
# or
node src/migrations/run-migrations.js
```

### 2. Seed Route Types

After running migrations, seed the initial route types:

```bash
node src/seeders/seed-route-types.js
```

This will create the following route types:

**Aptos Network:**
- ✅ Simple Transfer Over Time (enabled)
- ✅ Milestone Routes (enabled)
- ❌ Cliff Based Vesting (disabled)
- ❌ Advanced Routes (disabled)

**Algorand Network:**
- ❌ Simple Transfer Over Time (disabled)
- ❌ Milestone Routes (disabled)
- ❌ Cliff Based Vesting (disabled)
- ❌ Advanced Routes (disabled)

## API Endpoints

### Get All Route Types
```bash
GET /api/route-types
GET /api/route-types?network=aptos
GET /api/route-types?network=algorand
```

### Get Enabled Route Types Only
```bash
GET /api/route-types/enabled
GET /api/route-types/enabled?network=aptos
GET /api/route-types/enabled?network=algorand
```

### Toggle Route Type Status
```bash
PATCH /api/route-types/:id/toggle
```

Example:
```bash
curl -X PATCH http://localhost:3001/api/route-types/1/toggle
```

### Update Route Type
```bash
PATCH /api/route-types/:id
Content-Type: application/json

{
  "enabled": true,
  "module_name": "new_module_name",
  "contract_address": "0x123..."
}
```

## Managing Route Types

### Enabling a Route Type for Algorand

When you're ready to enable route types for Algorand:

1. Update the contract address (app ID):
```bash
curl -X PATCH http://localhost:3001/api/route-types/5 \
  -H "Content-Type: application/json" \
  -d '{
    "contract_address": "123456789",
    "enabled": true
  }'
```

2. The frontend will automatically show the enabled route types based on the selected network.

### Adding a New Route Type

To add a new route type, modify `src/seeders/seed-route-types.js` and add the new route type configuration, then run:

```bash
node src/seeders/seed-route-types.js
```

The seeder uses `upsert`, so it will update existing entries and create new ones.

## Database Schema

The `route_types` table has the following structure:

```sql
CREATE TABLE route_types (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  route_type_id VARCHAR(50) NOT NULL,          -- e.g., "simple-transfer", "milestone-routes"
  display_name VARCHAR(100) NOT NULL,           -- e.g., "Simple Transfer Over Time"
  description TEXT NOT NULL,
  network ENUM('aptos', 'algorand') NOT NULL,
  module_name VARCHAR(100),                     -- e.g., "linear_stream_fa", "milestone_stream_fa"
  contract_address VARCHAR(255),                -- Hex for Aptos, numeric for Algorand
  enabled BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  UNIQUE(route_type_id, network)
);
```

## Frontend Integration

The frontend automatically fetches enabled route types from the API based on the selected network:

```typescript
// In RouteCreationModal.tsx
const { data: routeTypes } = useRouteTypes(networkName);
```

The modal will only show route types that are:
1. Available for the selected network (Aptos or Algorand)
2. Enabled in the database (`enabled = true`)

## Notes

- Route types are network-specific (Aptos vs Algorand)
- The same route type ID can exist for both networks with different configurations
- The frontend uses the `module_name` from the database when creating routes on Aptos
- For Algorand, you'll store the app ID in the `contract_address` field

