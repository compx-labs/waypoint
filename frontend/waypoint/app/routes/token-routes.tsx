import { useSearchParams } from "react-router-dom";
import React, { useState, useMemo, useEffect } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useQueryClient } from "@tanstack/react-query";
import AppNavigation from "../components/AppNavigation";
import Footer from "../components/Footer";
import RouteBlockchainData from "../components/RouteBlockchainData";
import { useRoutes, useToken, queryKeys } from "../hooks/useQueries";
import type { RouteData } from "../lib/api";
import { updateRouteStatus, fetchRouteTypes } from "../lib/api";
import { useToast } from "../contexts/ToastContext";
import { useAptos } from "../contexts/AptosContext";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";

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
  routeObjAddress: string | null;
  decimals: number;
  tokenSymbol: string;
  routeType: string;
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

// Helper function to display recipient (shows "You" if it's the current user)
function displayRecipient(address: string, currentUserAddress?: string): string {
  if (currentUserAddress && address === currentUserAddress) {
    return 'You';
  }
  return shortenAddress(address);
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

export default function TokenRoutes() {
  useEffect(() => {
    document.title = "Token Routes - Waypoint";
  }, []);
  const [searchParams] = useSearchParams();
  const tokenId = searchParams.get('id');
  const { account, signAndSubmitTransaction } = useWallet();
  const { network, getRouteCore, waypointClient } = useAptos();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const [claimingRouteId, setClaimingRouteId] = useState<number | null>(null);
  const [approvingRouteId, setApprovingRouteId] = useState<number | null>(null);
  const [approveModalRouteId, setApproveModalRouteId] = useState<number | null>(null);
  const [approveAmount, setApproveAmount] = useState<string>('');
  const [approvalDataLoading, setApprovalDataLoading] = useState(false);
  const [currentApprovedAmount, setCurrentApprovedAmount] = useState<string>('0');
  const [routeCompletionStatus, setRouteCompletionStatus] = useState<Map<number, boolean>>(new Map());
  const [routeFullyApprovedStatus, setRouteFullyApprovedStatus] = useState<Map<number, boolean>>(new Map());
  
  // Parse tokenId to number
  const tokenIdNum = tokenId ? parseInt(tokenId) : null;
  
  // Get wallet address for checking if user is recipient
  const walletAddress = account?.address?.toStringLong();
  
  // Fetch data using React Query with automatic refetching
  const { data: allRoutes, isLoading: routesLoading, error: routesError } = useRoutes({
    refetchOnMount: 'always', // Always refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window regains focus
  });
  const { data: tokenInfo, isLoading: tokenLoading, error: tokenError } = useToken(tokenIdNum);

  // Fetch approved amount when approval modal opens
  useEffect(() => {
    const fetchApprovedAmount = async () => {
      if (!approveModalRouteId) {
        setCurrentApprovedAmount('0');
        return;
      }
      
      const currentRoute = allRoutes?.find(r => r.id === approveModalRouteId);
      if (!currentRoute?.route_obj_address) {
        setCurrentApprovedAmount('0');
        return;
      }
      
      setApprovalDataLoading(true);
      try {
        const routeData = await getRouteCore(currentRoute.route_obj_address);
        if (routeData && routeData.approved_amount) {
          setCurrentApprovedAmount(routeData.approved_amount);
        } else {
          setCurrentApprovedAmount('0');
        }
      } catch (error) {
        console.error('Error fetching approved amount:', error);
        setCurrentApprovedAmount('0');
      } finally {
        setApprovalDataLoading(false);
      }
    };
    
    fetchApprovedAmount();
  }, [approveModalRouteId, allRoutes, getRouteCore]);

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
        total: `${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })} ${token.symbol}`,
        remaining: route.status === 'completed' ? '$0.00' : formatCurrency(remaining),
        payoutPeriod: formatPayoutPeriod(route.payment_frequency_unit, route.payment_frequency_number),
        payoutAmount: formatCurrency(payoutAmount),
        status: route.status,
        startDate: route.start_date,
        isIncoming: walletAddress ? route.recipient === walletAddress : false,
        routeObjAddress: route.route_obj_address,
        decimals: token.decimals,
        tokenSymbol: token.symbol,
        routeType: route.route_type || 'simple-transfer',
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

  const handleCompletionStatusChange = (routeId: number, isComplete: boolean) => {
    setRouteCompletionStatus(prev => {
      const newMap = new Map(prev);
      newMap.set(routeId, isComplete);
      return newMap;
    });
  };

  const handleFullyApprovedStatusChange = (routeId: number, isFullyApproved: boolean) => {
    setRouteFullyApprovedStatus(prev => {
      const newMap = new Map(prev);
      newMap.set(routeId, isFullyApproved);
      return newMap;
    });
  };

  const handleClaim = async (routeId: number) => {
    if (!account || !signAndSubmitTransaction) {
      toast.error({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet to claim tokens'
      });
      return;
    }

    // Check if SDK is available
    if (!waypointClient) {
      toast.error({
        title: 'SDK Not Initialized',
        description: 'Please refresh the page and try again'
      });
      return;
    }

    // Find the route to get the route_obj_address
    const route = allRoutes?.find(r => r.id === routeId);
    if (!route || !route.route_obj_address) {
      toast.error({
        title: 'Route Not Found',
        description: 'Could not find route information or blockchain address'
      });
      return;
    }

    // Check if user is the beneficiary
    if (route.recipient !== account.address.toStringLong()) {
      toast.error({
        title: 'Not Authorized',
        description: 'Only the beneficiary can claim tokens from this route'
      });
      return;
    }

    setClaimingRouteId(routeId);
    
    // Show loading toast
    const loadingToastId = toast.loading({
      title: "Claiming Tokens",
      description: "Please confirm the transaction in your wallet...",
    });

    try {
      // Configure Aptos SDK
      const aptosNetwork = Network.MAINNET;
      const config = new AptosConfig({ network: aptosNetwork });
      const aptos = new Aptos(config);

      // Build claim transaction using SDK based on route type
      const isMilestone = route.route_type === 'milestone-routes';
      const transactionPayload = isMilestone
        ? await waypointClient.buildClaimMilestoneTransaction({
            caller: account.address.toString(),
            routeAddress: route.route_obj_address,
          })
        : await waypointClient.buildClaimLinearTransaction({
            caller: account.address.toString(),
            routeAddress: route.route_obj_address,
          });

      // Sign and submit transaction using wallet adapter
      const response = await signAndSubmitTransaction({
        sender: account.address,
        data: transactionPayload,
      });

      // Update toast to waiting for confirmation
      toast.update(loadingToastId, {
        title: "Transaction Submitted",
        description: "Waiting for blockchain confirmation...",
        type: "loading",
      });

      // Wait for transaction confirmation
      await aptos.waitForTransaction({ transactionHash: response.hash });

      // Check if route is now complete on blockchain
      try {
        const routeCoreData = await getRouteCore(route.route_obj_address);
        
        if (routeCoreData) {
          // Check if all tokens have been claimed
          const depositAmount = BigInt(routeCoreData.deposit_amount);
          const claimedAmount = BigInt(routeCoreData.claimed_amount);
          
          if (claimedAmount >= depositAmount) {
            // Route is complete, update database
            try {
              await updateRouteStatus(routeId, 'completed');
              console.log(`Route ${routeId} marked as completed in database`);
            } catch (dbError) {
              console.error('Failed to update route status in database:', dbError);
              // Don't fail the claim if DB update fails
            }
          }
        }
      } catch (checkError) {
        console.error('Failed to check route completion status:', checkError);
        // Don't fail the claim if check fails
      }

      // Success!
      toast.update(loadingToastId, {
        title: "Tokens Claimed Successfully!",
        description: `Your tokens have been claimed and deposited to your wallet.`,
        type: "success",
      });

      // Invalidate queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.routes });
      
      // Trigger blockchain data refresh
      setRefreshTrigger(prev => prev + 1);

      // Dismiss toast after a short delay
      setTimeout(() => {
        toast.dismiss(loadingToastId);
      }, 2000);

    } catch (error) {
      console.error("Failed to claim tokens:", error);
      
      let errorMessage = "Failed to claim tokens. Please try again.";
      if (error instanceof Error) {
        if (error.message.includes("User rejected")) {
          errorMessage = "Transaction was rejected.";
        } else if (error.message.includes("NOTHING_CLAIMABLE")) {
          errorMessage = "No tokens are available to claim yet.";
        } else if (error.message.includes("NOT_BENEFICIARY")) {
          errorMessage = "Only the beneficiary can claim from this route.";
        } else {
          errorMessage = error.message;
        }
      }
      
      // Dismiss the loading toast and show error
      toast.dismiss(loadingToastId);
      toast.error({
        title: "Claim Failed",
        description: errorMessage,
        duration: 5000,
      });
    } finally {
      setClaimingRouteId(null);
    }
  };

  const handleApprove = async () => {
    if (!account || !signAndSubmitTransaction) {
      toast.error({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet to approve payouts'
      });
      return;
    }

    // Check if SDK is available
    if (!waypointClient) {
      toast.error({
        title: 'SDK Not Initialized',
        description: 'Please refresh the page and try again'
      });
      return;
    }

    if (!approveModalRouteId || !approveAmount) {
      toast.error({
        title: 'Invalid Input',
        description: 'Please enter an amount to approve'
      });
      return;
    }

    // Find the route
    const route = allRoutes?.find(r => r.id === approveModalRouteId);
    if (!route || !route.route_obj_address) {
      toast.error({
        title: 'Route Not Found',
        description: 'Could not find route information or blockchain address'
      });
      return;
    }

    // Check if user is the depositor
    if (route.sender !== account.address.toStringLong()) {
      toast.error({
        title: 'Not Authorized',
        description: 'Only the depositor can approve payouts for this route'
      });
      return;
    }

    // Check if this is a milestone route
    if (route.route_type !== 'milestone-routes') {
      toast.error({
        title: 'Invalid Route Type',
        description: 'Only milestone routes support payout approvals'
      });
      return;
    }

    setApprovingRouteId(approveModalRouteId);
    
    // Show loading toast
    const loadingToastId = toast.loading({
      title: "Approving Payout",
      description: "Please confirm the transaction in your wallet...",
    });

    try {
      // Get token info to convert amount to token units
      const token = route.token;
      const unlockAmountInUnits = BigInt(Math.floor(parseFloat(approveAmount) * Math.pow(10, token.decimals)));

      if (unlockAmountInUnits <= 0n) {
        toast.update(loadingToastId, {
          title: "Invalid Amount",
          description: "Please enter a valid amount greater than 0.",
          type: "error",
        });
        setApprovingRouteId(null);
        return;
      }

      // Configure Aptos SDK
      const aptosNetwork = Network.MAINNET;
      const config = new AptosConfig({ network: aptosNetwork });
      const aptos = new Aptos(config);

      // Build approve transaction using SDK
      const transactionPayload = await waypointClient.buildApproveMilestoneTransaction({
        caller: account.address.toString(),
        routeAddress: route.route_obj_address,
        unlockAmount: unlockAmountInUnits,
      });

      // Sign and submit transaction using wallet adapter
      const response = await signAndSubmitTransaction({
        sender: account.address,
        data: transactionPayload,
      });

      // Update toast to waiting for confirmation
      toast.update(loadingToastId, {
        title: "Transaction Submitted",
        description: "Waiting for blockchain confirmation...",
        type: "loading",
      });

      // Wait for transaction confirmation
      await aptos.waitForTransaction({ transactionHash: response.hash });

      // Success!
      toast.update(loadingToastId, {
        title: "Payout Approved Successfully!",
        description: `You have approved ${approveAmount} ${token.symbol} for payout.`,
        type: "success",
      });

      // Optimistically update the current approved amount
      const approvedAmountValue = parseFloat(approveAmount);
      if (!isNaN(approvedAmountValue)) {
        setCurrentApprovedAmount(prev => prev + approvedAmountValue);
      }
      
      // Reset approve amount but keep modal open to show updated values
      setApproveAmount('');
      
      // Invalidate queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.routes });
      
      // Trigger blockchain data refresh
      setRefreshTrigger(prev => prev + 1);

      // Close modal after showing success
      setTimeout(() => {
        toast.dismiss(loadingToastId);
        setApproveModalRouteId(null);
      }, 2000);

    } catch (error) {
      console.error("Failed to approve payout:", error);
      
      let errorMessage = "Failed to approve payout. Please try again.";
      if (error instanceof Error) {
        if (error.message.includes("User rejected")) {
          errorMessage = "Transaction was rejected.";
        } else if (error.message.includes("E_NOT_DEPOSITOR")) {
          errorMessage = "Only the depositor can approve payouts.";
        } else if (error.message.includes("E_BAD_AMOUNT")) {
          errorMessage = "Invalid amount. Cannot exceed remaining deposit.";
        } else {
          errorMessage = error.message;
        }
      }
      
      // Dismiss the loading toast and show error
      toast.dismiss(loadingToastId);
      toast.error({
        title: "Approval Failed",
        description: errorMessage,
        duration: 5000,
      });
    } finally {
      setApprovingRouteId(null);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-primary-100">
        <AppNavigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Skeleton */}
          <div className="mb-8">
            {/* Mobile Header Skeleton */}
            <div className="sm:hidden text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-forest-200 animate-pulse mx-auto mb-4" />
              <div className="h-8 bg-forest-200 rounded animate-pulse w-48 mx-auto mb-4" />
              <div className="h-4 bg-forest-200 rounded animate-pulse w-64 mx-auto mb-2" />
              <div className="h-4 bg-forest-200 rounded animate-pulse w-56 mx-auto" />
            </div>

            {/* Desktop Header Skeleton */}
            <div className="hidden sm:flex sm:items-center sm:space-x-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-forest-200 animate-pulse flex-shrink-0" />
              <div className="flex-1">
                <div className="h-10 bg-forest-200 rounded animate-pulse w-64 mb-2" />
                <div className="h-5 bg-forest-200 rounded animate-pulse w-96" />
              </div>
            </div>
          </div>

          {/* Table Skeleton */}
          <div className="bg-white rounded-xl shadow-lg border border-forest-200 overflow-hidden">
            {/* Desktop Table Skeleton */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-forest-50 border-b border-forest-200">
                  <tr>
                    <th className="px-6 py-4 text-left">
                      <div className="h-4 bg-forest-200 rounded animate-pulse w-20" />
                    </th>
                    <th className="px-6 py-4 text-left">
                      <div className="h-4 bg-forest-200 rounded animate-pulse w-16" />
                    </th>
                    <th className="px-6 py-4 text-left">
                      <div className="h-4 bg-forest-200 rounded animate-pulse w-20" />
                    </th>
                    <th className="px-6 py-4 text-left">
                      <div className="h-4 bg-forest-200 rounded animate-pulse w-24" />
                    </th>
                    <th className="px-6 py-4 text-left">
                      <div className="h-4 bg-forest-200 rounded animate-pulse w-24" />
                    </th>
                    <th className="px-6 py-4 text-center">
                      <div className="h-4 bg-forest-200 rounded animate-pulse w-16 mx-auto" />
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-forest-100">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-forest-10'}>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-forest-200 rounded animate-pulse w-28" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-forest-200 rounded animate-pulse w-24" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-forest-200 rounded animate-pulse w-20" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-6 bg-forest-200 rounded-full animate-pulse w-20" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-forest-200 rounded animate-pulse w-16" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-8 bg-forest-200 rounded-lg animate-pulse w-24 mx-auto" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards Skeleton */}
            <div className="md:hidden">
              {[1, 2, 3].map((i) => (
                <div 
                  key={i} 
                  className={`border-b border-forest-100 last:border-b-0 p-4 ${
                    i % 2 === 0 ? 'bg-white' : 'bg-forest-10'
                  }`}
                >
                  <div className="space-y-3">
                    <div>
                      <div className="h-3 bg-forest-200 rounded animate-pulse w-16 mb-2" />
                      <div className="h-4 bg-forest-200 rounded animate-pulse w-32" />
                    </div>
                    <div className="flex space-x-4">
                      <div className="flex-1">
                        <div className="h-3 bg-forest-200 rounded animate-pulse w-12 mb-2" />
                        <div className="h-4 bg-forest-200 rounded animate-pulse w-20" />
                      </div>
                      <div className="flex-1">
                        <div className="h-3 bg-forest-200 rounded animate-pulse w-16 mb-2" />
                        <div className="h-4 bg-forest-200 rounded animate-pulse w-16" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Back Navigation Skeleton */}
          <div className="mt-8">
            <div className="h-5 bg-forest-200 rounded animate-pulse w-32" />
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

  // Check if wallet is disconnected
  const isWalletDisconnected = !account;

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
          {isWalletDisconnected ? (
            <div className="p-12 text-center">
              <div className="max-w-md mx-auto">
                <svg className="w-16 h-16 mx-auto mb-4 text-forest-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <h3 className="text-xl font-display font-bold text-forest-800 mb-2">
                  Wallet Not Connected
                </h3>
                <p className="text-forest-600 mb-6">
                  Please connect your wallet to view and interact with routes.
                </p>
              </div>
            </div>
          ) : safeTokenData.routes.length === 0 ? (
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
                        Type
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
                            {displayRecipient(route.recipient, walletAddress)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-forest-100 text-forest-700 border border-forest-200">
                            {route.routeType === 'milestone-routes' ? 'Milestone' : 'Simple'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-forest-800">
                            {route.total}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-green-600">
                            {route.routeObjAddress ? (
                              <RouteBlockchainData
                                routeObjAddress={route.routeObjAddress}
                                decimals={route.decimals}
                                symbol={route.tokenSymbol}
                                refreshTrigger={refreshTrigger}
                                onCompletionStatusChange={(isComplete) => handleCompletionStatusChange(route.id, isComplete)}
                                onFullyApprovedStatusChange={(isFullyApproved) => handleFullyApprovedStatusChange(route.id, isFullyApproved)}
                              />
                            ) : (
                              route.remaining
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-forest-100 text-forest-700 border border-forest-200">
                            {route.payoutPeriod}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-forest-800">
                            {route.payoutAmount}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-2">
                            {/* Claim button for beneficiaries */}
                            {route.isIncoming && !routeCompletionStatus.get(route.id) ? (
                              <button
                                onClick={() => handleClaim(route.id)}
                                disabled={claimingRouteId === route.id || !route.routeObjAddress}
                                className={`inline-flex items-center px-4 py-2 text-xs font-display font-bold uppercase tracking-wider rounded-lg transition-all duration-200 shadow-md ${
                                  claimingRouteId === route.id || !route.routeObjAddress
                                    ? 'bg-forest-300 text-forest-600 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-sunset-500 to-sunset-600 hover:from-sunset-600 hover:to-sunset-700 text-primary-100 transform hover:scale-105 hover:shadow-lg'
                                }`}
                              >
                                {claimingRouteId === route.id ? (
                                  <>
                                    <div className="inline-block animate-spin rounded-full h-3 w-3 border-b-2 border-primary-100 mr-2"></div>
                                    Claiming...
                                  </>
                                ) : (
                                  'Claim Payout'
                                )}
                              </button>
                            ) : routeCompletionStatus.get(route.id) ? (
                              <span className="text-xs text-green-600 font-display uppercase font-semibold">
                                ✓ Completed
                              </span>
                            ) : (
                              <span className="text-xs text-forest-400 font-display uppercase">
                                —
                              </span>
                            )}
                            
                            {/* Approve button or status for milestone route depositors */}
                            {route.routeType === 'milestone-routes' && 
                             walletAddress && 
                             route.sender === walletAddress && 
                             !routeCompletionStatus.get(route.id) && (
                              routeFullyApprovedStatus.get(route.id) ? (
                                <span className="text-xs text-green-600 font-display uppercase font-semibold">
                                  ✓ Fully Approved
                                </span>
                              ) : (
                                <button
                  onClick={() => {
                    setApproveModalRouteId(route.id);
                    setApproveAmount('');
                    setCurrentApprovedAmount('0');
                  }}
                                  disabled={!route.routeObjAddress}
                                  className={`inline-flex items-center px-4 py-2 text-xs font-display font-bold uppercase tracking-wider rounded-lg transition-all duration-200 shadow-md ${
                                    !route.routeObjAddress
                                      ? 'bg-forest-300 text-forest-600 cursor-not-allowed'
                                      : 'bg-gradient-to-r from-sunset-500 to-sunset-600 hover:from-sunset-600 hover:to-sunset-700 text-primary-100 transform hover:scale-105 hover:shadow-lg'
                                  }`}
                                >
                                  Approve
                                </button>
                              )
                            )}
                          </div>
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
                                {displayRecipient(route.recipient, walletAddress)}
                              </div>
                            </div>
                            
                            {/* Route Type */}
                            <div className="mb-3">
                              <div className="text-xs font-display font-semibold text-forest-600 uppercase tracking-wide mb-1">
                                Type
                              </div>
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-forest-100 text-forest-700 border border-forest-200">
                                {route.routeType === 'milestone-routes' ? 'Milestone' : 'Simple'}
                              </span>
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
                                  {route.routeObjAddress ? (
                                    <RouteBlockchainData
                                      routeObjAddress={route.routeObjAddress}
                                      decimals={route.decimals}
                                      symbol={route.tokenSymbol}
                                      refreshTrigger={refreshTrigger}
                                      onCompletionStatusChange={(isComplete) => handleCompletionStatusChange(route.id, isComplete)}
                                      onFullyApprovedStatusChange={(isFullyApproved) => handleFullyApprovedStatusChange(route.id, isFullyApproved)}
                                    />
                                  ) : (
                                    route.remaining
                                  )}
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
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-forest-100 text-forest-700 border border-forest-200">
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
                            {route.isIncoming && !routeCompletionStatus.get(route.id) && (
                              <div>
                                <div className="text-xs font-display font-semibold text-forest-600 uppercase tracking-wide mb-2">
                                  Claim Payout
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleClaim(route.id);
                                  }}
                                  disabled={claimingRouteId === route.id || !route.routeObjAddress}
                                  className={`w-full px-4 py-3 text-sm font-display font-bold uppercase tracking-wider rounded-lg transition-all duration-200 shadow-md flex items-center justify-center ${
                                    claimingRouteId === route.id || !route.routeObjAddress
                                      ? 'bg-forest-300 text-forest-600 cursor-not-allowed'
                                      : 'bg-gradient-to-r from-sunset-500 to-sunset-600 hover:from-sunset-600 hover:to-sunset-700 text-primary-100 active:scale-95'
                                  }`}
                                >
                                  {claimingRouteId === route.id ? (
                                    <>
                                      <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-primary-100 mr-2"></div>
                                      Claiming...
                                    </>
                                  ) : (
                                    'Claim Payout'
                                  )}
                                </button>
                              </div>
                            )}
                            
                            {/* Approve Button or Status for Mobile - Milestone Routes Only */}
                            {route.routeType === 'milestone-routes' && 
                             walletAddress && 
                             route.sender === walletAddress && 
                             !routeCompletionStatus.get(route.id) && (
                              <div>
                                <div className="text-xs font-display font-semibold text-forest-600 uppercase tracking-wide mb-2">
                                  Approve Milestone
                                </div>
                                {routeFullyApprovedStatus.get(route.id) ? (
                                  <div className="text-center py-3 text-sm text-green-600 font-display uppercase font-semibold">
                                    ✓ Fully Approved
                                  </div>
                                ) : (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setApproveModalRouteId(route.id);
                                      setApproveAmount('');
                                      setCurrentApprovedAmount('0');
                                    }}
                                    disabled={!route.routeObjAddress}
                                    className={`w-full px-4 py-3 text-sm font-display font-bold uppercase tracking-wider rounded-lg transition-all duration-200 shadow-md flex items-center justify-center ${
                                      !route.routeObjAddress
                                        ? 'bg-forest-300 text-forest-600 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-sunset-500 to-sunset-600 hover:from-sunset-600 hover:to-sunset-700 text-primary-100 active:scale-95'
                                    }`}
                                  >
                                    Approve Payout
                                  </button>
                                )}
                              </div>
                            )}
                            
                            {/* Completed Status for Mobile */}
                            {routeCompletionStatus.get(route.id) && (
                              <div>
                                <div className="text-xs font-display font-semibold text-forest-600 uppercase tracking-wide mb-2">
                                  Status
                                </div>
                                <div className="text-center py-2 text-sm text-green-600 font-display uppercase font-semibold">
                                  ✓ Completed
                                </div>
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

      {/* Approval Modal */}
      {approveModalRouteId && (() => {
        const currentRoute = allRoutes?.find(r => r.id === approveModalRouteId);
        const totalDeposit = currentRoute 
          ? parseFloat(currentRoute.amount_token_units) / Math.pow(10, currentRoute.token.decimals) 
          : 0;
        const alreadyApproved = parseFloat(currentApprovedAmount) / Math.pow(10, currentRoute?.token.decimals || 6);
        const remainingToApprove = totalDeposit - alreadyApproved;
        const newApprovalAmount = parseFloat(approveAmount) || 0;
        const totalAfterApproval = alreadyApproved + newApprovalAmount;
        const isAmountValid = !approveAmount || totalAfterApproval <= totalDeposit;
        
        const setPercentage = (percent: number) => {
          const amount = (remainingToApprove * percent / 100).toFixed(6);
          setApproveAmount(amount);
        };
        
        return (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
              <h2 className="text-2xl font-display font-bold text-forest-800 mb-4">
                Approve Milestone Payout
              </h2>
              <p className="text-sm text-forest-600 mb-4">
                Enter the amount you want to approve for the beneficiary to claim. This will unlock additional funds for them to withdraw.
              </p>
              
              {/* Approval Status Info */}
              {!approvalDataLoading && (
                <div className="mb-6 p-4 bg-forest-50 border border-forest-200 rounded-lg">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-xs text-forest-600 uppercase tracking-wide mb-1">Total Deposit</div>
                      <div className="font-semibold text-forest-800">{totalDeposit.toFixed(6)} {tokenData?.symbol}</div>
                    </div>
                    <div>
                      <div className="text-xs text-forest-600 uppercase tracking-wide mb-1">Already Approved</div>
                      <div className="font-semibold text-forest-800">{alreadyApproved.toFixed(6)} {tokenData?.symbol}</div>
                    </div>
                    <div className="col-span-2 pt-2 border-t border-forest-200">
                      <div className="text-xs text-forest-600 uppercase tracking-wide mb-1">Remaining to Approve</div>
                      <div className="font-bold text-sunset-600">{remainingToApprove.toFixed(6)} {tokenData?.symbol}</div>
                    </div>
                  </div>
                </div>
              )}
              
              {approvalDataLoading && (
                <div className="mb-6 p-4 bg-forest-50 border border-forest-200 rounded-lg text-center">
                  <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-forest-600 mr-2"></div>
                  <span className="text-sm text-forest-600">Loading approval data...</span>
                </div>
              )}
              
              {/* Amount Input */}
              <div className="mb-4">
                <label htmlFor="approveAmount" className="block text-sm font-display font-semibold text-forest-700 mb-2">
                  Amount to Approve
                </label>
                <div className="relative">
                  <input
                    id="approveAmount"
                    type="number"
                    step="0.000001"
                    min="0"
                    max={remainingToApprove}
                    value={approveAmount}
                    onChange={(e) => setApproveAmount(e.target.value)}
                    placeholder="Enter amount"
                    disabled={approvalDataLoading}
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors text-forest-800 font-semibold ${
                      !isAmountValid 
                        ? 'border-red-500 focus:border-red-500' 
                        : 'border-forest-300 focus:border-sunset-500'
                    } ${approvalDataLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    autoFocus
                  />
                  {tokenData && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-forest-500 font-semibold">
                      {tokenData.symbol}
                    </div>
                  )}
                </div>
                {!isAmountValid && !approvalDataLoading && (
                  <p className="text-xs text-red-600 mt-1 font-semibold">
                    Total approval ({totalAfterApproval.toFixed(6)}) would exceed deposit ({totalDeposit.toFixed(6)}). 
                    Maximum you can approve: {remainingToApprove.toFixed(6)} {tokenData?.symbol}
                  </p>
                )}
                {isAmountValid && newApprovalAmount > 0 && !approvalDataLoading && (
                  <p className="text-xs text-sunset-600 mt-1 font-semibold">
                    After this approval: {totalAfterApproval.toFixed(6)} / {totalDeposit.toFixed(6)} {tokenData?.symbol}
                  </p>
                )}
                <p className="text-xs text-forest-500 mt-2">
                  This amount will be added to the approved total for the beneficiary to claim.
                </p>
              </div>
              
              {/* Quick Select Buttons */}
              <div className="mb-6">
                <label className="block text-sm font-display font-semibold text-forest-700 mb-2">
                  Quick Select
                </label>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    onClick={() => setPercentage(25)}
                    disabled={approvalDataLoading}
                    className="px-3 py-2 text-xs font-display font-bold uppercase bg-forest-100 hover:bg-forest-200 text-forest-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    25%
                  </button>
                  <button
                    onClick={() => setPercentage(50)}
                    disabled={approvalDataLoading}
                    className="px-3 py-2 text-xs font-display font-bold uppercase bg-forest-100 hover:bg-forest-200 text-forest-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    50%
                  </button>
                  <button
                    onClick={() => setPercentage(75)}
                    disabled={approvalDataLoading}
                    className="px-3 py-2 text-xs font-display font-bold uppercase bg-forest-100 hover:bg-forest-200 text-forest-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    75%
                  </button>
                  <button
                    onClick={() => setPercentage(100)}
                    disabled={approvalDataLoading}
                    className="px-3 py-2 text-xs font-display font-bold uppercase bg-sunset-100 hover:bg-sunset-200 text-sunset-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    MAX
                  </button>
                </div>
              </div>
            
            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setApproveModalRouteId(null);
                  setApproveAmount('');
                  setCurrentApprovedAmount('0');
                }}
                disabled={approvingRouteId !== null}
                className="flex-1 px-4 py-3 border-2 border-forest-300 text-forest-700 font-display font-bold uppercase tracking-wider rounded-lg hover:bg-forest-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                disabled={!approveAmount || parseFloat(approveAmount) <= 0 || !isAmountValid || approvingRouteId !== null || approvalDataLoading}
                className={`flex-1 px-4 py-3 font-display font-bold uppercase tracking-wider rounded-lg transition-all duration-200 shadow-md flex items-center justify-center ${
                  !approveAmount || parseFloat(approveAmount) <= 0 || !isAmountValid || approvingRouteId !== null || approvalDataLoading
                    ? 'bg-forest-300 text-forest-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-sunset-500 to-sunset-600 hover:from-sunset-600 hover:to-sunset-700 text-primary-100 transform hover:scale-105'
                }`}
              >
                {approvingRouteId !== null ? (
                  <>
                    <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-primary-100 mr-2"></div>
                    Approving...
                  </>
                ) : (
                  'Approve'
                )}
              </button>
            </div>
          </div>
        </div>
        );
      })()}

      <Footer />
    </div>
  );
}
