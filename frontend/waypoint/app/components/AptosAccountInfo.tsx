import React from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { useAptos } from '../contexts/AptosContext';
import { useAptosAccount } from '../hooks/useQueries';

/**
 * Example component showing how to use the useAptosAccount hook
 * This fetches and displays the user's Aptos account data including balances, modules, and tokens
 */
export function AptosAccountInfo() {
  const { account } = useWallet();
  const { network } = useAptos();
  
  // Fetch account data using the hook
  const { 
    data: accountData, 
    isLoading, 
    error, 
    refetch 
  } = useAptosAccount(
    account?.address?.toStringLong() || null,
    network === 'mainnet' ? 'mainnet' : 'devnet'
  );

  if (!account) {
    return (
      <div className="bg-forest-100 border-2 border-forest-400 rounded-lg p-6 text-center">
        <p className="text-forest-700 font-display">Connect your wallet to view account data</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-forest-100 border-2 border-forest-400 rounded-lg p-6 text-center">
        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-forest-600 mb-2"></div>
        <p className="text-forest-700 font-display">Loading account data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border-2 border-red-400 rounded-lg p-6 text-center">
        <p className="text-red-700 font-display font-semibold mb-2">Error loading account data</p>
        <p className="text-red-600 text-sm mb-4">{error.message}</p>
        <button 
          onClick={() => refetch()}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-medium"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!accountData) {
    return (
      <div className="bg-forest-100 border-2 border-forest-400 rounded-lg p-6 text-center">
        <p className="text-forest-700 font-display">No account data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white border-2 border-forest-400 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-display font-bold text-forest-800">Account Information</h3>
        <button 
          onClick={() => refetch()}
          className="text-forest-600 hover:text-forest-800 text-sm font-medium"
        >
          Refresh
        </button>
      </div>
      
      <div className="space-y-4">
        {/* Address */}
        <div>
          <p className="text-sm font-medium text-forest-600 mb-1">Address</p>
          <p className="font-mono text-sm text-forest-800 break-all">{accountData.address}</p>
        </div>

        {/* Network */}
        <div>
          <p className="text-sm font-medium text-forest-600 mb-1">Network</p>
          <p className="text-forest-800">{accountData.network}</p>
        </div>

        {/* Balances */}
        <div>
          <p className="text-sm font-medium text-forest-600 mb-2">Balances</p>
          {accountData.balances.length > 0 ? (
            <div className="space-y-2">
              {accountData.balances.map((balance, index) => (
                <div key={index} className="flex items-center justify-between bg-forest-50 rounded p-3">
                  <div className="flex items-center space-x-3">
                    {balance.logoUrl && (
                      <img 
                        src={balance.logoUrl} 
                        alt={balance.symbol}
                        className="w-6 h-6 rounded-full"
                      />
                    )}
                    <div>
                      <p className="font-medium text-forest-800">{balance.symbol}</p>
                      <p className="text-xs text-forest-600">{balance.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-forest-800">
                      {balance.amount.toLocaleString(undefined, { 
                        minimumFractionDigits: 2, 
                        maximumFractionDigits: 6 
                      })}
                    </p>
                    <p className="text-xs text-forest-600">{balance.coinType}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-forest-600 text-sm">No balances found</p>
          )}
        </div>

        {/* Modules */}
        <div>
          <p className="text-sm font-medium text-forest-600 mb-2">Deployed Modules ({accountData.modules.length})</p>
          {accountData.modules.length > 0 ? (
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {accountData.modules.map((module, index) => (
                <div key={index} className="bg-forest-50 rounded p-2">
                  <p className="font-mono text-xs text-forest-800">{module.name}</p>
                  <p className="text-xs text-forest-600">{module.address}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-forest-600 text-sm">No modules deployed</p>
          )}
        </div>

        {/* Tokens */}
        <div>
          <p className="text-sm font-medium text-forest-600 mb-2">Tokens ({accountData.tokens.length})</p>
          {accountData.tokens.length > 0 ? (
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {accountData.tokens.slice(0, 5).map((token, index) => (
                <div key={index} className="bg-forest-50 rounded p-2">
                  <p className="font-mono text-xs text-forest-800">
                    {token.collection_name || 'Unknown Collection'}
                  </p>
                  <p className="text-xs text-forest-600">Amount: {token.amount}</p>
                </div>
              ))}
              {accountData.tokens.length > 5 && (
                <p className="text-xs text-forest-600 text-center">
                  ... and {accountData.tokens.length - 5} more
                </p>
              )}
            </div>
          ) : (
            <p className="text-forest-600 text-sm">No tokens found</p>
          )}
        </div>
      </div>
    </div>
  );
}
