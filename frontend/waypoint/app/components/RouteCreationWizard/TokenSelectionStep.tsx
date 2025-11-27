import React from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useWallet as useAlgorandWallet } from "@txnlab/use-wallet-react";
import {
  useTokensByNetwork,
  useAptosAccount,
  useAlgorandAccount,
} from "../../hooks/useQueries";
import { useAptos } from "../../contexts/AptosContext";
import { useAlgorand } from "../../contexts/AlgorandContext";
import { useNetwork, BlockchainNetwork } from "../../contexts/NetworkContext";
import { BuyOnCompxButton } from "../BuyOnCompxButton";
import { GetOnOrbitalButton } from "../GetOnOrbitalButton";
import { WizardStepProps } from "./types";

export const TokenSelectionStep: React.FC<WizardStepProps> = ({
  data,
  updateData,
  onNext,
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
  const { network: algorandNetwork } = useAlgorand();

  // Get current account address based on network
  const accountAddress =
    selectedNetwork === BlockchainNetwork.APTOS
      ? aptosWallet.account?.address?.toStringLong() || null
      : algorandWallet.activeAccount?.address || null;

  // Use React Query to fetch tokens for the selected network
  const {
    data: availableTokens = [],
    isLoading: loading,
    error: queryError,
  } = useTokensByNetwork(
    selectedNetwork === BlockchainNetwork.APTOS ? "aptos" : "algorand"
  );

  // Fetch account data based on network
  const { data: aptosAccountData, isLoading: loadingAptosAccount } =
    useAptosAccount(
      selectedNetwork === BlockchainNetwork.APTOS ? accountAddress : null,
      aptosNetwork === "mainnet" ? "mainnet" : "devnet"
    );

  const { data: algorandAccountData, isLoading: loadingAlgorandAccount } =
    useAlgorandAccount(
      selectedNetwork === BlockchainNetwork.ALGORAND ? accountAddress : null,
      algorandNetwork === "mainnet" ? "mainnet" : "testnet"
    );

  const loadingAccount =
    selectedNetwork === BlockchainNetwork.APTOS
      ? loadingAptosAccount
      : loadingAlgorandAccount;

  const error =
    queryError instanceof Error
      ? queryError.message
      : queryError
      ? "Failed to load tokens"
      : null;

  // Helper function to get balance for a token
  const getTokenBalance = (tokenSymbol: string): number | null => {
    // Skip balance checks for invoice routes
    if (isInvoiceRoute) return null;
    
    if (selectedNetwork === BlockchainNetwork.APTOS) {
      if (!aptosAccountData?.balances) return null;
      const balance = aptosAccountData.balances.find(
        (b) => b.symbol === tokenSymbol
      );
      return balance ? balance.amount : null;
    } else {
      if (!algorandAccountData?.balances) return null;
      const balance = algorandAccountData.balances.find(
        (b) => b.symbol === tokenSymbol
      );
      return balance ? balance.amount : null;
    }
  };

  // Check if user has any token balances (skip for invoice routes)
  const hasAnyBalance = isInvoiceRoute || availableTokens.some((token) => {
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
          {isInvoiceRoute 
            ? "Choose which stablecoin you want to request payment in"
            : "Choose which stablecoin you want to route"}
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
            const hasBalance = isInvoiceRoute || (balance !== null && balance > 0);
            return (
              <div
                key={token.id}
                className={`
                  flex items-center p-4 rounded-xl border-2 transition-all duration-200
                  ${
                    !hasBalance
                      ? "bg-forest-800 border-forest-600"
                      : data.selectedToken?.id === token.id
                      ? "bg-gradient-to-r from-forest-600 to-forest-500 border-sunset-500 border-opacity-60 cursor-pointer"
                      : "bg-gradient-to-r from-forest-700 to-forest-600 border-forest-500 border-opacity-30 hover:border-opacity-60 hover:border-sunset-500 cursor-pointer"
                  }
                `}
                onClick={() => {
                  if (hasBalance || isInvoiceRoute) {
                    updateData({ selectedToken: token });
                    setTimeout(() => onNext(), 150);
                  }
                }}
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
                  {!isInvoiceRoute && balance !== null && hasBalance && (
                    <p className="text-sunset-400 text-xs font-display font-semibold mt-1">
                      Balance:{" "}
                      {balance.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 6,
                      })}
                    </p>
                  )}
                  {!isInvoiceRoute && token.symbol === "xUSD" && hasBalance && (
                    <p className="text-green-400 text-xs font-display font-semibold mt-1 flex items-center gap-1">
                      <svg
                        className="w-3 h-3"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      50% Fee Reduction
                    </p>
                  )}
                  {isInvoiceRoute && (
                    <p className="text-primary-400 text-xs font-display mt-1">
                      Request payment in {token.symbol}
                    </p>
                  )}
                </div>

                {/* Get token buttons for tokens without balance - aligned right */}
                {/* Don't show buy/get buttons for invoice routes since requester doesn't need tokens */}
                {!isInvoiceRoute && (
                  <>
                    {token.symbol === "cxUSD" || token.symbol === "cUSDC" ? (
                      <GetOnOrbitalButton
                        tokenSymbol={token.symbol}
                        tokenContractAddress={token.contract_address}
                        network={selectedNetwork}
                        hasBalance={hasBalance}
                      />
                    ) : (
                      <BuyOnCompxButton
                        tokenSymbol={token.symbol}
                        tokenContractAddress={token.contract_address}
                        network={selectedNetwork}
                        hasBalance={hasBalance}
                      />
                    )}
                  </>
                )}

                {/* Checkmark for selected token */}
                {data.selectedToken?.id === token.id && hasBalance && (
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
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

