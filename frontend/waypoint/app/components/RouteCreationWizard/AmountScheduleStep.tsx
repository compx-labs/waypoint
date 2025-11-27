import React, { useState, useEffect } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useWallet as useAlgorandWallet } from "@txnlab/use-wallet-react";
import {
  useAptosAccount,
  useAlgorandAccount,
} from "../../hooks/useQueries";
import { useAptos } from "../../contexts/AptosContext";
import { useAlgorand } from "../../contexts/AlgorandContext";
import { useNetwork, BlockchainNetwork } from "../../contexts/NetworkContext";
import { WizardStepProps } from "./types";
import { calculateFee, formatDuration } from "./utils";

export const AmountScheduleStep: React.FC<WizardStepProps> = ({
  data,
  updateData,
  onNext,
  onPrevious,
  routeType,
}) => {
  const { selectedNetwork } = useNetwork();
  
  // Check if this is an invoice route
  const isInvoiceRoute = routeType === "invoice-routes";

  // Aptos wallet and context
  const aptosWallet = useWallet();
  const { network: aptosNetwork } = useAptos();

  // Algorand wallet and context
  const algorandWallet = useAlgorandWallet();
  const { network: algorandNetwork, waypointClient: algorandWaypointClient } = useAlgorand();

  // State for Flux tier
  const [fluxTier, setFluxTier] = useState<number>(0);

  // Get current account address based on network
  const accountAddress =
    selectedNetwork === BlockchainNetwork.APTOS
      ? aptosWallet.account?.address?.toStringLong() || null
      : algorandWallet.activeAccount?.address || null;

  // Fetch account data based on network
  const { data: aptosAccountData } = useAptosAccount(
    selectedNetwork === BlockchainNetwork.APTOS ? accountAddress : null,
    aptosNetwork === "mainnet" ? "mainnet" : "devnet"
  );

  const { data: algorandAccountData } = useAlgorandAccount(
    selectedNetwork === BlockchainNetwork.ALGORAND ? accountAddress : null,
    algorandNetwork === "mainnet" ? "mainnet" : "testnet"
  );

  // Fetch Flux tier for Algorand users
  useEffect(() => {
    const fetchFluxTier = async () => {
      if (
        selectedNetwork === BlockchainNetwork.ALGORAND &&
        algorandWallet.activeAccount &&
        algorandWaypointClient
      ) {
        try {
          const tier = await algorandWaypointClient!.getUserFluxTier(algorandWallet.activeAccount.address);
          setFluxTier(tier);
        } catch (error) {
          console.error("Failed to fetch Flux tier:", error);
          setFluxTier(0);
        }
      } else {
        setFluxTier(0);
      }
    };

    fetchFluxTier();
  }, [selectedNetwork, algorandWallet.activeAccount, algorandWaypointClient]);

  const unlockUnits = [
    {
      value: "minutes" as const,
      label: "Minutes",
      description: "Every minute",
    },
    { value: "hours" as const, label: "Hours", description: "Every hour" },
    { value: "days" as const, label: "Days", description: "Every day" },
    { value: "weeks" as const, label: "Weeks", description: "Every week" },
    { value: "months" as const, label: "Months", description: "Every month" },
  ];

  // Get user's balance for the selected token (skip for invoice routes)
  const tokenBalance = isInvoiceRoute
    ? 0
    : selectedNetwork === BlockchainNetwork.APTOS
    ? aptosAccountData?.balances.find(
        (b) => b.symbol === data.selectedToken?.symbol
      )?.amount || 0
    : algorandAccountData?.balances.find(
        (b) => b.symbol === data.selectedToken?.symbol
      )?.amount || 0;

  const totalAmount = parseFloat(data.totalAmount || "0");

  // Calculate fee based on network, token, and Flux tier (skip for invoice routes)
  const feeCalc = isInvoiceRoute
    ? { feeAmount: 0, feePercentage: 0, feeBps: 0 }
    : calculateFee(
        totalAmount,
        selectedNetwork,
        data.selectedToken?.symbol || "",
        selectedNetwork === BlockchainNetwork.ALGORAND ? fluxTier : 0
      );
  const feeAmount = feeCalc.feeAmount;
  const feePercentage = feeCalc.feePercentage;

  const totalWithFee = totalAmount + feeAmount;
  const unlockAmount = parseFloat(data.unlockAmount || "0");
  const exceedsBalance = !isInvoiceRoute && totalWithFee > tokenBalance;
  const unlockExceedsTotal = unlockAmount > totalAmount;

  const canProceed =
    data.totalAmount &&
    data.unlockUnit &&
    data.unlockAmount &&
    !exceedsBalance &&
    !unlockExceedsTotal;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-bold text-primary-100 uppercase tracking-wider mb-2">
          Amount & Schedule
        </h2>
        <p className="text-primary-300 font-display text-sm">
          {isInvoiceRoute
            ? "Configure the invoice amount and payment schedule"
            : "Configure how much to send and the unlock schedule"}
        </p>
      </div>

      {/* Total Amount */}
      <div>
        <label className="block text-sm font-display font-semibold text-primary-100 uppercase tracking-wide mb-2">
          Total Amount
        </label>
        <div className="relative">
          <input
            type="number"
            step="0.01"
            placeholder="1000.00"
            value={data.totalAmount || ""}
            onChange={(e) => updateData({ totalAmount: e.target.value })}
            className={`w-full bg-forest-700 border-2 rounded-lg text-primary-100 font-display px-4 py-3 pr-20 focus:outline-none transition-colors ${
              exceedsBalance
                ? "border-sunset-500 focus:border-sunset-600"
                : "border-forest-500 focus:border-sunset-500"
            }`}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-4 space-x-2">
            {data.selectedToken?.logo_url && (
              <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center p-0.5">
                <img
                  src={data.selectedToken.logo_url}
                  alt={`${data.selectedToken.name} logo`}
                  className="w-full h-full object-contain"
                />
              </div>
            )}
            <span className="text-primary-300 font-display text-sm">
              {data.selectedToken?.symbol}
            </span>
          </div>
        </div>
        {!isInvoiceRoute && (
          <div className="mt-2 flex items-center justify-between text-xs font-display">
            <span className="text-primary-400">
              Available:{" "}
              {tokenBalance.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 6,
              })}{" "}
              {data.selectedToken?.symbol}
            </span>
            <button
              type="button"
              onClick={() => {
                const tempFeeCalc = calculateFee(
                  100,
                  selectedNetwork,
                  data.selectedToken?.symbol || "",
                  selectedNetwork === BlockchainNetwork.ALGORAND ? fluxTier : 0
                );
                const maxAmount = tokenBalance / (1 + tempFeeCalc.feePercentage);
                updateData({ totalAmount: maxAmount.toString() });
              }}
              className="text-sunset-400 hover:text-sunset-300 uppercase tracking-wide font-semibold transition-colors"
            >
              Max
            </button>
          </div>
        )}

        {/* Fee Display - Only show for non-invoice routes */}
        {!isInvoiceRoute && totalAmount > 0 && (
          <div className="mt-3 p-3 bg-forest-800 rounded-lg border border-forest-600">
            <div className="flex justify-between items-center text-xs font-display mb-1">
              <span className="text-primary-400">Route Amount</span>
              <span className="text-primary-100 font-semibold">
                {totalAmount.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 6,
                })}{" "}
                {data.selectedToken?.symbol}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs font-display mb-1">
              <span className="text-primary-400">
                Platform Fee ({(feePercentage * 100).toFixed(2)}%)
                {selectedNetwork === BlockchainNetwork.ALGORAND &&
                  fluxTier > 0 && (
                    <span className="text-green-400 ml-1">
                      (Flux Tier {fluxTier} discount applied)
                    </span>
                  )}
              </span>
              <span className="text-sunset-400 font-semibold">
                +{" "}
                {feeAmount.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 6,
                })}{" "}
                {data.selectedToken?.symbol}
              </span>
            </div>
            <div className="pt-2 mt-2 border-t border-forest-600">
              <div className="flex justify-between items-center text-sm font-display">
                <span className="text-primary-100 font-semibold uppercase tracking-wide">
                  Total Required
                </span>
                <span className="text-primary-100 font-bold">
                  {totalWithFee.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 6,
                  })}{" "}
                  {data.selectedToken?.symbol}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Info message for invoice routes */}
        {isInvoiceRoute && totalAmount > 0 && (
          <div className="mt-3 p-3 bg-primary-500 bg-opacity-20 border border-primary-400 border-opacity-30 rounded-lg">
            <div className="flex items-start space-x-2">
              <svg
                className="w-4 h-4 flex-shrink-0 mt-0.5 text-primary-300"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-xs text-primary-300 font-display">
                The payer will pay the invoice amount plus platform fee when they accept this invoice request.
              </span>
            </div>
          </div>
        )}

        {exceedsBalance && (
          <div className="mt-2 flex items-start space-x-2 text-xs text-sunset-400">
            <svg
              className="w-4 h-4 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span>
              Total amount (including fee) exceeds your available balance
            </span>
          </div>
        )}
      </div>

      {/* Unlock Unit */}
      <div>
        <label className="block text-sm font-display font-semibold text-primary-100 uppercase tracking-wide mb-2">
          Unlock Frequency
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {unlockUnits.map((unit) => (
            <button
              key={unit.value}
              onClick={() => updateData({ unlockUnit: unit.value })}
              className={`
                p-3 rounded-lg border-2 transition-all duration-200 text-left
                ${
                  data.unlockUnit === unit.value
                    ? "bg-forest-600 border-sunset-500 border-opacity-60"
                    : "bg-forest-700 border-forest-500 hover:border-sunset-500 border-opacity-30 hover:border-opacity-60"
                }
              `}
            >
              <div className="font-display font-semibold text-primary-100 text-sm uppercase tracking-wide">
                {unit.label}
              </div>
              <div className="text-primary-300 text-xs font-display">
                {unit.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Amount Per Unlock */}
      <div>
        <label className="block text-sm font-display font-semibold text-primary-100 uppercase tracking-wide mb-2">
          Amount Per {data.unlockUnit ? data.unlockUnit.slice(0, -1) : "Period"}
        </label>
        <div className="relative">
          <input
            type="number"
            step="0.01"
            placeholder="10.00"
            value={data.unlockAmount || ""}
            onChange={(e) => updateData({ unlockAmount: e.target.value })}
            className={`w-full bg-forest-700 border-2 rounded-lg text-primary-100 font-display px-4 py-3 pr-20 focus:outline-none transition-colors ${
              unlockExceedsTotal
                ? "border-sunset-500 focus:border-sunset-600"
                : "border-forest-500 focus:border-sunset-500"
            }`}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-4 space-x-2">
            {data.selectedToken?.logo_url && (
              <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center p-0.5">
                <img
                  src={data.selectedToken.logo_url}
                  alt={`${data.selectedToken.name} logo`}
                  className="w-full h-full object-contain"
                />
              </div>
            )}
            <span className="text-primary-300 font-display text-sm">
              {data.selectedToken?.symbol}
            </span>
          </div>
        </div>
        {unlockExceedsTotal && (
          <div className="mt-2 flex items-start space-x-2 text-xs text-sunset-400">
            <svg
              className="w-4 h-4 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span>Amount per period cannot exceed total amount</span>
          </div>
        )}
        {data.totalAmount &&
          data.unlockAmount &&
          data.unlockUnit &&
          !unlockExceedsTotal && (
            <div className="mt-2 text-xs text-primary-400 font-display">
              Duration:{" "}
              {formatDuration(
                parseFloat(data.totalAmount),
                parseFloat(data.unlockAmount),
                data.unlockUnit
              )}
            </div>
          )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <button
          onClick={onPrevious}
          className="px-6 py-3 bg-forest-600 hover:bg-forest-500 text-primary-100 font-display text-sm uppercase tracking-wider rounded-lg transition-all duration-200 border-2 border-forest-400"
        >
          ← Back
        </button>
        <button
          onClick={onNext}
          disabled={!canProceed}
          className={`px-6 py-3 font-display text-sm uppercase tracking-wider rounded-lg transition-all duration-200 border-2 ${
            canProceed
              ? "bg-sunset-500 hover:bg-sunset-600 text-primary-100 border-sunset-400"
              : "bg-forest-600 text-primary-400 border-forest-500 cursor-not-allowed opacity-50"
          }`}
        >
          Next →
        </button>
      </div>
    </div>
  );
};

