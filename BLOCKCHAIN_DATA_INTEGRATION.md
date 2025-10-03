# Blockchain Data Integration

This document explains how to fetch real-time data from the Aptos blockchain for Waypoint routes.

## Overview

The `AptosContext` now provides two methods for fetching route data directly from the blockchain:

1. **`getRouteCore(routeObjAddress)`** - Fetch detailed data for a specific route
2. **`listAllRoutes()`** - Fetch all route addresses created on the blockchain

## Usage

### 1. Import the Context Hook

```typescript
import { useAptos } from '../contexts/AptosContext';
```

### 2. Access the Functions

```typescript
const { getRouteCore, listAllRoutes } = useAptos();
```

## Examples

### Fetching Individual Route Data

Use this to get real-time claimable amounts and route status from the blockchain:

```typescript
import React, { useEffect, useState } from "react";
import { useAptos, type RouteCore } from "../contexts/AptosContext";

function RouteDetails({ routeObjAddress }: { routeObjAddress: string }) {
  const { getRouteCore } = useAptos();
  const [routeData, setRouteData] = useState<RouteCore | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const data = await getRouteCore(routeObjAddress);
      setRouteData(data);
      setLoading(false);
    }
    
    if (routeObjAddress) {
      fetchData();
    }
  }, [routeObjAddress, getRouteCore]);

  if (loading) return <div>Loading route data...</div>;
  if (!routeData) return <div>Route not found</div>;

  // Calculate claimable amount
  const totalDeposited = BigInt(routeData.deposit_amount);
  const alreadyClaimed = BigInt(routeData.claimed_amount);
  const remaining = totalDeposited - alreadyClaimed;

  return (
    <div>
      <h3>Route Details (Live from Chain)</h3>
      <div>Depositor: {routeData.depositor}</div>
      <div>Beneficiary: {routeData.beneficiary}</div>
      <div>Start Time: {new Date(Number(routeData.start_timestamp) * 1000).toLocaleString()}</div>
      <div>Period (seconds): {routeData.period_seconds}</div>
      <div>Payout per Period: {routeData.payout_amount}</div>
      <div>Max Periods: {routeData.max_periods}</div>
      <div>Total Deposited: {routeData.deposit_amount}</div>
      <div>Already Claimed: {routeData.claimed_amount}</div>
      <div>Remaining: {remaining.toString()}</div>
    </div>
  );
}

export default RouteDetails;
```

### Fetching All Routes

Use this for analytics or to discover all routes on the blockchain:

```typescript
import React, { useEffect, useState } from "react";
import { useAptos } from "../contexts/AptosContext";

function AllRoutesAnalytics() {
  const { listAllRoutes } = useAptos();
  const [routes, setRoutes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAllRoutes() {
      setLoading(true);
      const allRoutes = await listAllRoutes();
      if (allRoutes) {
        setRoutes(allRoutes);
      }
      setLoading(false);
    }
    
    fetchAllRoutes();
  }, [listAllRoutes]);

  if (loading) return <div>Loading all routes...</div>;

  return (
    <div>
      <h3>All Routes on Chain</h3>
      <p>Total Routes: {routes.length}</p>
      <ul>
        {routes.map((routeAddress) => (
          <li key={routeAddress}>
            {routeAddress}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AllRoutesAnalytics;
```

### Combining Database and Blockchain Data

For the best user experience, combine database data (fast) with blockchain data (authoritative):

```typescript
import React, { useEffect, useState } from "react";
import { useAptos, type RouteCore } from "../contexts/AptosContext";
import { useRoutes } from "../hooks/useQueries";

function EnhancedRoutesList() {
  const { data: dbRoutes } = useRoutes();
  const { getRouteCore } = useAptos();
  const [enrichedRoutes, setEnrichedRoutes] = useState<Map<number, RouteCore>>(new Map());

  useEffect(() => {
    async function enrichWithChainData() {
      if (!dbRoutes) return;

      const enriched = new Map<number, RouteCore>();
      
      // Fetch blockchain data for each route
      for (const route of dbRoutes) {
        if (route.blockchain_tx_hash) {
          // In real implementation, you'd need to extract route_obj_address from the transaction
          // For now, assuming it's stored somewhere accessible
          const chainData = await getRouteCore(route.blockchain_tx_hash);
          if (chainData) {
            enriched.set(route.id, chainData);
          }
        }
      }
      
      setEnrichedRoutes(enriched);
    }

    enrichWithChainData();
  }, [dbRoutes, getRouteCore]);

  return (
    <div>
      {dbRoutes?.map((route) => {
        const chainData = enrichedRoutes.get(route.id);
        return (
          <div key={route.id}>
            <h4>{route.token.symbol} Route</h4>
            <div>DB Amount: {route.amount_token_units}</div>
            {chainData && (
              <>
                <div>Chain Deposit: {chainData.deposit_amount}</div>
                <div>Chain Claimed: {chainData.claimed_amount}</div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default EnhancedRoutesList;
```

## RouteCore Type

```typescript
export interface RouteCore {
  route_obj_address: string;    // The route's object address on chain
  depositor: string;             // Who created and funded the route
  beneficiary: string;           // Who can claim from the route
  start_timestamp: string;       // Unix timestamp when route starts
  period_seconds: string;        // Duration of each unlock period
  payout_amount: string;         // Amount unlocked per period
  max_periods: string;           // Maximum number of periods
  deposit_amount: string;        // Total amount deposited (u128 as string)
  claimed_amount: string;        // Amount already claimed (u128 as string)
}
```

## Performance Considerations

### For Individual Routes (`getRouteCore`)
- **Use case**: Display real-time claimable amounts, verify route status
- **Performance**: Fast, single blockchain view call
- **Recommendation**: Use on-demand when viewing route details

### For All Routes (`listAllRoutes`)
- **Use case**: Analytics, discovering all routes
- **Performance**: Fast for the list, but may need many follow-up calls for details
- **Recommendation**: 
  - Use sparingly, cache results
  - Consider implementing in backend for large-scale analytics
  - For user-facing features, stick to database queries filtered by user

## Integration Checklist

- [x] Add `getRouteCore` function to AptosContext
- [x] Add `listAllRoutes` function to AptosContext
- [x] Export `RouteCore` type
- [ ] Update route cards to show real-time claimable amounts
- [ ] Add "Refresh from Chain" button for route details
- [ ] Implement analytics using `listAllRoutes` (consider backend)
- [ ] Store route object address in database for easy lookup
- [ ] Add loading states for blockchain data fetching

## Next Steps

1. **Update Route Storage**: Modify the database to store the `route_obj_address` returned from the blockchain transaction
2. **Add Claimable Amount Display**: Use `getRouteCore` to show real-time claimable amounts
3. **Implement Claim Functionality**: Create a claim button that calls the smart contract's `claim` function
4. **Analytics Dashboard**: Use `listAllRoutes` to build comprehensive analytics (consider backend implementation)

