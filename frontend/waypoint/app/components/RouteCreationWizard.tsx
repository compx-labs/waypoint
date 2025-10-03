import React, { useState, useEffect } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import {
  useTokensByNetwork,
  useAddressBook,
  useAptosAccount,
} from "../hooks/useQueries";
import { useAptos } from "../contexts/AptosContext";
import { useToast } from "../contexts/ToastContext";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";

// Helper function to format duration in a human-readable way
const formatDuration = (
  totalAmount: number,
  unlockAmount: number,
  unlockUnit: string
): string => {
  const totalPeriods = Math.ceil(totalAmount / unlockAmount);

  switch (unlockUnit) {
    case "minutes":
      if (totalPeriods < 60) return `~${totalPeriods} minutes`;
      const minHours = Math.floor(totalPeriods / 60);
      const minRemainingMinutes = totalPeriods % 60;
      if (minHours < 24) {
        return minRemainingMinutes > 0
          ? `~${minHours}h ${minRemainingMinutes}m`
          : `~${minHours} hours`;
      }
      const minDays = Math.floor(minHours / 24);
      const minRemainingHours = minHours % 24;
      return minRemainingHours > 0
        ? `~${minDays}d ${minRemainingHours}h`
        : `~${minDays} days`;

    case "hours":
      if (totalPeriods < 24) return `~${totalPeriods} hours`;
      const hourDays = Math.floor(totalPeriods / 24);
      const hourRemainingHours = totalPeriods % 24;
      return hourRemainingHours > 0
        ? `~${hourDays}d ${hourRemainingHours}h`
        : `~${hourDays} days`;

    case "days":
      if (totalPeriods < 7) return `~${totalPeriods} days`;
      const dayWeeks = Math.floor(totalPeriods / 7);
      const dayRemainingDays = totalPeriods % 7;
      return dayRemainingDays > 0
        ? `~${dayWeeks}w ${dayRemainingDays}d`
        : `~${dayWeeks} weeks`;

    case "weeks":
      if (totalPeriods < 4) return `~${totalPeriods} weeks`;
      const weekMonths = Math.floor(totalPeriods / 4);
      const weekRemainingWeeks = totalPeriods % 4;
      return weekRemainingWeeks > 0
        ? `~${weekMonths}mo ${weekRemainingWeeks}w`
        : `~${weekMonths} months`;

    case "months":
      if (totalPeriods < 12) return `~${totalPeriods} months`;
      const monthYears = Math.floor(totalPeriods / 12);
      const monthRemainingMonths = totalPeriods % 12;
      return monthRemainingMonths > 0
        ? `~${monthYears}y ${monthRemainingMonths}mo`
        : `~${monthYears} years`;

    default:
      return `~${totalPeriods} ${unlockUnit}`;
  }
};

// Helper function to convert time units to seconds
const timeUnitToSeconds = (
  unit: "minutes" | "hours" | "days" | "weeks" | "months"
): number => {
  switch (unit) {
    case "minutes":
      return 60;
    case "hours":
      return 60 * 60;
    case "days":
      return 60 * 60 * 24;
    case "weeks":
      return 60 * 60 * 24 * 7;
    case "months":
      return 60 * 60 * 24 * 30; // Approximate
    default:
      return 60 * 60 * 24; // Default to days
  }
};

interface WizardStep {
  id: number;
  title: string;
  description: string;
  component: React.ComponentType<WizardStepProps>;
}

interface WizardStepProps {
  data: RouteFormData;
  updateData: (updates: Partial<RouteFormData>) => void;
  onNext: () => void;
  onPrevious: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

export interface RouteFormData {
  // Step 1: Token Selection
  selectedToken?: {
    id: number;
    symbol: string;
    name: string;
    contract_address: string;
    decimals: number;
    logo_url: string;
    network: string;
  };

  // Step 2: Amount & Schedule
  totalAmount?: string;
  unlockUnit?: "minutes" | "hours" | "days" | "weeks" | "months";
  unlockAmount?: string;

  // Step 3: Timing
  startTime?: Date;

  // Step 4: Recipient
  recipientAddress?: string;
}

interface RouteCreationWizardProps {
  routeType: string;
  onClose: () => void;
  onComplete: (data: RouteFormData) => void;
}

// Step Components
const TokenSelectionStep: React.FC<WizardStepProps> = ({
  data,
  updateData,
  onNext,
  isFirstStep,
  isLastStep,
}) => {
  const { account } = useWallet();
  const { network } = useAptos();

  // Use React Query to fetch tokens
  const {
    data: availableTokens = [],
    isLoading: loading,
    error: queryError,
  } = useTokensByNetwork("aptos");

  // Fetch Aptos account data
  const {
    data: aptosAccountData,
    isLoading: loadingAccount,
    error: accountError,
  } = useAptosAccount(
    account?.address?.toStringLong() || null,
    network === "mainnet" ? "mainnet" : "devnet"
  );

  const error =
    queryError instanceof Error
      ? queryError.message
      : queryError
        ? "Failed to load tokens"
        : null;

  // Helper function to get balance for a token
  const getTokenBalance = (tokenSymbol: string): number | null => {
    if (!aptosAccountData?.balances) return null;
    const balance = aptosAccountData.balances.find(
      (b) => b.symbol === tokenSymbol
    );
    return balance ? balance.amount : null;
  };

  // Check if user has any token balances
  const hasAnyBalance = availableTokens.some((token) => {
    const balance = getTokenBalance(token.symbol);
    return balance !== null && balance > 0;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-bold text-primary-100 uppercase tracking-wider mb-2">
          Select Token
        </h2>
        <p className="text-primary-300 font-display text-sm">
          Choose which stablecoin you want to route
        </p>
      </div>

      {error && (
        <div className="bg-sunset-900 bg-opacity-30 border-2 border-sunset-500 border-opacity-40 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <svg
              className="w-6 h-6 text-sunset-400 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <div className="flex-1">
              <h3 className="text-sm font-display font-semibold text-sunset-300 uppercase tracking-wide mb-1">
                Error Loading Tokens
              </h3>
              <p className="text-xs text-primary-300 font-display">{error}</p>
            </div>
          </div>
        </div>
      )}

      {!hasAnyBalance &&
        !loading &&
        !loadingAccount &&
        availableTokens.length > 0 && (
          <div className="bg-sunset-900 bg-opacity-30 border-2 border-sunset-500 border-opacity-40 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <svg
                className="w-6 h-6 text-sunset-400 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="flex-1">
                <h3 className="text-sm font-display font-semibold text-sunset-300 uppercase tracking-wide mb-1">
                  No Token Balance
                </h3>
                <p className="text-xs text-primary-300 font-display">
                  You don't have any of the supported stablecoins in your
                  wallet. Please acquire some tokens before creating a route.
                </p>
              </div>
            </div>
          </div>
        )}

      {(loading || loadingAccount) && availableTokens.length === 0 && (
        <div className="grid grid-cols-1 gap-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center p-4 rounded-xl border-2 border-forest-600 bg-gradient-to-r from-forest-700 to-forest-600"
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-forest-600 animate-pulse mr-4" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-forest-600 rounded animate-pulse w-16" />
                <div className="h-3 bg-forest-600 rounded animate-pulse w-24" />
                <div className="h-3 bg-forest-600 rounded animate-pulse w-32" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && !loadingAccount && (
        <div className="grid grid-cols-1 gap-3">
        {availableTokens.map((token) => {
          const balance = getTokenBalance(token.symbol);
          const hasBalance = balance !== null && balance > 0;
          return (
            <button
              key={token.id}
              onClick={() => {
                if (hasBalance) {
                  updateData({ selectedToken: token });
                  setTimeout(() => onNext(), 150);
                }
              }}
              disabled={!hasBalance}
              className={`
              flex items-center p-4 rounded-xl border-2 transition-all duration-200 text-left
              ${
                !hasBalance
                  ? "bg-forest-800 border-forest-600 opacity-50 cursor-not-allowed"
                  : data.selectedToken?.id === token.id
                    ? "bg-gradient-to-r from-forest-600 to-forest-500 border-sunset-500 border-opacity-60"
                    : "bg-gradient-to-r from-forest-700 to-forest-600 border-forest-500 border-opacity-30 hover:border-opacity-60 hover:border-sunset-500"
              }
            `}
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white flex items-center justify-center mr-4 p-2">
                {token.logo_url ? (
                  <img
                    src={token.logo_url}
                    alt={`${token.name} logo`}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="text-forest-800 font-display font-bold text-lg">
                    {token.symbol.charAt(0)}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-display font-semibold text-primary-100 uppercase tracking-wide text-sm">
                  {token.symbol}
                </h3>
                <p className="text-primary-300 text-xs font-display">
                  {token.name}
                </p>
                {balance !== null && (
                  <p className="text-sunset-400 text-xs font-display font-semibold mt-1">
                    Balance:{" "}
                    {balance.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 6,
                    })}
                  </p>
                )}
              </div>
              {data.selectedToken?.id === token.id && (
                <div className="flex-shrink-0 ml-4">
                  <svg
                    className="w-5 h-5 text-sunset-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
        </div>
      )}
    </div>
  );
};

const AmountScheduleStep: React.FC<WizardStepProps> = ({
  data,
  updateData,
  onNext,
  onPrevious,
  isFirstStep,
  isLastStep,
}) => {
  const { account } = useWallet();
  const { network } = useAptos();

  // Fetch Aptos account data to get balances
  const { data: aptosAccountData } = useAptosAccount(
    account?.address?.toStringLong() || null,
    network === "mainnet" ? "mainnet" : "devnet"
  );

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

  // Get user's balance for the selected token
  const tokenBalance =
    aptosAccountData?.balances.find(
      (b) => b.symbol === data.selectedToken?.symbol
    )?.amount || 0;

  const FEE_PERCENTAGE = 0.005; // 0.5%
  const totalAmount = parseFloat(data.totalAmount || "0");
  const feeAmount = totalAmount * FEE_PERCENTAGE;
  const totalWithFee = totalAmount + feeAmount;
  const unlockAmount = parseFloat(data.unlockAmount || "0");
  const exceedsBalance = totalWithFee > tokenBalance;
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
          Configure how much to send and the unlock schedule
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
              // Set amount to 99.5% of balance so that amount + 0.5% fee = balance
              const maxAmount = tokenBalance / (1 + FEE_PERCENTAGE);
              updateData({ totalAmount: maxAmount.toString() });
            }}
            className="text-sunset-400 hover:text-sunset-300 uppercase tracking-wide font-semibold transition-colors"
          >
            Max
          </button>
        </div>

        {/* Fee Display */}
        {totalAmount > 0 && (
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
              <span className="text-primary-400">Platform Fee (0.5%)</span>
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

const TimingStep: React.FC<WizardStepProps> = ({
  data,
  updateData,
  onNext,
  onPrevious,
  isFirstStep,
  isLastStep,
}) => {
  const canProceed = data.startTime;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-bold text-primary-100 uppercase tracking-wider mb-2">
          When to Start
        </h2>
        <p className="text-primary-300 font-display text-sm">
          Set when your route should begin routing tokens
        </p>
      </div>

      <div className="space-y-4">
        {/* Quick Options */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => {
              updateData({ startTime: new Date() });
            }}
            className={`
              p-4 rounded-lg border-2 transition-all duration-200 text-left
              ${
                data.startTime &&
                Math.abs(data.startTime.getTime() - new Date().getTime()) <
                  60000
                  ? "bg-forest-600 border-sunset-500 border-opacity-60"
                  : "bg-forest-700 border-forest-500 hover:border-sunset-500 border-opacity-30 hover:border-opacity-60"
              }
            `}
          >
            <div className="font-display font-semibold text-primary-100 text-sm uppercase tracking-wide">
              Start Now
            </div>
            <div className="text-primary-300 text-xs font-display">
              Begin immediately
            </div>
          </button>

          <button
            onClick={() => {
              const tomorrow = new Date();
              tomorrow.setDate(tomorrow.getDate() + 1);
              tomorrow.setHours(9, 0, 0, 0);
              updateData({ startTime: tomorrow });
            }}
            className={`
              p-4 rounded-lg border-2 transition-all duration-200 text-left
              ${
                data.startTime &&
                data.startTime.getDate() === new Date().getDate() + 1
                  ? "bg-forest-600 border-sunset-500 border-opacity-60"
                  : "bg-forest-700 border-forest-500 hover:border-sunset-500 border-opacity-30 hover:border-opacity-60"
              }
            `}
          >
            <div className="font-display font-semibold text-primary-100 text-sm uppercase tracking-wide">
              Tomorrow
            </div>
            <div className="text-primary-300 text-xs font-display">
              9:00 AM tomorrow
            </div>
          </button>
        </div>

        {/* Custom Date/Time */}
        <div>
          <label className="block text-sm font-display font-semibold text-primary-100 uppercase tracking-wide mb-2">
            Custom Date & Time
          </label>
          <input
            type="datetime-local"
            value={
              data.startTime ? data.startTime.toISOString().slice(0, 16) : ""
            }
            onChange={(e) =>
              updateData({ startTime: new Date(e.target.value) })
            }
            className="w-full bg-forest-700 border-2 border-forest-500 rounded-lg text-primary-100 font-display px-4 py-3 focus:border-sunset-500 focus:outline-none transition-colors"
          />
        </div>

        {data.startTime && (
          <div className="p-4 bg-forest-800 rounded-lg border border-forest-600">
            <div className="text-sm font-display text-primary-100 mb-1">
              Route will start:
            </div>
            <div className="text-primary-300 font-display text-sm">
              {data.startTime.toLocaleString()}
            </div>
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

const RecipientStep: React.FC<WizardStepProps> = ({
  data,
  updateData,
  onNext,
  onPrevious,
  isFirstStep,
  isLastStep,
}) => {
  const { account } = useWallet();
  const [showAddressBook, setShowAddressBook] = useState(false);

  const canProceed = data.recipientAddress && data.recipientAddress.length > 0;

  // Get owner wallet address
  const ownerWallet = account?.address?.toString() || null;

  // Use React Query to fetch address book entries
  const { data: addressBookEntries = [], isLoading: loadingAddressBook } =
    useAddressBook(ownerWallet, {
      enabled: !!ownerWallet,
    });

  const selectFromAddressBook = (address: string) => {
    updateData({ recipientAddress: address });
    setShowAddressBook(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-bold text-primary-100 uppercase tracking-wider mb-2">
          Recipient
        </h2>
        <p className="text-primary-300 font-display text-sm">
          Who will receive this token route?
        </p>
      </div>

      <div>
        <label className="block text-sm font-display font-semibold text-primary-100 uppercase tracking-wide mb-2">
          Wallet Address
        </label>
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="0x1234567890abcdef..."
            value={data.recipientAddress || ""}
            onChange={(e) => updateData({ recipientAddress: e.target.value })}
            className="flex-1 bg-forest-700 border-2 border-forest-500 rounded-lg text-primary-100 font-display px-4 py-3 focus:border-sunset-500 focus:outline-none transition-colors"
          />
          {addressBookEntries.length > 0 && (
            <button
              type="button"
              onClick={() => setShowAddressBook(!showAddressBook)}
              className="px-4 py-3 bg-sunset-500 hover:bg-sunset-600 text-primary-100 rounded-lg transition-all duration-200 border-2 border-sunset-400 flex items-center space-x-2"
              title="Select from Address Book"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </button>
          )}
        </div>
        <div className="mt-2 text-xs text-primary-400 font-display">
          Enter the wallet address that will receive the token route
        </div>

        {/* Address Book Dropdown */}
        {showAddressBook && addressBookEntries.length > 0 && (
          <div className="mt-3 bg-forest-700 border-2 border-sunset-500 border-opacity-30 rounded-lg p-3 max-h-64 overflow-y-auto">
            <h4 className="text-xs font-display font-semibold text-primary-100 uppercase tracking-wide mb-2">
              Select from Address Book
            </h4>
            <div className="space-y-2">
              {addressBookEntries.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => selectFromAddressBook(entry.wallet_address)}
                  className="w-full text-left p-3 bg-forest-600 hover:bg-forest-500 rounded-lg transition-all duration-200 border border-forest-500 hover:border-sunset-500"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-display font-semibold text-primary-100">
                        {entry.name}
                      </p>
                      <p className="text-xs text-primary-300 font-mono truncate mt-1">
                        {entry.wallet_address}
                      </p>
                    </div>
                    <svg
                      className="w-5 h-5 text-sunset-500 flex-shrink-0 ml-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
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

const SummaryStep: React.FC<WizardStepProps> = ({
  data,
  updateData,
  onNext,
  onPrevious,
  isFirstStep,
  isLastStep,
}) => {
  const { account, signAndSubmitTransaction } = useWallet();
  const { network } = useAptos();
  const toast = useToast();

  // Fetch Aptos account data to check APT balance
  const { data: aptosAccountData } = useAptosAccount(
    account?.address?.toStringLong() || null,
    network === "mainnet" ? "mainnet" : "devnet"
  );

  const FEE_AMOUNT = 0.001; // APT
  const FEE_PERCENTAGE = 0.005; // 0.5% platform fee
  const [aptBalance, setAptBalance] = useState<number>(0);
  const [isBuilding, setIsBuilding] = useState<boolean>(false);
  const [buildError, setBuildError] = useState<string | null>(null);
  const [transactionStatus, setTransactionStatus] = useState<
    "idle" | "signing" | "confirming"
  >("idle");

  // Get user's balance for the selected token
  const tokenBalance =
    aptosAccountData?.balances.find(
      (b) => b.symbol === data.selectedToken?.symbol
    )?.amount || 0;

  // Fetch APT balance
  useEffect(() => {
    const fetchAptBalance = async () => {
      if (!account?.address) return;

      try {
        const { Aptos, AptosConfig, Network } = await import(
          "@aptos-labs/ts-sdk"
        );
        const aptosNetwork =
          network === "mainnet" ? Network.MAINNET : Network.DEVNET;
        const config = new AptosConfig({ network: aptosNetwork });
        const aptos = new Aptos(config);

        const accountAddress = account.address.toStringLong();
        const baseUrl =
          aptosNetwork === Network.MAINNET
            ? "https://fullnode.mainnet.aptoslabs.com"
            : "https://fullnode.devnet.aptoslabs.com";

        const response = await fetch(
          `${baseUrl}/v1/accounts/${accountAddress}/balance/0x1::aptos_coin::AptosCoin`
        );

        if (response.ok) {
          const balanceStr = await response.text();
          const balance = parseInt(balanceStr, 10) / Math.pow(10, 8); // APT has 8 decimals
          setAptBalance(balance);
        }
      } catch (error) {
        console.error("Failed to fetch APT balance:", error);
      }
    };

    fetchAptBalance();
  }, [account?.address, network]);

  const hasInsufficientGas = aptBalance < FEE_AMOUNT;

  // Check if user has sufficient token balance for route + fee
  const totalAmountValue = parseFloat(data.totalAmount || "0");
  const totalRequiredWithFee = totalAmountValue * (1 + FEE_PERCENTAGE);
  const hasInsufficientTokenBalance = totalRequiredWithFee > tokenBalance;

  const totalDuration =
    data.totalAmount && data.unlockAmount
      ? Math.ceil(parseFloat(data.totalAmount) / parseFloat(data.unlockAmount))
      : 0;

  const endDate =
    data.startTime && data.unlockUnit && totalDuration
      ? (() => {
          const end = new Date(data.startTime);
          switch (data.unlockUnit) {
            case "minutes":
              end.setMinutes(end.getMinutes() + totalDuration);
              break;
            case "hours":
              end.setHours(end.getHours() + totalDuration);
              break;
            case "days":
              end.setDate(end.getDate() + totalDuration);
              break;
            case "weeks":
              end.setDate(end.getDate() + totalDuration * 7);
              break;
            case "months":
              end.setMonth(end.getMonth() + totalDuration);
              break;
          }
          return end;
        })()
      : null;

  const handleCreateRoute = async () => {
    if (
      !account ||
      !data.selectedToken ||
      !data.totalAmount ||
      !data.unlockAmount ||
      !data.unlockUnit ||
      !data.startTime ||
      !data.recipientAddress
    ) {
      setBuildError("Missing required form data");
      return;
    }

    // Validate sufficient token balance (route amount + fee)
    const routeAmount = parseFloat(data.totalAmount);
    const platformFee = routeAmount * FEE_PERCENTAGE;
    const totalRequired = routeAmount + platformFee;

    if (totalRequired > tokenBalance) {
      setBuildError(
        `Insufficient ${data.selectedToken.symbol} balance. You need ${totalRequired.toFixed(6)} ${data.selectedToken.symbol} (${routeAmount.toFixed(6)} route + ${platformFee.toFixed(6)} fee) but only have ${tokenBalance.toFixed(6)} ${data.selectedToken.symbol}.`
      );
      return;
    }

    setIsBuilding(true);
    setBuildError(null);
    setTransactionStatus("signing");

    try {
      // Convert human-readable amounts to token units (considering decimals)
      const decimals = data.selectedToken.decimals;
      const amountInUnits = Math.floor(
        parseFloat(data.totalAmount) * Math.pow(10, decimals)
      );
      const payoutAmountInUnits = Math.floor(
        parseFloat(data.unlockAmount) * Math.pow(10, decimals)
      );

      // Convert start time to unix timestamp (seconds)
      const startTimestamp = Math.floor(data.startTime.getTime() / 1000);

      // Convert unlock period to seconds
      const periodInSeconds = timeUnitToSeconds(data.unlockUnit);

      // Calculate max periods
      const maxPeriods = Math.ceil(
        parseFloat(data.totalAmount) / parseFloat(data.unlockAmount)
      );

      // Platform fee: 0.5% of the route amount in the selected token's units
      const FEE_PERCENTAGE = 0.005; // 0.5%
      const feeAmountInUnits = Math.floor(
        parseFloat(data.totalAmount) * FEE_PERCENTAGE * Math.pow(10, decimals)
      );

      console.log("Building transaction with params:", {
        faObjectAddress: data.selectedToken.contract_address,
        amount: amountInUnits,
        start_ts: startTimestamp,
        period_secs: periodInSeconds,
        payout_amount: payoutAmountInUnits,
        max_periods: maxPeriods,
        fee_amount: feeAmountInUnits,
        beneficiary: data.recipientAddress,
      });

      // Build the transaction
      /* const transaction = await createLinearRoute(
        account.address,
        data.selectedToken.contract_address,
        amountInUnits,
        startTimestamp,
        periodInSeconds,
        payoutAmountInUnits,
        maxPeriods,
        feeAmountInUnits,
        data.recipientAddress,
        network === "mainnet" ? "mainnet" : "devnet"
      ); */

      const moduleAddress =
        "0x12dd47c0156dc2237a6e814b227bb664f54e85332ff636a64bc9dd1ce7d1bdb0";
      const moduleName = "linear_stream_fa";
      const functionName = "create_route_and_fund";

      // Configure Aptos SDK with the correct network
      const aptosNetwork = Network.MAINNET;
      const config = new AptosConfig({ network: aptosNetwork });
      const aptos = new Aptos(config);

      // Show loading toast
      const loadingToastId = toast.loading({
        title: "Creating Route",
        description: "Please confirm the transaction in your wallet...",
      });

      const response = await signAndSubmitTransaction({
        data: {
          function: `${moduleAddress}::${moduleName}::${functionName}`,
          functionArguments: [
            data.selectedToken.contract_address, // Object<Metadata> as address
            amountInUnits, // u64
            startTimestamp, // u64
            periodInSeconds, // u64
            payoutAmountInUnits, // u64
            maxPeriods, // u64
            feeAmountInUnits, // u64
            data.recipientAddress, // address
          ],
        },
      });

      // Transaction signed, now confirming
      setTransactionStatus("confirming");

      // Update toast to waiting for confirmation
      toast.update(loadingToastId, {
        title: "Transaction Submitted",
        description: "Waiting for blockchain confirmation...",
        type: "loading",
      });

      // Wait for transaction confirmation
      await aptos.waitForTransaction({ transactionHash: response.hash });

      // Success! Show success toast
      toast.update(loadingToastId, {
        title: "Route Created Successfully!",
        description: `Your ${data.selectedToken?.symbol} route has been created and is now active.`,
        type: "success",
      });

      // Wait a moment for user to see the success message
      setTimeout(() => {
        toast.dismiss(loadingToastId);
        // Navigate back to dashboard
        window.location.href = "/app";
      }, 2000);
    } catch (error) {
      console.error("Failed to create route:", error);
      
      // Determine error message
      let errorMessage = "Failed to create route. Please try again.";
      if (error instanceof Error) {
        if (error.message.includes("User rejected")) {
          errorMessage = "Transaction was rejected. Please try again if you'd like to create this route.";
        } else if (error.message.includes("Insufficient")) {
          errorMessage = "Insufficient funds to complete this transaction.";
        } else {
          errorMessage = error.message;
        }
      }
      
      setBuildError(errorMessage);
      
      // Show error toast
      toast.error({
        title: "Route Creation Failed",
        description: errorMessage,
        duration: 5000,
      });
    } finally {
      setIsBuilding(false);
      setTransactionStatus("idle");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-bold text-primary-100 uppercase tracking-wider mb-2">
          Review Route
        </h2>
        <p className="text-primary-300 font-display text-sm">
          Confirm your token route details before creating
        </p>
      </div>

      <div className="bg-forest-800 rounded-xl border-2 border-forest-600 p-6 space-y-4">
        {/* Token & Amount */}
        <div className="flex justify-between items-center pb-4 border-b border-forest-600">
          <div className="flex items-center">
            {data.selectedToken?.logo_url && (
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center mr-3 p-1">
                <img
                  src={data.selectedToken.logo_url}
                  alt={`${data.selectedToken.name} logo`}
                  className="w-full h-full object-contain"
                />
              </div>
            )}
            <div>
              <div className="text-sm font-display text-primary-400 uppercase tracking-wide">
                Token & Amount
              </div>
              <div className="text-lg font-display font-bold text-primary-100">
                {data.totalAmount} {data.selectedToken?.symbol}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-display text-primary-400 uppercase tracking-wide">
              Schedule
            </div>
            <div className="text-lg font-display font-bold text-primary-100">
              {data.unlockAmount} per {data.unlockUnit?.slice(0, -1)}
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm font-display text-primary-400 uppercase tracking-wide mb-1">
              Starts
            </div>
            <div className="text-primary-100 font-display">
              {data.startTime?.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-sm font-display text-primary-400 uppercase tracking-wide mb-1">
              Ends
            </div>
            <div className="text-primary-100 font-display">
              {endDate?.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Duration */}
        <div>
          <div className="text-sm font-display text-primary-400 uppercase tracking-wide mb-1">
            Duration
          </div>
          <div className="text-primary-100 font-display">
            {totalDuration} {data.unlockUnit} ({totalDuration} payments)
          </div>
        </div>

        {/* Recipient */}
        <div>
          <div className="text-sm font-display text-primary-400 uppercase tracking-wide mb-1">
            Recipient
          </div>
          <div className="text-primary-100 font-mono text-sm break-all">
            {data.recipientAddress}
          </div>
        </div>

        {/* Token Balance & Fee Breakdown */}
        <div className="pt-4 border-t border-forest-600">
          <div className="text-sm font-display text-primary-400 uppercase tracking-wide mb-3">
            Payment Breakdown
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-primary-300 font-display">
                Route Amount
              </span>
              <span className="text-primary-100 font-display font-semibold">
                {parseFloat(data.totalAmount || "0").toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 6,
                })}{" "}
                {data.selectedToken?.symbol}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-primary-300 font-display">
                Platform Fee (0.5%)
              </span>
              <span className="text-sunset-400 font-display font-semibold">
                +{" "}
                {(
                  parseFloat(data.totalAmount || "0") * FEE_PERCENTAGE
                ).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 6,
                })}{" "}
                {data.selectedToken?.symbol}
              </span>
            </div>
            <div className="pt-2 border-t border-forest-600 flex justify-between items-center">
              <span className="text-primary-100 font-display font-semibold uppercase tracking-wide">
                Total Required
              </span>
              <span className="text-primary-100 font-display font-bold">
                {(
                  parseFloat(data.totalAmount || "0") *
                  (1 + FEE_PERCENTAGE)
                ).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 6,
                })}{" "}
                {data.selectedToken?.symbol}
              </span>
            </div>
            <div className="pt-2 border-t border-forest-600 flex justify-between items-center">
              <span className="text-primary-300 font-display">
                Your Balance
              </span>
              <span
                className={`font-display font-semibold ${
                  tokenBalance >=
                  parseFloat(data.totalAmount || "0") * (1 + FEE_PERCENTAGE)
                    ? "text-green-400"
                    : "text-sunset-400"
                }`}
              >
                {tokenBalance.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 6,
                })}{" "}
                {data.selectedToken?.symbol}
              </span>
            </div>
          </div>
        </div>

        {/* Warnings */}
        <div className="pt-4 border-t border-forest-600">
          {hasInsufficientGas && (
            <div className="bg-sunset-900 bg-opacity-30 border border-sunset-500 border-opacity-40 rounded-lg p-3 mb-3">
              <div className="flex items-start space-x-2">
                <svg
                  className="w-5 h-5 text-sunset-400 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-display font-semibold text-sunset-300 uppercase tracking-wide">
                    Insufficient APT for Gas
                  </p>
                  <p className="text-xs text-primary-300 font-display mt-1">
                    You need at least {FEE_AMOUNT} APT to cover transaction
                    fees. Please add APT to your wallet.
                  </p>
                </div>
              </div>
            </div>
          )}
          {hasInsufficientTokenBalance && (
            <div className="mt-3 bg-sunset-900 bg-opacity-30 border border-sunset-500 border-opacity-40 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <svg
                  className="w-5 h-5 text-sunset-400 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-display font-semibold text-sunset-300 uppercase tracking-wide">
                    Insufficient {data.selectedToken?.symbol} Balance
                  </p>
                  <p className="text-xs text-primary-300 font-display mt-1">
                    You need {totalRequiredWithFee.toFixed(6)}{" "}
                    {data.selectedToken?.symbol} but only have{" "}
                    {tokenBalance.toFixed(6)} {data.selectedToken?.symbol}.
                    Please add more tokens to your wallet or reduce the route
                    amount.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Error Display */}
      {buildError && (
        <div className="bg-sunset-900 bg-opacity-30 border border-sunset-500 border-opacity-40 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <svg
              className="w-6 h-6 text-sunset-400 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <div className="flex-1">
              <h3 className="text-sm font-display font-semibold text-sunset-300 uppercase tracking-wide mb-1">
                Transaction Build Failed
              </h3>
              <p className="text-xs text-primary-300 font-display">
                {buildError}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <button
          onClick={onPrevious}
          disabled={isBuilding}
          className="px-6 py-3 bg-forest-600 hover:bg-forest-500 text-primary-100 font-display text-sm uppercase tracking-wider rounded-lg transition-all duration-200 border-2 border-forest-400 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Back
        </button>
        <button
          onClick={handleCreateRoute}
          disabled={
            hasInsufficientGas || hasInsufficientTokenBalance || isBuilding
          }
          className={`px-8 py-3 font-display text-sm uppercase tracking-wider rounded-lg transition-all duration-200 border-2 flex items-center space-x-2 ${
            hasInsufficientGas || hasInsufficientTokenBalance || isBuilding
              ? "bg-forest-600 text-primary-400 border-forest-500 cursor-not-allowed opacity-50"
              : "bg-gradient-to-r from-sunset-500 to-sunset-600 hover:from-sunset-600 hover:to-sunset-700 text-primary-100 border-sunset-400 transform hover:scale-105 shadow-lg"
          }`}
        >
          {isBuilding ? (
            <>
              <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-primary-100"></div>
              <span>
                {transactionStatus === "signing"
                  ? "Waiting for Signature..."
                  : transactionStatus === "confirming"
                    ? "Confirming..."
                    : "Processing..."}
              </span>
            </>
          ) : (
            <span>Sign & Create</span>
          )}
        </button>
      </div>
    </div>
  );
};

const wizardSteps: WizardStep[] = [
  {
    id: 1,
    title: "Token",
    description: "Choose your stablecoin",
    component: TokenSelectionStep,
  },
  {
    id: 2,
    title: "Amount",
    description: "Set amount & schedule",
    component: AmountScheduleStep,
  },
  {
    id: 3,
    title: "Timing",
    description: "When to start",
    component: TimingStep,
  },
  {
    id: 4,
    title: "Recipient",
    description: "Who receives it",
    component: RecipientStep,
  },
  {
    id: 5,
    title: "Review",
    description: "Confirm details",
    component: SummaryStep,
  },
];

export default function RouteCreationWizard({
  routeType,
  onClose,
  onComplete,
}: RouteCreationWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<RouteFormData>({});

  const updateFormData = (updates: Partial<RouteFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const handleNext = () => {
    if (currentStep < wizardSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Final step - create the route
      onComplete(formData);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const CurrentStepComponent = wizardSteps[currentStep].component;

  return (
    <div className="route-creation-wizard min-h-screen bg-primary-100 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onClose}
            className="flex items-center text-primary-800 hover:text-sunset-500 font-display text-sm uppercase tracking-wider mb-4 transition-colors"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Back to Dashboard
          </button>

          <h1 className="text-3xl lg:text-4xl font-display font-bold text-forest-800 uppercase tracking-wide mb-2">
            Create {routeType.replace("-", " ")} Route
          </h1>

          {/* Progress Indicator */}
          <div className="flex items-center justify-center space-x-2 mt-4">
            {wizardSteps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div
                  className={`
                  flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200
                  ${
                    index === currentStep
                      ? "bg-sunset-500 text-primary-100"
                      : index < currentStep
                        ? "bg-forest-600 text-primary-100"
                        : "bg-forest-200 text-forest-600"
                  }
                `}
                >
                  <div className="font-display font-bold text-xs">
                    {index < currentStep ? "✓" : step.id}
                  </div>
                  <div className="font-display text-xs uppercase tracking-wider hidden sm:block">
                    {step.title}
                  </div>
                </div>
                {index < wizardSteps.length - 1 && (
                  <div
                    className={`
                    h-0.5 w-4 transition-colors duration-200
                    ${index < currentStep ? "bg-forest-600" : "bg-forest-200"}
                  `}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-gradient-to-br from-forest-800 to-forest-900 rounded-xl border-2 border-forest-600 p-8 shadow-xl">
          <CurrentStepComponent
            data={formData}
            updateData={updateFormData}
            onNext={handleNext}
            onPrevious={handlePrevious}
            isFirstStep={currentStep === 0}
            isLastStep={currentStep === wizardSteps.length - 1}
          />
        </div>
      </div>
    </div>
  );
}
