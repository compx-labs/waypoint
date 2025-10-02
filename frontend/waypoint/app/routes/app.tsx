import type { Route } from "./+types/app";
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import AppNavigation from "../components/AppNavigation";
import Footer from "../components/Footer";
import RouteCreationModal from "../components/RouteCreationModal";
import RoutesList, { type TokenStream } from "../components/RoutesList";
import { useToast } from "../contexts/ToastContext";
import { useRoutes } from "../hooks/useQueries";
import type { RouteData } from "../lib/api";

// Helper function to format currency
function formatCurrency(amount: number): string {
  if (amount === 0) return "$0.00";
  if (amount < 0.01) return "<$0.01";
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}K`;
  return `$${amount.toFixed(2)}`;
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

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Waypoint App - Your Routes" },
    {
      name: "description",
      content:
        "Manage your token routes, view analytics, and create new payment flows with Waypoint.",
    },
  ];
}

export default function AppDashboard() {
  const navigate = useNavigate();
  const { account } = useWallet();
  const toast = useToast();
  const [isRouteModalOpen, setIsRouteModalOpen] = useState(false);
  
  // Fetch routes using React Query
  const { data: allRoutes, isLoading: loading, error: fetchError, refetch } = useRoutes();

  // Calculate token streams based on wallet address and routes
  const tokenStreams = useMemo(() => {
    if (!account?.address || !allRoutes) return [];
    
    const walletAddress = account.address.toStringLong();
    
    // Filter routes for this wallet
    const userRoutes = allRoutes.filter(
      route => route.sender === walletAddress || route.recipient === walletAddress
    );
    
    // Group by token and calculate stats
    const tokenMap = new Map<number, {
      token: RouteData['token'];
      incoming: RouteData[];
      outgoing: RouteData[];
      completed: RouteData[];
    }>();
    
    userRoutes.forEach(route => {
      if (!tokenMap.has(route.token_id)) {
        tokenMap.set(route.token_id, {
          token: route.token,
          incoming: [],
          outgoing: [],
          completed: [],
        });
      }
      
      const tokenData = tokenMap.get(route.token_id)!;
      
      if (route.status === 'completed') {
        tokenData.completed.push(route);
      } else if (route.recipient === walletAddress) {
        tokenData.incoming.push(route);
      } else if (route.sender === walletAddress) {
        tokenData.outgoing.push(route);
      }
    });
    
    // Convert to TokenStream format
    const streams: TokenStream[] = Array.from(tokenMap.entries()).map(([tokenId, data]) => {
      const calculateTotal = (routes: RouteData[]) => {
        const total = routes.reduce((sum, route) => {
          return sum + parseFloat(route.amount_token_units);
        }, 0);
        return total / Math.pow(10, data.token.decimals);
      };
      
      const incomingTotal = calculateTotal(data.incoming);
      const outgoingTotal = calculateTotal(data.outgoing);
      const completedTotal = calculateTotal(data.completed);
      
      // Calculate TVL (incoming - outgoing)
      const tvl = incomingTotal - outgoingTotal;
      
      return {
        id: tokenId,
        name: data.token.name,
        symbol: data.token.symbol,
        color: getTokenColor(data.token.symbol),
        logoSrc: data.token.logo_url || '/logo.svg',
        tvl: formatCurrency(tvl),
        totalStreams: data.incoming.length + data.outgoing.length + data.completed.length,
        incoming: {
          count: data.incoming.length,
          value: formatCurrency(incomingTotal),
        },
        outgoing: {
          count: data.outgoing.length,
          value: formatCurrency(outgoingTotal),
        },
        completed: {
          count: data.completed.length,
          value: formatCurrency(completedTotal),
        },
      };
    });
    
    return streams;
  }, [account?.address, allRoutes]);

  const error = fetchError ? (fetchError instanceof Error ? fetchError.message : 'Failed to fetch routes') : null;

  const handleCreateRoute = () => {
    setIsRouteModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsRouteModalOpen(false);
    // Refetch routes in case user created a new one
    refetch();
  };

  const handleRouteTypeSelect = (routeTypeId: string) => {
    console.log("Selected route type:", routeTypeId);
    // Navigate to route creation wizard with the selected type
    navigate(`/create-route?type=${routeTypeId}`);
  };

  return (
    <div className="min-h-screen bg-primary-100">
      <AppNavigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-6">
            <div>
              <h1 className="text-4xl lg:text-5xl font-display font-bold text-forest-800 uppercase tracking-wide mb-4">
                Your Routes
              </h1>
              <p className="text-lg text-forest-800 leading-relaxed max-w-4xl">
                Create and manage token routes to send payments, vesting
                schedules, or subscriptions over time. Route tokens gradually to
                recipients with customizable unlock schedules and cliff periods.
              </p>
            </div>

            {/* Desktop Create Button */}
            <div className="hidden md:flex items-center space-x-4 mt-6 lg:mt-0">
              <button 
                onClick={handleCreateRoute}
                className="bg-forest-500 hover:bg-forest-600 text-primary-100 font-display text-sm uppercase tracking-wider font-bold py-3 px-6 rounded-lg transition-all duration-200 ease-out transform hover:translate-y-0.5 hover:scale-105 shadow-lg hover:shadow-xl border-2 border-forest-400"
              >
                + CREATE
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-forest-600"></div>
            <p className="mt-4 text-forest-700 font-display">Loading your routes...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-100 border-2 border-red-400 rounded-lg p-6 text-center">
            <p className="text-red-700 font-display font-semibold mb-2">Error loading routes</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* No Wallet Connected */}
        {!account && !loading && (
          <div className="bg-forest-100 border-2 border-forest-400 rounded-lg p-8 text-center">
            <svg className="w-16 h-16 mx-auto mb-4 text-forest-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <h3 className="text-xl font-display font-bold text-forest-800 uppercase tracking-wide mb-2">
              Connect Your Wallet
            </h3>
            <p className="text-forest-700 font-display">
              Connect your wallet to view and manage your routes
            </p>
          </div>
        )}

        {/* Empty State - No Routes */}
        {account && !loading && !error && tokenStreams.length === 0 && (
          <div className="bg-gradient-to-br from-forest-100 to-primary-100 border-2 border-forest-400 rounded-lg p-8 text-center">
            <svg className="w-16 h-16 mx-auto mb-4 text-forest-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="text-xl font-display font-bold text-forest-800 uppercase tracking-wide mb-2">
              No Routes Yet
            </h3>
            <p className="text-forest-700 font-display mb-4">
              Create your first route to start streaming tokens
            </p>
            <button 
              onClick={handleCreateRoute}
              className="bg-sunset-500 hover:bg-sunset-600 text-primary-100 font-display text-sm uppercase tracking-wider font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              + Create First Route
            </button>
          </div>
        )}

        {/* Token Stream Cards */}
        {!loading && !error && tokenStreams.length > 0 && (
          <RoutesList tokenStreams={tokenStreams} />
        )}
      </div>
      
      {/* Mobile Create Button - Fixed at Bottom */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-primary-100 via-primary-100/95 to-transparent p-4 pt-8">
        <button 
          onClick={handleCreateRoute}
          className="w-full bg-gradient-to-r from-forest-500 to-forest-600 hover:from-forest-600 hover:to-forest-700 text-primary-100 font-display text-base uppercase tracking-wider font-bold py-4 px-8 rounded-xl transition-all duration-200 ease-out active:scale-95 shadow-lg border-2 border-forest-400 flex items-center justify-center space-x-2"
          style={{ 
            touchAction: 'manipulation',
            WebkitTapHighlightColor: 'transparent' 
          }}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          <span>CREATE ROUTE</span>
        </button>
      </div>
      
      <Footer />
      
      {/* Route Creation Modal */}
      <RouteCreationModal
        isOpen={isRouteModalOpen}
        onClose={handleCloseModal}
        onRouteTypeSelect={handleRouteTypeSelect}
      />
    </div>
  );
}
