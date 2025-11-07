import React from "react";
import { BlockchainNetwork } from "../contexts/NetworkContext";

interface GetOnOrbitalButtonProps {
  tokenSymbol: string;
  tokenContractAddress: string;
  network: BlockchainNetwork;
  hasBalance: boolean;
}

export const GetOnOrbitalButton: React.FC<GetOnOrbitalButtonProps> = ({
  tokenSymbol,
  tokenContractAddress,
  network,
  hasBalance,
}) => {
  // Only show button for Algorand network when user has no balance
  // and only for cxUSD and cUSDC tokens
  if (
    hasBalance ||
    network !== BlockchainNetwork.ALGORAND ||
    (tokenSymbol !== "cxUSD" && tokenSymbol !== "cUSDC")
  ) {
    return null;
  }

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Update this URL to point to the correct Orbital Lending page
    const orbitalUrl = `https://orbital.compx.io/app/markets`;
    window.open(orbitalUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex-shrink-0 ml-4 px-4 py-2 bg-[#1a2332] border-2 border-[#66fcf1] text-[#66fcf1] font-display text-xs uppercase tracking-wider rounded-lg transition-all duration-200 flex items-center space-x-2 transform hover:scale-105 hover:opacity-90"
    >
      <img
        src="/orbital-logo-small.png"
        alt="Orbital"
        className="w-6 h-6 rounded-full"
      />
      <span>Get {tokenSymbol} on Orbital</span>
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

