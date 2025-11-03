import React, { useState, useEffect } from "react";
import { galaxyCardTypes, type GalaxyCardType } from "./galaxy-card-data";
import { useAlgorand } from "../contexts/AlgorandContext";
import { useUnifiedWallet } from "../contexts/UnifiedWalletContext";
import { BlockchainNetwork } from "../contexts/NetworkContext";
import { useWallet as useAlgorandWallet } from "@txnlab/use-wallet-react";

const GovernanceRewardsButtons: React.FC = () => {
  const { getUserFluxTier } = useAlgorand();
  const { account, currentNetwork, nfd } = useUnifiedWallet();
  const algorandWallet = useAlgorandWallet();
  const [galaxyCardImageUrl, setGalaxyCardImageUrl] = useState<string>("");
  const [loadingGalaxyCard, setLoadingGalaxyCard] = useState(false);
  const [fluxTier, setFluxTier] = useState<number>(0);
  const [loadingFluxTier, setLoadingFluxTier] = useState(false);

  // Only show for Algorand network
  if (currentNetwork !== BlockchainNetwork.ALGORAND) {
    return null;
  }

  // Fetch Galaxy Card data
  useEffect(() => {
    const fetchGalaxyCard = async () => {
      if (!account) {
        setGalaxyCardImageUrl("");
        return;
      }

      setLoadingGalaxyCard(true);
      try {
        const response = await fetch(
          `https://api-general.compx.io/api/galaxy-card/${account}`
        );
        if (response.ok) {
          const galaxyCardData = await response.json();
          if (galaxyCardData) {
            const imageUrl =
              galaxyCardTypes.find(
                (card: GalaxyCardType) =>
                  card.name === galaxyCardData.name &&
                  card.level == galaxyCardData.level
              )?.imageURL || "";
            setGalaxyCardImageUrl(imageUrl);
          }
        }
      } catch (error) {
        console.error("Failed to fetch galaxy card:", error);
        setGalaxyCardImageUrl("");
      } finally {
        setLoadingGalaxyCard(false);
      }
    };

    fetchGalaxyCard();
  }, [account]);

  // Fetch FLUX tier data
  useEffect(() => {
    const fetchFluxTier = async () => {
      if (!account) {
        setFluxTier(0);
        return;
      }

      setLoadingFluxTier(true);
      try {
        const tier = await getUserFluxTier(account);
        setFluxTier(tier);
      } catch (error) {
        console.error("Failed to fetch FLUX tier:", error);
        setFluxTier(0);
      } finally {
        setLoadingFluxTier(false);
      }
    };

    fetchFluxTier();
  }, [account, getUserFluxTier]);

  // Get wallet icon
  const walletIcon = algorandWallet.activeWallet?.metadata.icon;

  return (
    <div className="flex items-center gap-3 pb-3 border-b border-forest-700">
      {/* NFD Avatar or Wallet Icon */}
      <div className="w-10 h-10 bg-gradient-to-br from-forest-700 to-forest-800 rounded-full flex items-center justify-center border-2 border-forest-600 overflow-hidden flex-shrink-0">
        {nfd?.avatar ? (
          <img
            src={nfd.avatar}
            alt="NFD Avatar"
            className="w-full h-full object-cover rounded-full"
            onError={(e) => {
              // Fallback to wallet icon if avatar fails to load
              if (walletIcon) {
                e.currentTarget.src = walletIcon;
                e.currentTarget.className = "w-6 h-6 object-contain rounded-full";
              } else {
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement!.innerHTML = '<div class="w-6 h-6 rounded-full bg-teal-500"></div>';
              }
            }}
          />
        ) : walletIcon ? (
          <img
            src={walletIcon}
            alt="Wallet"
            className="w-6 h-6 object-contain rounded-full"
          />
        ) : (
          <div className="w-6 h-6 rounded-full bg-teal-500"></div>
        )}
      </div>

      {/* Action buttons grid */}
      <div className="flex-1 grid grid-cols-2 gap-2">
        {/* FLUX Governance button */}
        <div className="relative group">
          <button
            onClick={() => {
              window.open(
                "https://app.compx.io/governance",
                "_blank",
                "noopener,noreferrer"
              );
            }}
            className="w-full h-12 px-2 bg-forest-750 border border-forest-600 hover:border-teal-500 hover:bg-forest-700 transition-all duration-200 flex items-center justify-center gap-1.5 rounded"
          >
            {loadingFluxTier ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-teal-400 border-t-transparent"></div>
            ) : (
              <>
                <img
                  src="/FLUX-LOGO-TRANS.svg"
                  alt="FLUX"
                  className="w-8 h-8 object-contain"
                />
                <span className="text-sm font-display font-bold text-primary-100 uppercase tracking-wide">
                  T-{fluxTier}
                </span>
              </>
            )}
          </button>
          {/* Tooltip */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 bg-forest-900 border border-teal-500 text-primary-100 text-xs font-display whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-50 rounded">
            Your FLUX tier
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 -mb-1 border-4 border-transparent border-b-teal-500"></div>
          </div>
        </div>

        {/* Galaxy Card / CompX Rewards button */}
        <div className="relative group">
          <button
            onClick={() => {
              window.open(
                "https://app.compx.io/compx-rewards",
                "_blank",
                "noopener,noreferrer"
              );
            }}
            className={`w-full h-12 bg-forest-750 border border-forest-600 hover:border-sunset-500 hover:bg-forest-700 transition-all duration-200 flex items-center justify-center relative overflow-hidden rounded ${
              galaxyCardImageUrl ? "p-0" : "px-2"
            }`}
          >
            {loadingGalaxyCard ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-sunset-400 border-t-transparent"></div>
            ) : galaxyCardImageUrl ? (
              <img
                src={galaxyCardImageUrl}
                alt="Galaxy Card"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xs font-display font-bold text-primary-100 uppercase tracking-wide text-center leading-tight">
                CompX Rewards
              </span>
            )}
          </button>
          {/* Tooltip */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 bg-forest-900 border border-sunset-500 text-primary-100 text-xs font-display whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-50 rounded">
            Your Galaxy Card
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 -mb-1 border-4 border-transparent border-b-sunset-500"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GovernanceRewardsButtons;

