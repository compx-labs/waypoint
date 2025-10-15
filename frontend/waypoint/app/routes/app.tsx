import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import AppNavigation from "../components/AppNavigation";
import Footer from "../components/Footer";
import RouteCreationModal from "../components/RouteCreationModal";
import RoutesList, { type TokenRoute } from "../components/RoutesList";
import { useToast } from "../contexts/ToastContext";
import { useUnifiedWallet } from "../contexts/UnifiedWalletContext";
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


export default function AppDashboard() {
  useEffect(() => {
    document.title = "Waypoint App - Your Routes";
  }, []);
  
  const navigate = useNavigate();
  const { account, connected } = useUnifiedWallet();
  const toast = useToast();
  const [isRouteModalOpen, setIsRouteModalOpen] = useState(false);
  
  // Fetch routes using React Query with automatic refetching
  const { data: allRoutes, isLoading: loading, error: fetchError, refetch } = useRoutes({
    refetchOnMount: 'always', // Always refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window regains focus
  });

  // Helper function to check if a route is completed based on timing
  const isRouteCompleted = (route: RouteData): boolean => {
    // If explicitly marked as completed or cancelled, it's done
    if (route.status === 'completed' || route.status === 'cancelled') {
      return true;
    }
    
    // Calculate if the route has finished based on timing
    const startDate = new Date(route.start_date);
    const totalAmount = parseFloat(route.amount_token_units);
    const amountPerPeriod = parseFloat(route.amount_per_period_token_units);
    const totalPeriods = Math.ceil(totalAmount / amountPerPeriod);
    
    // Calculate end date based on payment frequency
    const endDate = new Date(startDate);
    const frequencyNumber = route.payment_frequency_number;
    
    switch (route.payment_frequency_unit) {
      case 'minutes':
        endDate.setMinutes(endDate.getMinutes() + (totalPeriods * frequencyNumber));
        break;
      case 'hours':
        endDate.setHours(endDate.getHours() + (totalPeriods * frequencyNumber));
        break;
      case 'days':
        endDate.setDate(endDate.getDate() + (totalPeriods * frequencyNumber));
        break;
      case 'weeks':
        endDate.setDate(endDate.getDate() + (totalPeriods * frequencyNumber * 7));
        break;
      case 'months':
        endDate.setMonth(endDate.getMonth() + (totalPeriods * frequencyNumber));
        break;
    }
    
    // Route is completed if current time is past the end date
    return new Date() > endDate;
  };

  // Calculate token routes based on wallet address and routes
  const tokenRoutes = useMemo(() => {
    if (!account || !allRoutes) return [];
    
    const walletAddress = account;
    
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
      
      // Check if route is completed based on timing or status
      if (isRouteCompleted(route)) {
        tokenData.completed.push(route);
      } else if (route.recipient === walletAddress) {
        tokenData.incoming.push(route);
      } else if (route.sender === walletAddress) {
        tokenData.outgoing.push(route);
      }
    });
    
    // Convert to TokenRoute format
    const routes: TokenRoute[] = Array.from(tokenMap.entries()).map(([tokenId, data]) => {
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
        totalRoutes: data.incoming.length + data.outgoing.length + data.completed.length,
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
    
    return routes;
  }, [account, allRoutes]);

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
                disabled={!account}
                className="bg-forest-500 hover:bg-forest-600 text-primary-100 font-display text-sm uppercase tracking-wider font-bold py-3 px-6 rounded-lg transition-all duration-200 ease-out transform hover:translate-y-0.5 hover:scale-105 shadow-lg hover:shadow-xl border-2 border-forest-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:translate-y-0"
              >
                + CREATE
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-12 md:mb-12 pb-24 md:pb-0">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-gradient-to-br from-forest-800 to-forest-900 border border-forest-600 rounded-xl p-6 shadow-lg"
              >
                {/* Token Header Skeleton */}
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-forest-700 animate-pulse" />
                  <div className="flex-1">
                    <div className="h-4 bg-forest-700 rounded animate-pulse w-20" />
                  </div>
                  <div className="w-5 h-5 bg-forest-700 rounded animate-pulse" />
                </div>

                {/* Streams Info Skeleton */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="h-3 bg-forest-700 rounded animate-pulse w-28" />
                    <div className="h-3 bg-forest-700 rounded animate-pulse w-8" />
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="h-3 bg-forest-700 rounded animate-pulse w-20" />
                    <div className="h-3 bg-forest-700 rounded animate-pulse w-16" />
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="h-3 bg-forest-700 rounded animate-pulse w-20" />
                    <div className="h-3 bg-forest-700 rounded animate-pulse w-16" />
                  </div>

                  {/* Completed Routes Section Skeleton */}
                  <div className="mt-4 pt-4 border-t border-forest-700">
                    <div className="flex justify-between items-center">
                      <div className="h-3 bg-forest-700 rounded animate-pulse w-24" />
                      <div className="h-3 bg-forest-700 rounded animate-pulse w-16" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
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
        {account && !loading && !error && tokenRoutes.length === 0 && (
          <div className="bg-gradient-to-br from-forest-100 to-primary-100 border-2 border-forest-400 rounded-lg p-8 text-center">
            <svg className="w-16 h-16 mx-auto mb-4 text-forest-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="text-xl font-display font-bold text-forest-800 uppercase tracking-wide mb-2">
              No Routes Yet
            </h3>
            <p className="text-forest-700 font-display mb-4">
              Create your first route to start routing tokens
            </p>
            <button 
              onClick={handleCreateRoute}
              className="bg-sunset-500 hover:bg-sunset-600 text-primary-100 font-display text-sm uppercase tracking-wider font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              + Create First Route
            </button>
          </div>
        )}

        {/* Token Route Cards */}
        {!loading && !error && tokenRoutes.length > 0 && (
          <RoutesList tokenRoutes={tokenRoutes} />
        )}
      </div>
      
      {/* Mobile Create Button - Fixed at Bottom */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-primary-100 via-primary-100/95 to-transparent p-4 pt-8">
        <button 
          onClick={handleCreateRoute}
          disabled={!account}
          className="w-full bg-gradient-to-r from-forest-500 to-forest-600 hover:from-forest-600 hover:to-forest-700 text-primary-100 font-display text-base uppercase tracking-wider font-bold py-4 px-8 rounded-xl transition-all duration-200 ease-out active:scale-95 shadow-lg border-2 border-forest-400 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
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
