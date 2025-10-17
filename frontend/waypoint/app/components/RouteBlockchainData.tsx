import { useEffect, useState } from "react";
import { useAptos, type RouteCore } from "../contexts/AptosContext";
import { useAlgorand, type AlgorandRouteCore } from "../contexts/AlgorandContext";

interface RouteBlockchainDataProps {
  routeObjAddress: string | null;
  decimals: number;
  symbol: string;
  network: string; // 'aptos' or 'algorand'
  refreshTrigger?: number;
  onDataLoaded?: (data: RouteCore | AlgorandRouteCore | null) => void;
  onCompletionStatusChange?: (isComplete: boolean) => void;
  onFullyApprovedStatusChange?: (isFullyApproved: boolean) => void;
}

/**
 * Component that fetches and displays real-time blockchain data for a route
 * Route type is automatically determined from the database by getRouteCore
 */
export default function RouteBlockchainData({
  routeObjAddress,
  decimals,
  symbol,
  network,
  refreshTrigger = 0,
  onDataLoaded,
  onCompletionStatusChange,
  onFullyApprovedStatusChange,
}: RouteBlockchainDataProps) {
  const { getRouteCore: getAptosRouteCore } = useAptos();
  const { getRouteCore: getAlgorandRouteCore } = useAlgorand();
  const [routeData, setRouteData] = useState<RouteCore | AlgorandRouteCore | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!routeObjAddress) {
      setRouteData(null);
      return;
    }

    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        // Use appropriate getRouteCore based on network
        const getRouteCore = network === 'algorand' ? getAlgorandRouteCore : getAptosRouteCore;
        const data = await getRouteCore(routeObjAddress!);
        setRouteData(data);
        if (onDataLoaded) {
          onDataLoaded(data);
        }
        
        // Check if route is complete (all tokens claimed)
        if (data && onCompletionStatusChange) {
          // Handle both Aptos (snake_case) and Algorand (camelCase) property names
          const depositAmount = 'deposit_amount' in data 
            ? BigInt(data.deposit_amount) 
            : BigInt(data.depositAmount);
          const claimedAmount = 'claimed_amount' in data
            ? BigInt(data.claimed_amount)
            : BigInt(data.claimedAmount);
          const isComplete = claimedAmount >= depositAmount;
          onCompletionStatusChange(isComplete);
        }
        
        // Check if milestone route is fully approved (Aptos only)
        if (data && onFullyApprovedStatusChange && 'approved_amount' in data && data.approved_amount !== undefined) {
          const depositAmount = BigInt(data.deposit_amount);
          const approvedAmount = BigInt(data.approved_amount);
          const isFullyApproved = approvedAmount >= depositAmount;
          onFullyApprovedStatusChange(isFullyApproved);
        }
      } catch (err) {
        console.error("Error fetching route blockchain data:", err);
        setError("Failed to fetch blockchain data");
      } finally {
        setLoading(false);
      }
    }

    fetchData();

    // Set up auto-refresh every minute
    const intervalId = setInterval(fetchData, 60000);

    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeObjAddress, network, refreshTrigger]); // Refetch when address, network, or refresh trigger changes

  if (loading && !routeData) {
    return (
      <span className="text-primary-400 text-xs">
        <span className="inline-block animate-pulse">●</span> Loading...
      </span>
    );
  }

  if (error || !routeData) {
    return null; // Silently fail - show DB data instead
  }

  // Calculate amounts - handle both Aptos (snake_case) and Algorand (camelCase)
  const depositedBigInt = 'deposit_amount' in routeData
    ? BigInt(routeData.deposit_amount)
    : BigInt(routeData.depositAmount);
  const claimedBigInt = 'claimed_amount' in routeData
    ? BigInt(routeData.claimed_amount)
    : BigInt(routeData.claimedAmount);
  const decimalsNum = BigInt(10 ** decimals);
  
  // For milestone routes, check if approved_amount exists (Aptos only)
  const isMilestone = 'approved_amount' in routeData && routeData.approved_amount !== undefined;
  const approvedBigInt = isMilestone ? BigInt(routeData.approved_amount!) : BigInt(0);
  
  console.log('RouteBlockchainData:', {
    network,
    isMilestone,
    approved_amount: 'approved_amount' in routeData ? routeData.approved_amount : 'N/A',
    deposit_amount: 'deposit_amount' in routeData ? routeData.deposit_amount : routeData.depositAmount,
    claimed_amount: 'claimed_amount' in routeData ? routeData.claimed_amount : routeData.claimedAmount,
    routeObjAddress
  });
  
  // Calculate remaining based on route type
  let remainingBigInt: bigint;
  let approvedRemaining = 0;
  
  if (isMilestone) {
    // For milestone routes: show amount available to claim (approved - claimed)
    remainingBigInt = approvedBigInt - claimedBigInt;
    // Also calculate total in escrow
    approvedRemaining = Number(depositedBigInt - claimedBigInt) / Number(decimalsNum);
  } else {
    // For simple routes: show total remaining (deposit - claimed)
    remainingBigInt = depositedBigInt - claimedBigInt;
  }

  // Convert to human-readable format
  const deposited = Number(depositedBigInt) / Number(decimalsNum);
  const claimed = Number(claimedBigInt) / Number(decimalsNum);
  const remaining = Number(remainingBigInt) / Number(decimalsNum);
  const approved = Number(approvedBigInt) / Number(decimalsNum);

  return (
    <div className="inline-flex items-center gap-2">
      <div className="flex flex-col">
        <span className="text-primary-800 font-semibold">
          {remaining.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 6,
          })}{" "}
          {symbol}
        </span>
        {claimed > 0 && (
          <span className="text-xs text-primary-400">
            Claimed: {claimed.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
          </span>
        )}
        {isMilestone && (
          <span className="text-xs text-green-600">
            Approved: {approved.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })} / {deposited.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
          </span>
        )}
      </div>
      <div className="relative group">
        <svg
          className="w-4 h-4 text-green-500"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-forest-900 text-primary-100 text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
          Live from blockchain
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-forest-900"></div>
        </div>
      </div>
    </div>
  );
}

