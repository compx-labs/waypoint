import type { Route } from "./+types/token-routes";
import { useSearchParams } from "react-router";
import { useState, useMemo } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import AppNavigation from "../components/AppNavigation";
import Footer from "../components/Footer";
import { useRoutes, useToken } from "../hooks/useQueries";
import type { RouteData } from "../lib/api";
import { useToast } from "../contexts/ToastContext";

// Types for individual route data
interface TokenRoute {
  id: number;
  recipient: string;
  sender: string;
  total: string;
  remaining: string;
  payoutPeriod: string;
  payoutAmount: string;
  status: string;
  startDate: string;
  isIncoming: boolean;
}

interface TokenData {
  name: string;
  symbol: string;
  color: string;
  logoSrc: string;
  routes: TokenRoute[];
}

// Helper function to format currency
function formatCurrency(amount: number): string {
  if (amount === 0) return "$0.00";
  if (amount < 0.01) return "<$0.01";
  return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Helper function to shorten address
function shortenAddress(address: string): string {
  if (address.length <= 13) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Helper function to format payout period
function formatPayoutPeriod(unit: string, number: number): string {
  const unitMap: Record<string, string> = {
    'days': 'Day',
    'weeks': 'Week',
    'months': 'Month',
  };
  const unitName = unitMap[unit] || unit;
  return number === 1 ? unitName : `${number} ${unitName}s`;
}

// Helper function to get token color
function getTokenColor(symbol: string): string {
  const colorMap: Record<string, string> = {
    'USDC': 'bg-gradient-to-br from-blue-500 to-blue-600',
    'USDT': 'bg-gradient-to-br from-green-500 to-green-600',
    'xUSD': 'bg-gradient-to-br from-sunset-500 to-sunset-600',
    'USDY': 'bg-gradient-to-br from-purple-500 to-purple-600',
    'BUIDL': 'bg-gradient-to-br from-yellow-500 to-yellow-600',
    'MOD': 'bg-gradient-to-br from-pink-500 to-pink-600',
  };
  return colorMap[symbol] || 'bg-gradient-to-br from-forest-500 to-forest-600';
}

export function meta({}: Route["MetaArgs"]) {
  return [
    { title: "Token Routes - Waypoint" },
    {
      name: "description", 
      content: "View and manage individual routes for your token streams."
    }
  ];
}

export default function TokenRoutes() {
  const [searchParams] = useSearchParams();
  const tokenId = searchParams.get('id');
  const { account } = useWallet();
  const toast = useToast();
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  
  // Parse tokenId to number
  const tokenIdNum = tokenId ? parseInt(tokenId) : null;
  
  // Get wallet address for checking if user is recipient
  const walletAddress = account?.address?.toStringLong();
  
  // Fetch data using React Query
  const { data: allRoutes, isLoading: routesLoading, error: routesError } = useRoutes();
  const { data: tokenInfo, isLoading: tokenLoading, error: tokenError } = useToken(tokenIdNum);

  // Calculate token data based on routes
  const tokenData = useMemo((): TokenData | null => {
    if (!tokenIdNum) return null;
    
    // Filter routes for this token
    const tokenRoutes = allRoutes?.filter(route => route.token_id === tokenIdNum) || [];
    
    // If we have routes, use the first route's token info
    const token = tokenRoutes.length > 0 ? tokenRoutes[0].token : tokenInfo;
    
    // If we don't have token info, return null
    if (!token) return null;
    
    // Format routes for display
    const formattedRoutes: TokenRoute[] = tokenRoutes.map(route => {
      const totalAmount = parseFloat(route.amount_token_units) / Math.pow(10, token.decimals);
      const payoutAmount = parseFloat(route.amount_per_period_token_units) / Math.pow(10, token.decimals);
      
      // Calculate remaining based on time elapsed (simplified - you may want to use actual blockchain data)
      const now = new Date();
      const startDate = new Date(route.start_date);
      const elapsed = now.getTime() - startDate.getTime();
      
      // Convert elapsed time to the appropriate unit
      let periodsElapsed = 0;
      switch (route.payment_frequency_unit) {
        case 'minutes':
          periodsElapsed = elapsed / (1000 * 60 * route.payment_frequency_number);
          break;
        case 'hours':
          periodsElapsed = elapsed / (1000 * 60 * 60 * route.payment_frequency_number);
          break;
        case 'days':
          periodsElapsed = elapsed / (1000 * 60 * 60 * 24 * route.payment_frequency_number);
          break;
        case 'weeks':
          periodsElapsed = elapsed / (1000 * 60 * 60 * 24 * 7 * route.payment_frequency_number);
          break;
        case 'months':
          periodsElapsed = elapsed / (1000 * 60 * 60 * 24 * 30 * route.payment_frequency_number);
          break;
      }
      
      // Calculate paid out and remaining based on amount per period
      const paidOut = Math.min(totalAmount, payoutAmount * Math.floor(periodsElapsed));
      const remaining = Math.max(0, totalAmount - paidOut);
      
      return {
        id: route.id,
        recipient: route.recipient,
        sender: route.sender,
        total: formatCurrency(totalAmount),
        remaining: route.status === 'completed' ? '$0.00' : formatCurrency(remaining),
        payoutPeriod: formatPayoutPeriod(route.payment_frequency_unit, route.payment_frequency_number),
        payoutAmount: formatCurrency(payoutAmount),
        status: route.status,
        startDate: route.start_date,
        isIncoming: walletAddress ? route.recipient === walletAddress : false,
      };
    });
    
    return {
      name: token.name,
      symbol: token.symbol,
      color: getTokenColor(token.symbol),
      logoSrc: token.logo_url || '/logo.svg',
      routes: formattedRoutes,
    };
  }, [tokenIdNum, allRoutes, tokenInfo, walletAddress]);

  const loading = routesLoading || tokenLoading;
  const error = routesError || tokenError;
  const errorMessage = error instanceof Error ? error.message : 'Failed to fetch routes';

  const toggleRow = (routeId: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(routeId)) {
      newExpanded.delete(routeId);
    } else {
      newExpanded.add(routeId);
    }
    setExpandedRows(newExpanded);
  };

  const handleClaim = (routeId: number) => {
    // TODO: Add blockchain claim logic here
    toast.info({ 
      title: 'Claim Functionality Coming Soon',
      description: 'Blockchain integration will be added shortly'
    });
    console.log(`Claiming payout for route ${routeId}`);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-primary-100">
        <AppNavigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-forest-600"></div>
            <p className="mt-4 text-forest-700 font-display">Loading routes...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Show error state
  if (error || (!loading && !tokenData)) {
    return (
      <div className="min-h-screen bg-primary-100">
        <AppNavigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-100 border-2 border-red-400 rounded-lg p-6 text-center">
            <p className="text-red-700 font-display font-semibold mb-2">Error loading routes</p>
            <p className="text-red-600 text-sm">{errorMessage || 'Token not found'}</p>
            <a
              href="/app"
              className="inline-block mt-4 text-forest-600 hover:text-forest-800 transition-colors duration-200"
            >
              <span className="font-display text-sm uppercase tracking-wide">← Back to Routes</span>
            </a>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  // Guard clause - tokenData is guaranteed to be non-null after this point
  if (!tokenData) {
    return null;
  }
  
  // TypeScript assertion - we've checked tokenData exists above
  const safeTokenData = tokenData;

  return (
    <div className="min-h-screen bg-primary-100">
      <AppNavigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          {/* Mobile Header - Centered */}
          <div className="sm:hidden text-center mb-6">
            {/* Token Icon */}
            {safeTokenData.logoSrc ? (
              <div className="w-16 h-16 rounded-full flex items-center justify-center bg-white p-3 mx-auto mb-4">
                <img
                  src={safeTokenData.logoSrc}
                  alt={`${safeTokenData.name} logo`}
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className={`w-16 h-16 ${safeTokenData.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                <span className="text-primary-100 font-display font-bold text-2xl">
                  {safeTokenData.symbol}
                </span>
              </div>
            )}
            <h1 className="text-3xl font-display font-bold text-forest-800 uppercase tracking-wide mb-4">
              {safeTokenData.name} Routes
            </h1>
            <p className="text-base text-forest-800 leading-relaxed px-4">
              All routes using {safeTokenData.name} tokens. Monitor progress, recipients, and payout schedules in one place.
            </p>
          </div>

          {/* Desktop Header - Side by side */}
          <div className="hidden sm:flex sm:items-center sm:space-x-4 mb-6">
            {/* Token Icon */}
            {safeTokenData.logoSrc ? (
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-white p-2 flex-shrink-0">
                <img
                  src={safeTokenData.logoSrc}
                  alt={`${safeTokenData.name} logo`}
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className={`w-12 h-12 ${safeTokenData.color} rounded-full flex items-center justify-center flex-shrink-0`}>
                <span className="text-primary-100 font-display font-bold text-xl">
                  {safeTokenData.symbol}
                </span>
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-4xl lg:text-5xl font-display font-bold text-forest-800 uppercase tracking-wide">
                {safeTokenData.name} Routes
              </h1>
              <p className="text-lg text-forest-800 leading-relaxed max-w-4xl mt-2">
                All routes using {safeTokenData.name} tokens. Monitor progress, recipients, and payout schedules in one place.
              </p>
            </div>
          </div>
        </div>

        {/* Routes Table */}
        <div className="bg-white rounded-xl shadow-lg border border-forest-200 overflow-hidden">
          {safeTokenData.routes.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-forest-600 text-lg">No routes found for this token.</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  {/* Table Header */}
                  <thead className="bg-forest-50 border-b border-forest-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-display font-semibold text-forest-800 uppercase tracking-wide">
                        Recipient
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-display font-semibold text-forest-800 uppercase tracking-wide">
                        Total
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-display font-semibold text-forest-800 uppercase tracking-wide">
                        Remaining
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-display font-semibold text-forest-800 uppercase tracking-wide">
                        Payout Period
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-display font-semibold text-forest-800 uppercase tracking-wide">
                        Payout Amount
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-display font-semibold text-forest-800 uppercase tracking-wide">
                        Action
                      </th>
                    </tr>
                  </thead>

                  {/* Table Body */}
                  <tbody className="divide-y divide-forest-100">
                    {safeTokenData.routes.map((route, index) => (
                      <tr 
                        key={route.id}
                        className={`hover:bg-forest-25 transition-colors duration-150 ${
                          index % 2 === 0 ? 'bg-white' : 'bg-forest-10'
                        }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-mono text-forest-800" title={route.recipient}>
                            {shortenAddress(route.recipient)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-forest-800">
                            {route.total}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-green-600">
                            {route.remaining}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-sunset-100 text-sunset-800 border border-sunset-200">
                            {route.payoutPeriod}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-forest-800">
                            {route.payoutAmount}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {route.isIncoming ? (
                            <button
                              onClick={() => handleClaim(route.id)}
                              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-sunset-500 to-sunset-600 hover:from-sunset-600 hover:to-sunset-700 text-primary-100 text-xs font-display font-bold uppercase tracking-wider rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
                            >
                              Claim Payout
                            </button>
                          ) : (
                            <span className="text-xs text-forest-400 font-display uppercase">
                              —
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Expandable Cards */}
              <div className="md:hidden">
                {safeTokenData.routes.map((route, index) => {
                  const isExpanded = expandedRows.has(route.id);
                  return (
                    <div 
                      key={route.id} 
                      className={`border-b border-forest-100 last:border-b-0 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-forest-10'
                      }`}
                    >
                      {/* Main Row - Always Visible */}
                      <div 
                        className="p-4 cursor-pointer hover:bg-forest-25 transition-colors duration-150"
                        onClick={() => toggleRow(route.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            {/* Recipient */}
                            <div className="mb-2">
                              <div className="text-xs font-display font-semibold text-forest-600 uppercase tracking-wide mb-1">
                                Recipient
                              </div>
                              <div className="text-sm font-mono text-forest-800 truncate" title={route.recipient}>
                                {shortenAddress(route.recipient)}
                              </div>
                            </div>
                            
                            {/* Total and Remaining in a row */}
                            <div className="flex space-x-4">
                              <div className="flex-1">
                                <div className="text-xs font-display font-semibold text-forest-600 uppercase tracking-wide mb-1">
                                  Total
                                </div>
                                <div className="text-sm font-semibold text-forest-800">
                                  {route.total}
                                </div>
                              </div>
                              <div className="flex-1">
                                <div className="text-xs font-display font-semibold text-forest-600 uppercase tracking-wide mb-1">
                                  Remaining
                                </div>
                                <div className="text-sm font-semibold text-green-600">
                                  {route.remaining}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Expand/Collapse Icon */}
                          <div className="ml-4 flex-shrink-0">
                            <svg 
                              className={`w-5 h-5 text-forest-600 transition-transform duration-200 ${
                                isExpanded ? 'transform rotate-180' : ''
                              }`} 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <div className="px-4 pb-4 border-t border-forest-100 bg-forest-25">
                          <div className="pt-4 space-y-3">
                            <div>
                              <div className="text-xs font-display font-semibold text-forest-600 uppercase tracking-wide mb-1">
                                Payout Period
                              </div>
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-sunset-100 text-sunset-800 border border-sunset-200">
                                {route.payoutPeriod}
                              </span>
                            </div>
                            <div>
                              <div className="text-xs font-display font-semibold text-forest-600 uppercase tracking-wide mb-1">
                                Payout Amount
                              </div>
                              <div className="text-sm font-semibold text-forest-800">
                                {route.payoutAmount}
                              </div>
                            </div>
                            
                            {/* Claim Button for Mobile */}
                            {route.isIncoming && (
                              <div>
                                <div className="text-xs font-display font-semibold text-forest-600 uppercase tracking-wide mb-2">
                                  Claim Payout
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleClaim(route.id);
                                  }}
                                  className="w-full px-4 py-3 bg-gradient-to-r from-sunset-500 to-sunset-600 hover:from-sunset-600 hover:to-sunset-700 text-primary-100 text-sm font-display font-bold uppercase tracking-wider rounded-lg transition-all duration-200 active:scale-95 shadow-md"
                                >
                                  Claim Payout
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Back Navigation */}
        <div className="mt-8">
          <a
            href="/app"
            className="inline-flex items-center space-x-2 text-forest-600 hover:text-forest-800 transition-colors duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-display text-sm uppercase tracking-wide">Back to Routes</span>
          </a>
        </div>
      </div>

      <Footer />
    </div>
  );
}
