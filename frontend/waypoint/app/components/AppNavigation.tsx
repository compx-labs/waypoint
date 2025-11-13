import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import AddressBookModal from "./AddressBookModal";
import NetworkWalletModal from "./NetworkWalletModal";
import GovernanceRewardsButtons from "./GovernanceRewardsButtons";
import { BlockchainNetwork } from "../contexts/NetworkContext";
import { useUnifiedWallet } from "../contexts/UnifiedWalletContext";
import { useToast } from "../contexts/ToastContext";
import { useWallet as useAlgorandWallet } from "@txnlab/use-wallet-react";

export default function AppNavigation() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileWalletOpen, setIsMobileWalletOpen] = useState(false);
  const [isAddressBookOpen, setIsAddressBookOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [showWalletDropdown, setShowWalletDropdown] = useState(false);

  // Get wallet state from unified wallet context
  const {
    connected,
    account,
    disconnect,
    currentNetwork: selectedNetwork,
    nfd,
    nfdLoading,
    walletName,
  } = useUnifiedWallet();
  const toast = useToast();
  const algorandWallet = useAlgorandWallet();
  
  // Get wallet icon
  const walletIcon = algorandWallet.activeWallet?.metadata.icon;

  // Social links
  const socialLinks = [
    {
      name: "X",
      href: "https://x.com/compxlabs",
      icon: (
        <svg
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
            fill="currentColor"
          />
        </svg>
      ),
    },
    {
      name: "Discord",
      href: "https://discord.gg/pSG93C6UN8",
      icon: (
        <svg
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M20.317 4.36a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.111.806-.154 1.17-1.5-.224-2.994-.224-4.478 0a8.18 8.18 0 0 0-.155-1.17.076.076 0 0 0-.079-.037 19.736 19.736 0 0 0-4.885 1.515.07.07 0 0 0-.032.027C.533 8.074-.32 11.663.099 15.202a.082.082 0 0 0 .031.057c2.03 1.5 3.995 2.407 5.927 3.016a.076.076 0 0 0 .083-.026c.455-.623.885-1.278 1.244-1.966a.075.075 0 0 0-.041-.105 13.229 13.229 0 0 1-1.886-.9.075.075 0 0 1-.008-.126c.126-.094.252-.192.372-.29a.075.075 0 0 1 .078-.01c3.927 1.792 8.18 1.792 12.061 0a.075.075 0 0 1 .078.01c.12.099.246.196.373.29a.075.075 0 0 1-.007.127 12.239 12.239 0 0 1-1.887.899.075.075 0 0 0-.041.105c.363.689.79 1.343 1.243 1.967a.076.076 0 0 0 .083.026c1.937-.61 3.902-1.516 5.932-3.016a.076.076 0 0 0 .032-.057c.5-4.107-.839-7.66-3.549-10.815a.06.06 0 0 0-.031-.026Z"
            fill="currentColor"
          />
        </svg>
      ),
    },
    {
      name: "Telegram",
      href: "https://t.me/compxlabs",
      icon: (
        <svg
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z"
            fill="currentColor"
          />
        </svg>
      ),
    },
    {
      name: "GitHub",
      href: "https://github.com/compx-labs",
      icon: (
        <svg
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.49.5.09.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.836c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10Z"
            fill="currentColor"
          />
        </svg>
      ),
    },
  ];

  const handleDisconnect = async () => {
    try {
      await disconnect();
      setShowWalletDropdown(false);
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
    }
  };

  const handleCopyAddress = async () => {
    if (account) {
      try {
        await navigator.clipboard.writeText(account);
        toast.success({
          title: "Address copied to clipboard!",
          duration: 2000,
        });
        setShowWalletDropdown(false);
      } catch (error) {
        console.error("Failed to copy address:", error);
        toast.error({
          title: "Failed to copy address",
          duration: 2000,
        });
      }
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showWalletDropdown && !target.closest(".relative")) {
        setShowWalletDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showWalletDropdown]);

  // Helper function to determine if a link is active
  const isActiveLink = (path: string) => {
    return location.pathname === path;
  };

  // Helper function to get link classes
  const getLinkClasses = (path: string) => {
    const baseClasses =
      "font-display text-sm uppercase tracking-wide transition-colors duration-200";
    if (isActiveLink(path)) {
      return `${baseClasses} text-primary-100 border-b-2 border-sunset-500`;
    }
    return `${baseClasses} text-primary-300 hover:text-primary-100 hover:border-b-2 hover:border-sunset-500`;
  };

  // Helper function to get mobile link classes
  const getMobileLinkClasses = (path: string) => {
    const baseClasses =
      "font-display text-sm uppercase tracking-wide transition-colors duration-200 px-2";
    if (isActiveLink(path)) {
      return `${baseClasses} text-primary-100`;
    }
    return `${baseClasses} text-primary-300 hover:text-primary-100`;
  };

  return (
    <nav className="bg-gradient-to-r from-forest-900 to-forest-800 border-b border-forest-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left Side - Logo and Navigation */}
          <div className="flex items-center space-x-8">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <img
                src="/logo.svg"
                alt="Waypoint"
                className="h-8 w-auto rounded-full bg-stone-200 p-0.5"
              />
              <span className="font-display text-xl font-bold text-primary-100 uppercase tracking-wider">
                WAYPOINT
              </span>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-6">
              <Link to="/app" className={getLinkClasses("/app")}>
                Your Routes
              </Link>
              <Link
                to="/app/analytics"
                className={getLinkClasses("/app/analytics")}
              >
                Analytics
              </Link>
              <Link
                to="/app/vision-roadmap"
                className={getLinkClasses("/app/vision-roadmap")}
              >
                Vision & Roadmap
              </Link>
              <Link to="/app/docs" className={getLinkClasses("/app/docs")}>
                Docs
              </Link>
            </div>
          </div>

          {/* Right Side - Actions */}
          <div className="flex items-center space-x-4">
            {/* Address Book Button */}
            <button
              onClick={() => setIsAddressBookOpen(true)}
              className="text-primary-300 hover:text-primary-100 transition-colors p-2 hover:bg-forest-700 rounded-lg"
              title="Address Book"
            >
              <svg
                className="w-6 h-6"
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

            {/* Wallet Connection Button */}
            {!connected ? (
              <button
                onClick={() => setIsWalletModalOpen(true)}
                className="hidden md:flex items-center gap-2 px-4 py-2 bg-sunset-600 hover:bg-sunset-700 text-white font-display font-bold uppercase tracking-wide rounded-lg transition-colors duration-200"
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
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
                Connect
              </button>
            ) : (
              <div className="hidden md:block relative">
                <button
                  onClick={() => setShowWalletDropdown(!showWalletDropdown)}
                  className="flex items-center gap-2 px-5 py-1.5 bg-forest-700 hover:bg-forest-600 border border-forest-600 text-primary-100 font-display rounded-lg transition-colors duration-200"
                >
                  <div className="flex items-center gap-2">
                    {selectedNetwork === BlockchainNetwork.APTOS ? (
                      <img
                        src="/aptos-logo.svg"
                        alt="Aptos"
                        className="w-5 h-5"
                      />
                    ) : selectedNetwork === BlockchainNetwork.ALGORAND && nfd?.avatar ? (
                      <img
                        src={nfd.avatar}
                        alt={nfd.name}
                        className="w-5 h-5 rounded-full object-cover"
                        onError={(e) => {
                          // Fallback to wallet icon if avatar fails to load
                          if (walletIcon) {
                            e.currentTarget.src = walletIcon;
                            e.currentTarget.className = "w-5 h-5 rounded-full object-contain";
                          } else {
                            e.currentTarget.src = "/algorand-logo.svg";
                            e.currentTarget.className = "w-5 h-5";
                          }
                        }}
                      />
                    ) : walletIcon ? (
                      <img
                        src={walletIcon}
                        alt="Wallet"
                        className="w-5 h-5 rounded-full object-contain"
                      />
                    ) : (
                      <img
                        src="/algorand-logo.svg"
                        alt="Algorand"
                        className="w-5 h-5"
                      />
                    )}
                    <div className="flex flex-col items-start">
                      <span className="font-mono text-sm leading-tight uppercase">
                        {selectedNetwork === BlockchainNetwork.ALGORAND && nfd?.name
                          ? nfd.name.replace(/\.algo$/i, '')
                          : `${account?.slice(0, 6)}...${account?.slice(-4)}`}
                      </span>
                      {selectedNetwork === BlockchainNetwork.ALGORAND && walletIcon && (
                        <span className="font-display text-xs text-primary-300 leading-tight">
                          {algorandWallet.activeWallet?.metadata.name || "Algorand Wallet"}
                        </span>
                      )}
                    </div>
                    {nfdLoading && selectedNetwork === BlockchainNetwork.ALGORAND && (
                      <svg
                        className="animate-spin h-4 w-4 text-primary-300"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                    )}
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </button>

                {/* Dropdown Menu */}
                {showWalletDropdown && (
                  <div className="absolute right-0 mt-2 w-80 bg-forest-800 border border-forest-600 rounded-lg shadow-xl z-50">
                    <div className="py-3">
                      {/* Governance & Rewards Buttons (Algorand only) */}
                      {selectedNetwork === BlockchainNetwork.ALGORAND && (
                        <div className="px-4 pt-2 pb-3">
                          <GovernanceRewardsButtons />
                        </div>
                      )}

                      {/* Address Section */}
                      <div className="px-4 py-4 border-b border-forest-700 bg-forest-750">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            {selectedNetwork === BlockchainNetwork.ALGORAND && nfd?.name ? (
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  {nfd.avatar && (
                                    <img
                                      src={nfd.avatar}
                                      alt={nfd.name}
                                      className="w-5 h-5 rounded-full object-cover"
                                      onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                      }}
                                    />
                                  )}
                                  <p className="text-sm text-primary-100 font-display font-bold">
                                    {nfd.name.replace(/\.algo$/i, '')}
                                  </p>
                                </div>
                                <p className="text-xs text-primary-300 font-mono">
                                  {`${account?.slice(0, 8)}...${account?.slice(-6)}`}
                                </p>
                              </div>
                            ) : (
                              <p className="text-sm text-primary-100 font-mono">
                                {`${account?.slice(0, 8)}...${account?.slice(-6)}`}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={handleCopyAddress}
                            className="ml-2 p-1.5 text-primary-300 hover:text-primary-100 hover:bg-forest-700 rounded transition-colors"
                            title="Copy Address"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {/* Social Icons */}
                      <div className="px-4 py-4 border-b border-forest-700">
                        <div className="flex justify-between items-center">
                          {socialLinks.map((social) => (
                            <a
                              key={social.name}
                              href={social.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-forest-700 hover:bg-forest-600 p-2 rounded transition-colors duration-200 text-primary-200 hover:text-primary-100"
                              aria-label={social.name}
                            >
                              {social.icon}
                            </a>
                          ))}
                        </div>
                      </div>

                      {/* Disconnect */}
                      <div className="py-2">
                        <button
                          onClick={handleDisconnect}
                          className="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-forest-700 transition-colors flex items-center gap-2"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                            />
                          </svg>
                          Disconnect
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Wallet Button */}
            <button
              className="md:hidden flex items-center gap-2 px-4 py-1.5 bg-forest-700 hover:bg-forest-600 border border-forest-600 text-primary-100 rounded-lg transition-colors"
              onClick={() => {
                setIsMobileWalletOpen(!isMobileWalletOpen);
                setIsMobileMenuOpen(false);
              }}
              title="Wallet"
            >
              {connected ? (
                <>
                  <div className="flex items-center gap-2">
                    {selectedNetwork === BlockchainNetwork.APTOS ? (
                      <img
                        src="/aptos-logo.svg"
                        alt="Aptos"
                        className="w-5 h-5"
                      />
                    ) : selectedNetwork === BlockchainNetwork.ALGORAND && nfd?.avatar ? (
                      <img
                        src={nfd.avatar}
                        alt={nfd.name}
                        className="w-5 h-5 rounded-full object-cover"
                        onError={(e) => {
                          // Fallback to wallet icon if avatar fails to load
                          if (walletIcon) {
                            e.currentTarget.src = walletIcon;
                            e.currentTarget.className = "w-5 h-5 rounded-full object-contain";
                          } else {
                            e.currentTarget.src = "/algorand-logo.svg";
                            e.currentTarget.className = "w-5 h-5";
                          }
                        }}
                      />
                    ) : walletIcon ? (
                      <img
                        src={walletIcon}
                        alt="Wallet"
                        className="w-5 h-5 rounded-full object-contain"
                      />
                    ) : (
                      <img
                        src="/algorand-logo.svg"
                        alt="Algorand"
                        className="w-5 h-5"
                      />
                    )}
                    <div className="flex flex-col items-start">
                      <span className="font-mono text-xs leading-tight uppercase">
                        {selectedNetwork === BlockchainNetwork.ALGORAND && nfd?.name
                          ? nfd.name.replace(/\.algo$/i, '')
                          : `${account?.slice(0, 4)}...${account?.slice(-3)}`}
                      </span>
                      {selectedNetwork === BlockchainNetwork.ALGORAND && walletIcon && (
                        <span className="font-display text-[10px] text-primary-300 leading-tight">
                          {algorandWallet.activeWallet?.metadata.name || "Algorand"}
                        </span>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <>
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
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                  <span className="font-display text-xs uppercase tracking-wide">Connect</span>
                </>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-primary-300 hover:text-primary-100 p-2"
              onClick={() => {
                setIsMobileMenuOpen(!isMobileMenuOpen);
                setIsMobileWalletOpen(false);
              }}
            >
              {isMobileMenuOpen ? (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu - Navigation Links Only */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-forest-700 pt-4 pb-4">
            <div className="flex flex-col space-y-3">
              <Link
                to="/app"
                className={getMobileLinkClasses("/app")}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Your Routes
              </Link>
              <Link
                to="/app/analytics"
                className={getMobileLinkClasses("/app/analytics")}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Analytics
              </Link>
              <Link
                to="/app/vision-roadmap"
                className={getMobileLinkClasses("/app/vision-roadmap")}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Vision & Roadmap
              </Link>
              <Link
                to="/app/docs"
                className={getMobileLinkClasses("/app/docs")}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Docs
              </Link>
            </div>
          </div>
        )}

        {/* Mobile Wallet Menu - Separate from Navigation */}
        {isMobileWalletOpen && (
          <div className="md:hidden border-t border-forest-700 pt-4 pb-4">
            {!connected ? (
              <button
                onClick={() => {
                  setIsWalletModalOpen(true);
                  setIsMobileWalletOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-sunset-600 hover:bg-sunset-700 text-white font-display font-bold uppercase tracking-wide rounded-lg transition-colors duration-200"
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
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
                Connect Wallet
              </button>
            ) : (
              <div className="space-y-4 px-2">
                {/* Governance & Rewards Buttons (Algorand only) */}
                {selectedNetwork === BlockchainNetwork.ALGORAND && (
                  <div className="px-2 pt-2">
                    <GovernanceRewardsButtons />
                  </div>
                )}

                {/* Address Section */}
                <div className="px-3 py-3 bg-forest-700 rounded-lg border border-forest-600">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      {selectedNetwork === BlockchainNetwork.ALGORAND && nfd?.name ? (
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            {nfd.avatar && (
                              <img
                                src={nfd.avatar}
                                alt={nfd.name}
                                className="w-5 h-5 rounded-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            )}
                            <p className="text-sm text-primary-100 font-display font-bold">
                              {nfd.name.replace(/\.algo$/i, '')}
                            </p>
                          </div>
                          <p className="text-xs text-primary-300 font-mono">
                            {`${account?.slice(0, 8)}...${account?.slice(-6)}`}
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-primary-100 font-mono">
                          {`${account?.slice(0, 8)}...${account?.slice(-6)}`}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        handleCopyAddress();
                        setIsMobileWalletOpen(false);
                      }}
                      className="ml-2 p-1.5 text-primary-300 hover:text-primary-100 hover:bg-forest-700 rounded transition-colors"
                      title="Copy Address"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Social Icons */}
                <div className="px-3 py-3">
                  <div className="flex justify-between items-center">
                    {socialLinks.map((social) => (
                      <a
                        key={social.name}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-forest-700 hover:bg-forest-600 p-2 rounded transition-colors duration-200 text-primary-200 hover:text-primary-100"
                        aria-label={social.name}
                      >
                        {social.icon}
                      </a>
                    ))}
                  </div>
                </div>
                
                <button
                  onClick={() => {
                    handleDisconnect();
                    setIsMobileWalletOpen(false);
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm text-red-400 bg-forest-700 hover:bg-forest-600 rounded-lg transition-colors flex items-center gap-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Disconnect
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Address Book Modal */}
      <AddressBookModal
        isOpen={isAddressBookOpen}
        onClose={() => setIsAddressBookOpen(false)}
      />

      {/* Network & Wallet Connection Modal */}
      <NetworkWalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
      />
    </nav>
  );
}
