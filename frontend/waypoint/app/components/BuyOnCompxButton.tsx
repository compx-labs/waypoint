import React from "react";
import { BlockchainNetwork } from "../contexts/NetworkContext";

interface BuyOnCompxButtonProps {
  tokenSymbol: string;
  tokenContractAddress: string;
  network: BlockchainNetwork;
  hasBalance: boolean;
}

export const BuyOnCompxButton: React.FC<BuyOnCompxButtonProps> = ({
  tokenSymbol,
  tokenContractAddress,
  network,
  hasBalance,
}) => {
  // Only show button for Algorand network when user has no balance
  if (hasBalance || network !== BlockchainNetwork.ALGORAND) {
    return null;
  }

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const swapUrl = `https://app.compx.io/swap?asset_1=0&asset_2=${tokenContractAddress}`;
    window.open(swapUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex-shrink-0 ml-4 px-4 py-2 bg-gradient-to-r from-sunset-500 to-sunset-600 hover:from-sunset-600 hover:to-sunset-700 text-primary-100 font-display text-xs uppercase tracking-wider rounded-lg transition-all duration-200 border-2 border-sunset-400 flex items-center space-x-2 transform hover:scale-105"
    >
      <img
        src="/compx-logo-small.png"
        alt="Compx"
        className="w-6 h-6 rounded-full"
      />
      <span>Buy {tokenSymbol} on Compx</span>
      <svg
        className="w-3 h-3"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
        />
      </svg>
    </button>
  );
};

