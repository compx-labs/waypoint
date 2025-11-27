/**
 * Waypoint SDK - Algorand React Example
 *
 * This example shows how to integrate the Waypoint SDK with a React application
 * using Algorand wallet adapters (like Pera, Defly, etc.)
 */

import React, { useState, useEffect } from 'react';
import { 
  AlgorandWaypointClient, 
  InvoiceRouteStatus,
  type AlgorandRouteDetails,
  type AlgorandInvoiceRouteDetails,
} from '@compx/waypoint-sdk';
import algosdk from 'algosdk';

// Example: Using PeraWalletConnect (install: npm i @perawallet/connect)
// import { PeraWalletConnect } from '@perawallet/connect';

// Or WalletConnect-compatible providers
// import { DeflyWalletConnect } from '@blockshake/defly-connect';

function AlgorandWaypointExample() {
  // Wallet state
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);

  // Waypoint SDK client
  const [client] = useState(() => 
    new AlgorandWaypointClient({
      network: 'testnet', // or 'mainnet'
    })
  );

  // Route state
  const [routes, setRoutes] = useState<string[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<AlgorandRouteDetails | null>(null);
  const [claimableAmount, setClaimableAmount] = useState<bigint>(0n);

  // Invoice state
  const [invoiceAppId, setInvoiceAppId] = useState<string>('');
  const [invoiceDetails, setInvoiceDetails] = useState<AlgorandInvoiceRouteDetails | null>(null);

  // UI state
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState('');

  // ============================================================================
  // Wallet Connection (simplified - use your actual wallet adapter)
  // ============================================================================

  const connectWallet = async () => {
    // Example with PeraWallet:
    // const peraWallet = new PeraWalletConnect();
    // const accounts = await peraWallet.connect();
    // setWalletAddress(accounts[0]);
    // setIsConnected(true);

    // For this example, we'll simulate:
    const mockAddress = 'YOUR_ALGORAND_ADDRESS';
    setWalletAddress(mockAddress);
    setIsConnected(true);
  };

  const disconnectWallet = () => {
    setWalletAddress('');
    setIsConnected(false);
  };

  // ============================================================================
  // Linear Route Functions
  // ============================================================================

  const createLinearRoute = async () => {
    if (!walletAddress) return;

    setLoading(true);
    try {
      // Get your wallet's transaction signer
      // This depends on your wallet adapter
      const signer: algosdk.TransactionSigner = async (txnGroup, indexesToSign) => {
        // Your wallet adapter's signing method
        // Example: return await peraWallet.signTransaction([txnGroup]);
        throw new Error('Implement wallet signing');
      };

      const result = await client.createLinearRoute({
        sender: walletAddress,
        beneficiary: 'BENEFICIARY_ADDRESS',
        tokenId: 10458941n, // USDC testnet
        depositAmount: 1_000_000000n, // 1,000 USDC
        payoutAmount: 100_000000n, // 100 USDC per period
        startTimestamp: BigInt(Math.floor(Date.now() / 1000)),
        periodSeconds: 2_592_000n, // 30 days
        maxPeriods: 10n,
        signer,
      });

      setTxHash(result.txIds[0]);
      alert(`Linear route created! App ID: ${result.routeAppId}`);
      
      // Refresh routes list
      await fetchRoutes();
    } catch (error) {
      console.error('Error creating route:', error);
      alert('Failed to create route');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoutes = async () => {
    setLoading(true);
    try {
      const allRoutes = await client.listAllRoutes();
      setRoutes(allRoutes);
    } catch (error) {
      console.error('Error fetching routes:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectRoute = async (routeId: string) => {
    setLoading(true);
    try {
      const details = await client.getRouteDetails(BigInt(routeId));
      setSelectedRoute(details);

      if (details) {
        const claimable = await client.calculateClaimableAmount(BigInt(routeId));
        setClaimableAmount(claimable);
      }
    } catch (error) {
      console.error('Error fetching route details:', error);
    } finally {
      setLoading(false);
    }
  };

  const claimFromRoute = async (routeId: string) => {
    if (!walletAddress) return;

    setLoading(true);
    try {
      const signer: algosdk.TransactionSigner = async (txnGroup, indexesToSign) => {
        throw new Error('Implement wallet signing');
      };

      const result = await client.claimFromRoute({
        routeAppId: BigInt(routeId),
        beneficiary: walletAddress,
        signer,
      });

      setTxHash(result.txId);
      alert(`Claimed ${result.claimedAmount} tokens!`);
      
      // Refresh route details
      await selectRoute(routeId);
    } catch (error) {
      console.error('Error claiming:', error);
      alert('Failed to claim');
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // Invoice Route Functions
  // ============================================================================

  const createInvoiceRequest = async () => {
    if (!walletAddress) return;

    setLoading(true);
    try {
      const signer: algosdk.TransactionSigner = async (txnGroup, indexesToSign) => {
        throw new Error('Implement wallet signing');
      };

      const result = await client.createInvoiceRequest({
        requester: walletAddress,
        beneficiary: walletAddress,
        payer: 'PAYER_ADDRESS',
        tokenId: 10458941n,
        grossInvoiceAmount: 5_000_000000n, // $5,000
        payoutAmount: 5_000_000000n,
        startTimestamp: 0n,
        periodSeconds: 1n,
        maxPeriods: 1n,
        signer,
      });

      setInvoiceAppId(result.routeAppId.toString());
      setTxHash(result.txIds[0]);
      alert(`Invoice created! App ID: ${result.routeAppId}`);
    } catch (error) {
      console.error('Error creating invoice:', error);
      alert('Failed to create invoice');
    } finally {
      setLoading(false);
    }
  };

  const fetchInvoiceDetails = async (appId: string) => {
    setLoading(true);
    try {
      const details = await client.getInvoiceRouteDetails(BigInt(appId));
      setInvoiceDetails(details);
    } catch (error) {
      console.error('Error fetching invoice:', error);
    } finally {
      setLoading(false);
    }
  };

  const acceptInvoice = async (appId: string) => {
    if (!walletAddress) return;

    setLoading(true);
    try {
      const signer: algosdk.TransactionSigner = async (txnGroup, indexesToSign) => {
        throw new Error('Implement wallet signing');
      };

      const result = await client.acceptInvoiceRoute({
        routeAppId: BigInt(appId),
        payer: walletAddress,
        signer,
      });

      setTxHash(result.txId);
      alert('Invoice accepted and funded!');
      
      // Refresh invoice details
      await fetchInvoiceDetails(appId);
    } catch (error) {
      console.error('Error accepting invoice:', error);
      alert('Failed to accept invoice');
    } finally {
      setLoading(false);
    }
  };

  const declineInvoice = async (appId: string) => {
    if (!walletAddress) return;

    setLoading(true);
    try {
      const signer: algosdk.TransactionSigner = async (txnGroup, indexesToSign) => {
        throw new Error('Implement wallet signing');
      };

      const result = await client.declineInvoiceRoute({
        routeAppId: BigInt(appId),
        payer: walletAddress,
        signer,
      });

      setTxHash(result.txId);
      alert('Invoice declined');
      
      // Refresh invoice details
      await fetchInvoiceDetails(appId);
    } catch (error) {
      console.error('Error declining invoice:', error);
      alert('Failed to decline invoice');
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>🚀 Waypoint SDK - Algorand Example</h1>

      {/* Wallet Connection */}
      <div style={{ marginBottom: '2rem' }}>
        {!isConnected ? (
          <button onClick={connectWallet} disabled={loading}>
            Connect Wallet
          </button>
        ) : (
          <div>
            <p>Connected: {walletAddress}</p>
            <button onClick={disconnectWallet}>Disconnect</button>
          </div>
        )}
      </div>

      {isConnected && (
        <>
          {/* Linear Routes Section */}
          <section style={{ marginBottom: '3rem' }}>
            <h2>📊 Linear Routes</h2>
            
            <button onClick={createLinearRoute} disabled={loading}>
              Create Linear Route
            </button>
            
            <button onClick={fetchRoutes} disabled={loading} style={{ marginLeft: '1rem' }}>
              Refresh Routes
            </button>

            <div style={{ marginTop: '1rem' }}>
              <h3>Your Routes ({routes.length})</h3>
              {routes.map((route) => (
                <div key={route} style={{ margin: '0.5rem 0' }}>
                  <button onClick={() => selectRoute(route)}>
                    View Route {route}
                  </button>
                </div>
              ))}
            </div>

            {selectedRoute && (
              <div style={{ marginTop: '1rem', padding: '1rem', border: '1px solid #ccc' }}>
                <h3>Route Details</h3>
                <p>Depositor: {selectedRoute.depositor}</p>
                <p>Beneficiary: {selectedRoute.beneficiary}</p>
                <p>Deposit: {selectedRoute.depositAmount.toString()}</p>
                <p>Claimed: {selectedRoute.claimedAmount.toString()}</p>
                <p>Claimable: {claimableAmount.toString()}</p>
                
                {claimableAmount > 0n && (
                  <button onClick={() => claimFromRoute(selectedRoute.routeId)}>
                    Claim Tokens
                  </button>
                )}
              </div>
            )}
          </section>

          {/* Invoice Section */}
          <section>
            <h2>📝 Invoice Routes</h2>
            
            <button onClick={createInvoiceRequest} disabled={loading}>
              Create Invoice Request
            </button>

            {invoiceAppId && (
              <div style={{ marginTop: '1rem' }}>
                <input
                  type="text"
                  value={invoiceAppId}
                  onChange={(e) => setInvoiceAppId(e.target.value)}
                  placeholder="Invoice App ID"
                  style={{ width: '300px', marginRight: '1rem' }}
                />
                <button onClick={() => fetchInvoiceDetails(invoiceAppId)}>
                  Load Invoice
                </button>
              </div>
            )}

            {invoiceDetails && (
              <div style={{ marginTop: '1rem', padding: '1rem', border: '1px solid #ccc' }}>
                <h3>Invoice Details</h3>
                <p>Status: {InvoiceRouteStatus[invoiceDetails.routeStatus]}</p>
                <p>Requester: {invoiceDetails.requester}</p>
                <p>Payer: {invoiceDetails.depositor}</p>
                <p>Beneficiary: {invoiceDetails.beneficiary}</p>
                <p>Gross Amount: {invoiceDetails.grossDepositAmount.toString()}</p>
                <p>Net Amount: {invoiceDetails.depositAmount.toString()}</p>
                <p>Fee: {invoiceDetails.feeAmount.toString()}</p>

                {invoiceDetails.routeStatus === InvoiceRouteStatus.PENDING && (
                  <div>
                    <button onClick={() => acceptInvoice(invoiceAppId)}>
                      Accept & Fund
                    </button>
                    <button 
                      onClick={() => declineInvoice(invoiceAppId)} 
                      style={{ marginLeft: '1rem' }}
                    >
                      Decline
                    </button>
                  </div>
                )}

                {invoiceDetails.routeStatus === InvoiceRouteStatus.FUNDED && (
                  <button onClick={() => claimFromRoute(invoiceAppId)}>
                    Claim Payment
                  </button>
                )}
              </div>
            )}
          </section>

          {/* Transaction Hash */}
          {txHash && (
            <div style={{ marginTop: '2rem' }}>
              <p>Last Transaction: {txHash}</p>
            </div>
          )}
        </>
      )}

      {loading && <p>Loading...</p>}
    </div>
  );
}

export default AlgorandWaypointExample;

