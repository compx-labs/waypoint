/**
 * Waypoint SDK React Example - Invoice Routes
 * 
 * This example demonstrates how to use the Waypoint SDK for invoice routes
 * in a React application with the Petra wallet (or any Aptos wallet adapter).
 * 
 * Invoice routes support two patterns:
 * 1. Two-phase: Beneficiary creates invoice → Payer funds later
 * 2. Single-phase: Creator funds immediately upon creation
 * 
 * Prerequisites:
 * - Install: npm install @aptos-labs/wallet-adapter-react @aptos-labs/wallet-adapter-ant-design
 * - Wrap your app with WalletProvider
 */

import React, { useState, useEffect } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';
import { AptosWaypointClient, InvoiceRouteDetails } from '../src';

export function WaypointInvoiceExample() {
  const { account, signAndSubmitTransaction, connected } = useWallet();
  const [waypoint, setWaypoint] = useState<AptosWaypointClient | null>(null);
  const [routes, setRoutes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'create' | 'fund' | 'view'>('view');

  // Form state for creating invoices
  const [invoiceForm, setInvoiceForm] = useState({
    payer: '',
    beneficiary: '',
    tokenMetadata: '',
    amount: '',
    startTimestamp: Math.floor(Date.now() / 1000),
    periodSeconds: 2592000, // 30 days
    payoutAmount: '',
    maxPeriods: '10',
  });

  // Initialize Waypoint SDK
  useEffect(() => {
    const client = new AptosWaypointClient({
      network: 'testnet', // or 'mainnet'
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
   * Load all invoice routes
   */
  const loadRoutes = async () => {
    if (!waypoint) return;

    try {
      setLoading(true);
      const invoiceRoutes = await waypoint.listInvoiceRoutes();
      setRoutes(invoiceRoutes);
    } catch (error) {
      console.error('Error loading routes:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Create a new invoice (two-phase: create then fund)
   */
  const createInvoice = async () => {
    if (!waypoint || !account) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      setLoading(true);

      const amount = BigInt(invoiceForm.amount);
      const payoutAmount = BigInt(invoiceForm.payoutAmount);

      // Build the transaction using Waypoint SDK
      const transaction = await waypoint.buildCreateInvoiceTransaction({
        beneficiary: account.address,
        payer: invoiceForm.payer,
        tokenMetadata: invoiceForm.tokenMetadata,
        amount,
        startTimestamp: invoiceForm.startTimestamp,
        periodSeconds: invoiceForm.periodSeconds,
        payoutAmount,
        maxPeriods: parseInt(invoiceForm.maxPeriods),
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

      alert('Invoice created successfully! Payer can now fund it.');

      // Reset form
      setInvoiceForm({
        payer: '',
        beneficiary: account.address,
        tokenMetadata: '',
        amount: '',
        startTimestamp: Math.floor(Date.now() / 1000),
        periodSeconds: 2592000,
        payoutAmount: '',
        maxPeriods: '10',
      });

      setMode('view');
      await loadRoutes();
    } catch (error) {
      console.error('Error creating invoice:', error);
      alert('Failed to create invoice: ' + error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Create and fund invoice in one transaction (single-phase)
   */
  const createAndFundInvoice = async () => {
    if (!waypoint || !account) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      setLoading(true);

      const amount = BigInt(invoiceForm.amount);
      const payoutAmount = BigInt(invoiceForm.payoutAmount);

      // Build the transaction using Waypoint SDK
      const transaction = await waypoint.buildCreateRouteAndFundTransaction({
        creator: account.address,
        beneficiary: invoiceForm.beneficiary || account.address,
        tokenMetadata: invoiceForm.tokenMetadata,
        amount,
        startTimestamp: invoiceForm.startTimestamp,
        periodSeconds: invoiceForm.periodSeconds,
        payoutAmount,
        maxPeriods: parseInt(invoiceForm.maxPeriods),
      });

      // Sign and submit with wallet
      const response = await signAndSubmitTransaction({
        sender: account.address,
        data: transaction,
      });

      console.log('Transaction submitted:', response.hash);

      // Wait for confirmation
      const aptos = waypoint.getAptosClient();
      await aptos.waitForTransaction({ transactionHash: response.hash });

      alert('Invoice created and funded successfully!');

      setMode('view');
      await loadRoutes();
    } catch (error) {
      console.error('Error creating and funding invoice:', error);
      alert('Failed to create invoice: ' + error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fund an existing invoice (as payer)
   */
  const fundInvoice = async (routeAddress: string) => {
    if (!waypoint || !account) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      setLoading(true);

      // Build fund transaction
      const transaction = await waypoint.buildFundInvoiceTransaction({
        payer: account.address,
        routeAddress,
      });

      // Sign and submit with wallet
      const response = await signAndSubmitTransaction({
        sender: account.address,
        data: transaction,
      });

      console.log('Fund transaction submitted:', response.hash);

      // Wait for confirmation
      const aptos = waypoint.getAptosClient();
      await aptos.waitForTransaction({ transactionHash: response.hash });

      alert('Invoice funded successfully!');

      await loadRoutes();
    } catch (error) {
      console.error('Error funding invoice:', error);
      alert('Failed to fund invoice: ' + error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Claim from an invoice route (as beneficiary)
   */
  const claimFromRoute = async (routeAddress: string) => {
    if (!waypoint || !account) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      setLoading(true);

      // Check claimable amount first
      const claimable = await waypoint.getInvoiceClaimableAmount(routeAddress);
      if (claimable === 0n) {
        alert('No tokens available to claim yet');
        return;
      }

      // Build claim transaction
      const transaction = await waypoint.buildClaimInvoiceTransaction({
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
      <div className="waypoint-invoice-example">
        <h2>Waypoint Invoice SDK Example</h2>
        <p>Please connect your wallet to continue</p>
      </div>
    );
  }

  return (
    <div className="waypoint-invoice-example">
      <h2>Waypoint Invoice SDK Example</h2>
      <p>Connected: {account?.address}</p>

      <div className="mode-selector">
        <button 
          onClick={() => setMode('view')} 
          className={mode === 'view' ? 'active' : ''}
        >
          View Routes
        </button>
        <button 
          onClick={() => setMode('create')} 
          className={mode === 'create' ? 'active' : ''}
        >
          Create Invoice
        </button>
        <button 
          onClick={() => setMode('fund')} 
          className={mode === 'fund' ? 'active' : ''}
        >
          Create & Fund
        </button>
      </div>

      {mode === 'create' && (
        <div className="create-invoice-form">
          <h3>Create Invoice (Two-Phase)</h3>
          <p>Beneficiary creates invoice, payer funds later</p>
          
          <div className="form-group">
            <label>Payer Address:</label>
            <input
              type="text"
              value={invoiceForm.payer}
              onChange={(e) => setInvoiceForm({ ...invoiceForm, payer: e.target.value })}
              placeholder="0x..."
            />
          </div>

          <div className="form-group">
            <label>Token Metadata Address:</label>
            <input
              type="text"
              value={invoiceForm.tokenMetadata}
              onChange={(e) => setInvoiceForm({ ...invoiceForm, tokenMetadata: e.target.value })}
              placeholder="0x1::aptos_coin::AptosCoin"
            />
          </div>

          <div className="form-group">
            <label>Invoice Amount (smallest units):</label>
            <input
              type="text"
              value={invoiceForm.amount}
              onChange={(e) => setInvoiceForm({ ...invoiceForm, amount: e.target.value })}
              placeholder="1000000000"
            />
          </div>

          <div className="form-group">
            <label>Payout Amount per Period:</label>
            <input
              type="text"
              value={invoiceForm.payoutAmount}
              onChange={(e) => setInvoiceForm({ ...invoiceForm, payoutAmount: e.target.value })}
              placeholder="100000000"
            />
          </div>

          <div className="form-group">
            <label>Max Periods:</label>
            <input
              type="number"
              value={invoiceForm.maxPeriods}
              onChange={(e) => setInvoiceForm({ ...invoiceForm, maxPeriods: e.target.value })}
            />
          </div>

          <button onClick={createInvoice} disabled={loading}>
            {loading ? 'Processing...' : 'Create Invoice'}
          </button>
        </div>
      )}

      {mode === 'fund' && (
        <div className="create-fund-form">
          <h3>Create & Fund Invoice (Single-Phase)</h3>
          <p>Create and fund immediately in one transaction</p>
          
          <div className="form-group">
            <label>Beneficiary Address:</label>
            <input
              type="text"
              value={invoiceForm.beneficiary}
              onChange={(e) => setInvoiceForm({ ...invoiceForm, beneficiary: e.target.value })}
              placeholder={account.address}
            />
          </div>

          <div className="form-group">
            <label>Token Metadata Address:</label>
            <input
              type="text"
              value={invoiceForm.tokenMetadata}
              onChange={(e) => setInvoiceForm({ ...invoiceForm, tokenMetadata: e.target.value })}
              placeholder="0x1::aptos_coin::AptosCoin"
            />
          </div>

          <div className="form-group">
            <label>Invoice Amount (smallest units):</label>
            <input
              type="text"
              value={invoiceForm.amount}
              onChange={(e) => setInvoiceForm({ ...invoiceForm, amount: e.target.value })}
              placeholder="1000000000"
            />
          </div>

          <div className="form-group">
            <label>Payout Amount per Period:</label>
            <input
              type="text"
              value={invoiceForm.payoutAmount}
              onChange={(e) => setInvoiceForm({ ...invoiceForm, payoutAmount: e.target.value })}
              placeholder="100000000"
            />
          </div>

          <div className="form-group">
            <label>Max Periods:</label>
            <input
              type="number"
              value={invoiceForm.maxPeriods}
              onChange={(e) => setInvoiceForm({ ...invoiceForm, maxPeriods: e.target.value })}
            />
          </div>

          <button onClick={createAndFundInvoice} disabled={loading}>
            {loading ? 'Processing...' : 'Create & Fund Invoice'}
          </button>
        </div>
      )}

      {mode === 'view' && (
        <>
          <div className="actions">
            <button onClick={loadRoutes} disabled={loading}>
              Refresh Routes
            </button>
          </div>

          <div className="routes">
            <h3>Invoice Routes ({routes.length})</h3>
            {loading && <p>Loading...</p>}
            {routes.length === 0 && !loading && <p>No routes found</p>}
            {routes.map((routeAddress) => (
              <InvoiceRouteCard
                key={routeAddress}
                routeAddress={routeAddress}
                waypoint={waypoint!}
                currentAccount={account!.address}
                onFund={() => fundInvoice(routeAddress)}
                onClaim={() => claimFromRoute(routeAddress)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Component to display a single invoice route
 */
function InvoiceRouteCard({
  routeAddress,
  waypoint,
  currentAccount,
  onFund,
  onClaim,
}: {
  routeAddress: string;
  waypoint: AptosWaypointClient;
  currentAccount: string;
  onFund: () => void;
  onClaim: () => void;
}) {
  const [details, setDetails] = useState<InvoiceRouteDetails | null>(null);
  const [claimable, setClaimable] = useState<bigint>(0n);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDetails();
  }, [routeAddress]);

  const loadDetails = async () => {
    try {
      setLoading(true);
      const routeDetails = await waypoint.getInvoiceRouteDetails(routeAddress);
      const claimableAmount = await waypoint.getInvoiceClaimableAmount(routeAddress);
      setDetails(routeDetails);
      setClaimable(claimableAmount);
    } catch (error) {
      console.error('Error loading route details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="invoice-route-card">Loading route...</div>;
  }

  if (!details) {
    return <div className="invoice-route-card">Failed to load route</div>;
  }

  const isPayer = details.payer.toLowerCase() === currentAccount.toLowerCase();
  const isBeneficiary = details.beneficiary.toLowerCase() === currentAccount.toLowerCase();
  const canFund = isPayer && !details.funded;
  const canClaim = isBeneficiary && details.funded && claimable > 0n;

  return (
    <div className="invoice-route-card">
      <h4>Route: {routeAddress.slice(0, 10)}...</h4>
      <div className="route-info">
        <p><strong>Payer:</strong> {details.payer.slice(0, 10)}...</p>
        <p><strong>Beneficiary:</strong> {details.beneficiary.slice(0, 10)}...</p>
        <p><strong>Status:</strong> {details.funded ? '✅ Funded' : '⏳ Pending'}</p>
        <p><strong>Requested:</strong> {details.requestedAmount.toString()}</p>
        <p><strong>Deposit:</strong> {details.depositAmount.toString()}</p>
        <p><strong>Fee:</strong> {details.feeAmount.toString()}</p>
        <p><strong>Claimed:</strong> {details.claimedAmount.toString()}</p>
        <p><strong>Claimable:</strong> {claimable.toString()}</p>
      </div>
      <div className="route-actions">
        {canFund && (
          <button onClick={onFund} className="fund-button">
            Fund Invoice
          </button>
        )}
        {canClaim && (
          <button onClick={onClaim} className="claim-button">
            Claim {claimable.toString()}
          </button>
        )}
        {!canFund && !canClaim && (
          <span className="no-action">No actions available</span>
        )}
      </div>
    </div>
  );
}

export default WaypointInvoiceExample;

