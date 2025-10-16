/**
 * Waypoint SDK React Example
 * 
 * This example demonstrates how to use the Waypoint SDK in a React application
 * with the Petra wallet (or any Aptos wallet adapter).
 * 
 * Prerequisites:
 * - Install: npm install @aptos-labs/wallet-adapter-react @aptos-labs/wallet-adapter-ant-design
 * - Wrap your app with WalletProvider
 */

import React, { useState, useEffect } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';
import { AptosWaypointClient } from '../src';

export function WaypointExample() {
  const { account, signAndSubmitTransaction, connected } = useWallet();
  const [waypoint, setWaypoint] = useState<AptosWaypointClient | null>(null);
  const [routes, setRoutes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Initialize Waypoint SDK
  useEffect(() => {
    const client = new AptosWaypointClient({
      network: 'mainnet', // or 'testnet'
      backendUrl: process.env.REACT_APP_BACKEND_URL,
    });
    setWaypoint(client);
  }, []);

  // Load routes when connected
  useEffect(() => {
    if (connected && waypoint) {
      loadRoutes();
    }
  }, [connected, waypoint]);

  /**
   * Load all linear routes
   */
  const loadRoutes = async () => {
    if (!waypoint) return;

    try {
      setLoading(true);
      const linearRoutes = await waypoint.listLinearRoutes();
      setRoutes(linearRoutes);
    } catch (error) {
      console.error('Error loading routes:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Create a new linear route
   */
  const createRoute = async () => {
    if (!waypoint || !account) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      setLoading(true);

      // Build the transaction using Waypoint SDK
      const transaction = await waypoint.buildCreateLinearRouteTransaction({
        sender: account.address,
        beneficiary: '0x123...', // Replace with actual recipient
        tokenMetadata: '0xabc...', // Replace with actual token metadata address
        amount: 1000_000000n, // 1000 tokens
        startTimestamp: Math.floor(Date.now() / 1000),
        periodSeconds: 2592000, // 30 days
        payoutAmount: 100_000000n, // 100 tokens per period
        maxPeriods: 10,
      });

      // Sign and submit with wallet
      const response = await signAndSubmitTransaction({
        sender: account.address,
        data: transaction,
      });

      console.log('Transaction submitted:', response.hash);

      // Wait for confirmation using Aptos SDK
      const aptos = waypoint.getAptosClient();
      await aptos.waitForTransaction({ transactionHash: response.hash });

      alert('Route created successfully!');

      // Optionally register with backend
      try {
        await waypoint.registerRouteWithBackend({
          sender: account.address,
          recipient: '0x123...',
          tokenId: 1,
          amountTokenUnits: '1000000000',
          amountPerPeriodTokenUnits: '100000000',
          startDate: new Date(),
          paymentFrequencyUnit: 'months',
          paymentFrequencyNumber: 1,
          blockchainTxHash: response.hash,
          routeObjAddress: '0xroute...', // Parse from events
          routeType: 'simple',
        });
        console.log('Route registered with backend');
      } catch (error) {
        console.log('Backend registration failed (optional):', error);
      }

      // Reload routes
      await loadRoutes();
    } catch (error) {
      console.error('Error creating route:', error);
      alert('Failed to create route: ' + error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Claim from a route
   */
  const claimFromRoute = async (routeAddress: string) => {
    if (!waypoint || !account) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      setLoading(true);

      // Check claimable amount first
      const claimable = await waypoint.getLinearClaimableAmount(routeAddress);
      if (claimable === 0n) {
        alert('No tokens available to claim yet');
        return;
      }

      // Build claim transaction
      const transaction = await waypoint.buildClaimLinearTransaction({
        caller: account.address,
        routeAddress,
      });

      // Sign and submit with wallet
      const response = await signAndSubmitTransaction({
        sender: account.address,
        data: transaction,
      });

      console.log('Claim transaction submitted:', response.hash);

      // Wait for confirmation
      const aptos = waypoint.getAptosClient();
      await aptos.waitForTransaction({ transactionHash: response.hash });

      alert(`Successfully claimed ${claimable} tokens!`);

      // Reload routes
      await loadRoutes();
    } catch (error) {
      console.error('Error claiming:', error);
      alert('Failed to claim: ' + error);
    } finally {
      setLoading(false);
    }
  };

  if (!connected) {
    return (
      <div className="waypoint-example">
        <h2>Waypoint SDK Example</h2>
        <p>Please connect your wallet to continue</p>
      </div>
    );
  }

  return (
    <div className="waypoint-example">
      <h2>Waypoint SDK Example</h2>
      <p>Connected: {account?.address}</p>

      <div className="actions">
        <button onClick={createRoute} disabled={loading}>
          {loading ? 'Processing...' : 'Create Route'}
        </button>
        <button onClick={loadRoutes} disabled={loading}>
          Refresh Routes
        </button>
      </div>

      <div className="routes">
        <h3>Your Routes ({routes.length})</h3>
        {loading && <p>Loading...</p>}
        {routes.length === 0 && !loading && <p>No routes found</p>}
        {routes.map((routeAddress) => (
          <RouteCard
            key={routeAddress}
            routeAddress={routeAddress}
            waypoint={waypoint!}
            onClaim={() => claimFromRoute(routeAddress)}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Component to display a single route
 */
function RouteCard({
  routeAddress,
  waypoint,
  onClaim,
}: {
  routeAddress: string;
  waypoint: AptosWaypointClient;
  onClaim: () => void;
}) {
  const [details, setDetails] = useState<any>(null);
  const [claimable, setClaimable] = useState<bigint>(0n);

  useEffect(() => {
    loadDetails();
  }, [routeAddress]);

  const loadDetails = async () => {
    try {
      const routeDetails = await waypoint.getLinearRouteDetails(routeAddress);
      const claimableAmount = await waypoint.getLinearClaimableAmount(routeAddress);
      setDetails(routeDetails);
      setClaimable(claimableAmount);
    } catch (error) {
      console.error('Error loading route details:', error);
    }
  };

  if (!details) {
    return <div>Loading route...</div>;
  }

  return (
    <div className="route-card">
      <h4>Route: {routeAddress.slice(0, 10)}...</h4>
      <p>Beneficiary: {details.beneficiary.slice(0, 10)}...</p>
      <p>Deposit: {details.depositAmount.toString()}</p>
      <p>Claimed: {details.claimedAmount.toString()}</p>
      <p>Claimable: {claimable.toString()}</p>
      <button onClick={onClaim} disabled={claimable === 0n}>
        Claim
      </button>
    </div>
  );
}

export default WaypointExample;

