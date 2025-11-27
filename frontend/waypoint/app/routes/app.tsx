import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import AppNavigation from "../components/AppNavigation";
import Footer from "../components/Footer";
import RouteCreationModal from "../components/RouteCreationModal";
import RoutesList, { type TokenRoute } from "../components/RoutesList";
import InvoiceCard from "../components/InvoiceCard";
import { useToast } from "../contexts/ToastContext";
import { useUnifiedWallet } from "../contexts/UnifiedWalletContext";
import { useAlgorand } from "../contexts/AlgorandContext";
import { useAptos } from "../contexts/AptosContext";
import { useRoutes } from "../hooks/useQueries";
import type { RouteData } from "../lib/api";
import { API_BASE_URL } from "../lib/constants";
import { useWallet as useAlgorandWallet } from "@txnlab/use-wallet-react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { BlockchainNetwork } from "../contexts/NetworkContext";
import { WaypointInvoiceClient } from "./waypoint-invoiceClient";
import { AlgorandClient } from "@algorandfoundation/algokit-utils";
import * as algokit from "@algorandfoundation/algokit-utils";
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
    USDC: "bg-gradient-to-br from-blue-500 to-blue-600",
    USDT: "bg-gradient-to-br from-green-500 to-green-600",
    xUSD: "bg-gradient-to-br from-sunset-500 to-sunset-600",
    USDY: "bg-gradient-to-br from-purple-500 to-purple-600",
    BUIDL: "bg-gradient-to-br from-yellow-500 to-yellow-600",
    MOD: "bg-gradient-to-br from-pink-500 to-pink-600",
  };
  return colorMap[symbol] || "bg-gradient-to-br from-forest-500 to-forest-600";
}

export default function AppDashboard() {
  useEffect(() => {
    document.title = "Waypoint App - Your Routes";
  }, []);

  const navigate = useNavigate();
  const { account, connected } = useUnifiedWallet();
  const { waypointClient: algorandWaypointClient } = useAlgorand();
  const { waypointClient: aptosWaypointClient } = useAptos();
  const { transactionSigner } = useAlgorandWallet();
  const { signAndSubmitTransaction } = useWallet();
  const toast = useToast();

  // Initialize Aptos client for waiting for transactions
  const aptos = new Aptos(new AptosConfig({ network: Network.MAINNET }));
  const [isRouteModalOpen, setIsRouteModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"routes" | "invoices">("routes");

  // Fetch routes using React Query with automatic refetching
  const {
    data: allRoutes,
    isLoading: loading,
    error: fetchError,
    refetch,
  } = useRoutes({
    refetchOnMount: "always", // Always refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window regains focus
  });

  // Helper function to check if a route is completed based on timing
  const isRouteCompleted = (route: RouteData): boolean => {
    // If explicitly marked as completed or cancelled, it's done
    if (route.status === "completed" || route.status === "cancelled") {
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
      case "minutes":
        endDate.setMinutes(
          endDate.getMinutes() + totalPeriods * frequencyNumber
        );
        break;
      case "hours":
        endDate.setHours(endDate.getHours() + totalPeriods * frequencyNumber);
        break;
      case "days":
        endDate.setDate(endDate.getDate() + totalPeriods * frequencyNumber);
        break;
      case "weeks":
        endDate.setDate(endDate.getDate() + totalPeriods * frequencyNumber * 7);
        break;
      case "months":
        endDate.setMonth(endDate.getMonth() + totalPeriods * frequencyNumber);
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
    // Exclude invoice routes that are pending (not yet approved) - they should only appear in invoices tab
    const userRoutes = allRoutes.filter((route) => {
      const isUserRoute =
        route.sender === walletAddress || route.recipient === walletAddress;
      const isPendingInvoice =
        route.route_type === "invoice-routes" && route.status === "pending";
      return isUserRoute && !isPendingInvoice;
    });

    // Group by token and calculate stats
    const tokenMap = new Map<
      number,
      {
        token: RouteData["token"];
        incoming: RouteData[];
        outgoing: RouteData[];
        completed: RouteData[];
      }
    >();

    userRoutes.forEach((route) => {
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
    const routes: TokenRoute[] = Array.from(tokenMap.entries()).map(
      ([tokenId, data]) => {
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
          logoSrc: data.token.logo_url || "/logo.svg",
          tvl: formatCurrency(tvl),
          totalRoutes:
            data.incoming.length + data.outgoing.length + data.completed.length,
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
      }
    );

    return routes;
  }, [account, allRoutes]);

  const error = fetchError
    ? fetchError instanceof Error
      ? fetchError.message
      : "Failed to fetch routes"
    : null;

  // Filter invoices (sent and received)
  const sentInvoices = useMemo(() => {
    if (!account || !allRoutes) return [];
    return allRoutes.filter(
      (route) =>
        route.route_type === "invoice-routes" && route.sender === account
    );
  }, [account, allRoutes]);

  const receivedInvoices = useMemo(() => {
    if (!account || !allRoutes) return [];
    return allRoutes.filter(
      (route) =>
        route.route_type === "invoice-routes" && route.payer_address === account
    );
  }, [account, allRoutes]);

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

  const handleAcceptInvoice = async (routeAppId: bigint) => {
    console.log(
      "handleAcceptInvoice called with routeAppId:",
      routeAppId.toString()
    );
    console.log("account:", account);
    console.log("allRoutes:", allRoutes);

    if (!account) {
      toast.error({ title: "Wallet not connected" });
      return;
    }

    // Find the invoice in the current data - try multiple comparison methods
    const routeAppIdStr = routeAppId.toString();
    console.log("Looking for invoice with route_obj_address:", routeAppIdStr);

    const invoice = allRoutes?.find((r) => {
      // Try direct string comparison
      if (r.route_obj_address === routeAppIdStr) return true;
      // Try BigInt comparison
      try {
        if (BigInt(r.route_obj_address as string) === routeAppId) return true;
      } catch (e) {
        // Ignore conversion errors
      }
      return false;
    });

    if (!invoice) {
      console.error(
        "Invoice not found. Available routes:",
        allRoutes?.map((r) => ({
          id: r.id,
          route_obj_address: r.route_obj_address,
          route_type: r.route_type,
          status: r.status,
        }))
      );
      toast.error({ title: "Invoice not found" });
      return;
    }

    console.log(
      "Found invoice:",
      invoice.id,
      "network:",
      invoice.token?.network
    );

    // Determine the invoice's network
    const invoiceNetwork =
      invoice.token?.network === "aptos"
        ? BlockchainNetwork.APTOS
        : BlockchainNetwork.ALGORAND;
    const isAptosInvoice = invoiceNetwork === BlockchainNetwork.APTOS;
    const isAlgorandInvoice = invoiceNetwork === BlockchainNetwork.ALGORAND;

    console.log(
      "Invoice network:",
      invoiceNetwork,
      "isAptos:",
      isAptosInvoice,
      "isAlgorand:",
      isAlgorandInvoice
    );

    // Validate network-specific requirements
    if (isAlgorandInvoice && (!algorandWaypointClient || !transactionSigner)) {
      toast.error({ title: "Algorand wallet not connected" });
      return;
    }

    if (isAptosInvoice && (!aptosWaypointClient || !signAndSubmitTransaction)) {
      toast.error({ title: "Aptos wallet not connected" });
      return;
    }

    // Show loading toast
    let loadingToastId: string | undefined;
    try {
      loadingToastId = toast.loading({ title: "Accepting invoice..." });
    } catch (toastError) {
      console.error("Error creating toast:", toastError);
      // Continue without toast if there's an issue
    }

    try {
      if (isAptosInvoice) {
        // Aptos: Build and submit fund invoice transaction
        console.log("Building Aptos fund invoice transaction...");
        const transactionPayload =
          await aptosWaypointClient!.buildFundInvoiceTransaction({
            routeAddress: invoice.route_obj_address ?? "",
            payer: account,
          });

        console.log("Submitting Aptos transaction...");
        const response = await signAndSubmitTransaction!({
          data: transactionPayload,
        });

        console.log("Aptos transaction submitted, hash:", response.hash);

        // Wait for transaction confirmation
        await aptos.waitForTransaction({ transactionHash: response.hash });
        console.log("Aptos transaction confirmed");
      } else {
        // Algorand: Use acceptInvoiceRoute
        const algorand = algokit.AlgorandClient.mainNet();
        const appClient = new WaypointInvoiceClient({
          algorand: algorand,
          appId: routeAppId,
          defaultSender: account,
        });
        appClient.algorand.setDefaultSigner(transactionSigner!);
        const axfer = appClient.algorand.createTransaction.assetTransfer({
          amount: BigInt(invoice.amount_token_units),
          sender: account,
          receiver: appClient.appAddress,
          assetId: BigInt(760037151),
        });

        console.log("Building Algorand transaction...");

        await appClient.send.acceptRoute({
          args: {tokenTransfer: axfer},
          populateAppCallResources: true,
        })

        console.log("Algorand transaction successful");
      }

      console.log("Blockchain transaction successful, updating database...");

      // Step 2: Update database status
      const response = await fetch(`${API_BASE_URL}/api/routes/${invoice.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "active" }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Database update failed:", response.status, errorText);
        throw new Error(
          `Failed to update database: ${response.status} ${errorText}`
        );
      }

      console.log("Database updated successfully");

      // Step 3: Update toast and refetch
      if (loadingToastId) {
        toast.update(loadingToastId, {
          title: "Invoice accepted successfully!",
          type: "success",
        });
      } else {
        toast.success({ title: "Invoice accepted successfully!" });
      }

      // Refetch to get updated data
      refetch();
    } catch (error: any) {
      console.error("Error accepting invoice:", error);
      if (loadingToastId) {
        toast.update(loadingToastId, {
          title: error?.message || "Failed to accept invoice",
          type: "error",
        });
      } else {
        toast.error({ title: error?.message || "Failed to accept invoice" });
      }
      // Don't rethrow - we've handled the error
    }
  };

  const handleDeclineInvoice = async (routeAppId: bigint) => {
    console.log(
      "handleDeclineInvoice called with routeAppId:",
      routeAppId.toString()
    );
    console.log("account:", account);
    console.log("allRoutes:", allRoutes);

    if (!account) {
      toast.error({ title: "Wallet not connected" });
      return;
    }

    // Find the invoice in the current data - try multiple comparison methods
    const routeAppIdStr = routeAppId.toString();
    console.log("Looking for invoice with route_obj_address:", routeAppIdStr);

    const invoice = allRoutes?.find((r) => {
      // Try direct string comparison
      if (r.route_obj_address === routeAppIdStr) return true;
      // Try BigInt comparison
      try {
        if (BigInt(r.route_obj_address as string) === routeAppId) return true;
      } catch (e) {
        // Ignore conversion errors
      }
      return false;
    });

    if (!invoice) {
      console.error(
        "Invoice not found. Available routes:",
        allRoutes?.map((r) => ({
          id: r.id,
          route_obj_address: r.route_obj_address,
          route_type: r.route_type,
          status: r.status,
        }))
      );
      toast.error({ title: "Invoice not found" });
      return;
    }

    console.log(
      "Found invoice:",
      invoice.id,
      "network:",
      invoice.token?.network
    );

    // Determine the invoice's network
    const invoiceNetwork =
      invoice.token?.network === "aptos"
        ? BlockchainNetwork.APTOS
        : BlockchainNetwork.ALGORAND;
    const isAptosInvoice = invoiceNetwork === BlockchainNetwork.APTOS;
    const isAlgorandInvoice = invoiceNetwork === BlockchainNetwork.ALGORAND;

    console.log(
      "Invoice network:",
      invoiceNetwork,
      "isAptos:",
      isAptosInvoice,
      "isAlgorand:",
      isAlgorandInvoice
    );

    // Validate network-specific requirements for Algorand
    if (isAlgorandInvoice && (!algorandWaypointClient || !transactionSigner)) {
      toast.error({ title: "Algorand wallet not connected" });
      return;
    }

    // Show loading toast
    let loadingToastId: string | undefined;
    try {
      loadingToastId = toast.loading({ title: "Declining invoice..." });
    } catch (toastError) {
      console.error("Error creating toast:", toastError);
      // Continue without toast if there's an issue
    }

    try {
      if (isAptosInvoice) {
        // Aptos: Only update database (no on-chain decline function)
        console.log("Aptos invoice decline - updating database only");
      } else {
        // Algorand: Decline on blockchain via SDK
        console.log("Calling algorandWaypointClient.declineInvoiceRoute...");
        await algorandWaypointClient!.declineInvoiceRoute({
          routeAppId,
          payer: account,
          signer: transactionSigner!,
        });
        console.log("Algorand decline transaction successful");
      }

      console.log("Updating database...");

      // Update database status
      const response = await fetch(`${API_BASE_URL}/api/routes/${invoice.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "declined" }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Database update failed:", response.status, errorText);
        throw new Error(
          `Failed to update database: ${response.status} ${errorText}`
        );
      }

      console.log("Database updated successfully");

      // Update toast and refetch
      if (loadingToastId) {
        toast.update(loadingToastId, {
          title: "Invoice declined",
          type: "info",
        });
      } else {
        toast.success({ title: "Invoice declined" });
      }

      // Refetch to get updated data
      refetch();
    } catch (error: any) {
      console.error("Error declining invoice:", error);
      if (loadingToastId) {
        toast.update(loadingToastId, {
          title: error?.message || "Failed to decline invoice",
          type: "error",
        });
      } else {
        toast.error({ title: error?.message || "Failed to decline invoice" });
      }
      // Don't rethrow - we've handled the error
    }
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

          {/* Tabs */}
          {account && (
            <div className="flex space-x-2 border-b-2 border-forest-300 mb-6">
              <button
                onClick={() => setActiveTab("routes")}
                className={`px-6 py-3 font-display font-bold text-sm uppercase tracking-wider transition-all ${
                  activeTab === "routes"
                    ? "text-forest-800 border-b-4 border-forest-600 -mb-0.5"
                    : "text-forest-600 hover:text-forest-800"
                }`}
              >
                Routes
              </button>
              <button
                onClick={() => setActiveTab("invoices")}
                className={`px-6 py-3 font-display font-bold text-sm uppercase tracking-wider transition-all relative ${
                  activeTab === "invoices"
                    ? "text-forest-800 border-b-4 border-forest-600 -mb-0.5"
                    : "text-forest-600 hover:text-forest-800"
                }`}
              >
                Invoices
                {receivedInvoices.filter((inv) => inv.status === "pending")
                  .length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-sunset-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {
                      receivedInvoices.filter((inv) => inv.status === "pending")
                        .length
                    }
                  </span>
                )}
              </button>
            </div>
          )}
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
            <p className="text-red-700 font-display font-semibold mb-2">
              Error loading routes
            </p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* No Wallet Connected */}
        {!account && !loading && (
          <div className="bg-forest-100 border-2 border-forest-400 rounded-lg p-8 text-center">
            <svg
              className="w-16 h-16 mx-auto mb-4 text-forest-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              />
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
            <svg
              className="w-16 h-16 mx-auto mb-4 text-forest-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
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

        {/* Routes Tab Content */}
        {activeTab === "routes" &&
          !loading &&
          !error &&
          tokenRoutes.length > 0 && <RoutesList tokenRoutes={tokenRoutes} />}

        {/* Invoices Tab Content */}
        {activeTab === "invoices" && !loading && !error && account && (
          <div className="space-y-8">
            {/* Received Invoices (To Pay) */}
            <div>
              <h2 className="text-2xl font-display font-bold text-forest-800 uppercase tracking-wide mb-4 flex items-center">
                <svg
                  className="w-6 h-6 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M8.707 7.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l2-2a1 1 0 00-1.414-1.414L11 7.586V3a1 1 0 10-2 0v4.586l-.293-.293z" />
                  <path d="M3 5a2 2 0 012-2h1a1 1 0 010 2H5v7h2l1 2h4l1-2h2V5h-1a1 1 0 110-2h1a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5z" />
                </svg>
                Received Invoices
                {receivedInvoices.filter((inv) => inv.status === "pending")
                  .length > 0 && (
                  <span className="ml-2 text-sm text-sunset-600 font-normal">
                    (
                    {
                      receivedInvoices.filter((inv) => inv.status === "pending")
                        .length
                    }{" "}
                    pending)
                  </span>
                )}
              </h2>

              {receivedInvoices.length === 0 ? (
                <div className="bg-forest-100 border-2 border-forest-300 rounded-lg p-6 text-center">
                  <p className="text-forest-700 font-display">
                    No invoices received
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {receivedInvoices.map((invoice) => (
                    <InvoiceCard
                      key={invoice.id}
                      invoice={invoice}
                      currentUserAddress={account}
                      onAccept={handleAcceptInvoice}
                      onDecline={handleDeclineInvoice}
                      onStatusChange={refetch}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Sent Invoices */}
            <div>
              <h2 className="text-2xl font-display font-bold text-forest-800 uppercase tracking-wide mb-4 flex items-center">
                <svg
                  className="w-6 h-6 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path
                    fillRule="evenodd"
                    d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Sent Invoices
              </h2>

              {sentInvoices.length === 0 ? (
                <div className="bg-forest-100 border-2 border-forest-300 rounded-lg p-6 text-center">
                  <p className="text-forest-700 font-display">
                    No invoices sent
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {/* Don't pass onAccept/onDecline for sent invoices - requestor can't approve their own invoices */}
                  {sentInvoices.map((invoice) => (
                    <InvoiceCard
                      key={invoice.id}
                      invoice={invoice}
                      currentUserAddress={account}
                      onStatusChange={refetch}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Create Button - Fixed at Bottom */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-primary-100 via-primary-100/95 to-transparent p-4 pt-8">
        <button
          onClick={handleCreateRoute}
          disabled={!account}
          className="w-full bg-gradient-to-r from-forest-500 to-forest-600 hover:from-forest-600 hover:to-forest-700 text-primary-100 font-display text-base uppercase tracking-wider font-bold py-4 px-8 rounded-xl transition-all duration-200 ease-out active:scale-95 shadow-lg border-2 border-forest-400 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
          style={{
            touchAction: "manipulation",
            WebkitTapHighlightColor: "transparent",
          }}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clipRule="evenodd"
            />
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
