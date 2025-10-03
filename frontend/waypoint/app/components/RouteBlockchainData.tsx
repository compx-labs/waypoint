import { useEffect, useState } from "react";
import { useAptos, type RouteCore } from "../contexts/AptosContext";

interface RouteBlockchainDataProps {
  routeObjAddress: string | null;
  decimals: number;
  symbol: string;
  onDataLoaded?: (data: RouteCore | null) => void;
}

/**
 * Component that fetches and displays real-time blockchain data for a route
 */
export default function RouteBlockchainData({
  routeObjAddress,
  decimals,
  symbol,
  onDataLoaded,
}: RouteBlockchainDataProps) {
  const { getRouteCore } = useAptos();
  const [routeData, setRouteData] = useState<RouteCore | null>(null);
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
        const data = await getRouteCore(routeObjAddress);
        setRouteData(data);
        if (onDataLoaded) {
          onDataLoaded(data);
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
  }, [routeObjAddress, getRouteCore, onDataLoaded]);

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

  // Calculate amounts
  const depositedBigInt = BigInt(routeData.deposit_amount);
  const claimedBigInt = BigInt(routeData.claimed_amount);
  const remainingBigInt = depositedBigInt - claimedBigInt;

  // Convert to human-readable format
  const decimalsNum = BigInt(10 ** decimals);
  const deposited = Number(depositedBigInt) / Number(decimalsNum);
  const claimed = Number(claimedBigInt) / Number(decimalsNum);
  const remaining = Number(remainingBigInt) / Number(decimalsNum);

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
      </div>
      <div className="relative group">
        <svg
          className="w-4 h-4 text-green-500"
          fill="currentColor"
          viewBox="0 0 20 20"
          title="Live blockchain data"
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

