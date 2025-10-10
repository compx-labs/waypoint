import { useState, useEffect } from "react";
import AddressBookModal from "./AddressBookModal";
import NetworkWalletModal from "./NetworkWalletModal";
import { BlockchainNetwork } from "../contexts/NetworkContext";
import { useUnifiedWallet } from "../contexts/UnifiedWalletContext";
import { useToast } from "../contexts/ToastContext";

export default function AppNavigation() {
  const [currentPath, setCurrentPath] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
  } = useUnifiedWallet();
  const toast = useToast();

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

  useEffect(() => {
    // Set initial path and listen for changes
    setCurrentPath(window.location.pathname);

    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    // Listen for navigation changes
    window.addEventListener("popstate", handleLocationChange);

    // Also listen for pushstate/replacestate (for programmatic navigation)
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function (
      data: any,
      unused: string,
      url?: string | URL | null
    ) {
      originalPushState.call(history, data, unused, url);
      handleLocationChange();
    };

    history.replaceState = function (
      data: any,
      unused: string,
      url?: string | URL | null
    ) {
      originalReplaceState.call(history, data, unused, url);
      handleLocationChange();
    };

    return () => {
      window.removeEventListener("popstate", handleLocationChange);
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
    };
  }, []);

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
    return currentPath === path;
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
              <a href="/app" className={getLinkClasses("/app")}>
                Your Routes
              </a>
              <a
                href="/app/analytics"
                className={getLinkClasses("/app/analytics")}
              >
                Analytics
              </a>
              <a
                href="/app/vision-roadmap"
                className={getLinkClasses("/app/vision-roadmap")}
              >
                Vision & Roadmap
              </a>
              <a href="/app/docs" className={getLinkClasses("/app/docs")}>
                Docs
              </a>
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
                  className="flex items-center gap-2 px-4 py-2 bg-forest-700 hover:bg-forest-600 border border-forest-600 text-primary-100 font-display rounded-lg transition-colors duration-200"
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
                          // Fallback to Algorand logo if avatar fails to load
                          e.currentTarget.src = "/algorand-logo.svg";
                          e.currentTarget.className = "w-5 h-5";
                        }}
                      />
                    ) : (
                      <img
                        src="/algorand-logo.svg"
                        alt="Algorand"
                        className="w-5 h-5"
                      />
                    )}
                    <span className="font-mono text-sm">
                      {selectedNetwork === BlockchainNetwork.ALGORAND && nfd?.name
                        ? nfd.name
                        : `${account?.slice(0, 6)}...${account?.slice(-4)}`}
                    </span>
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
                  <div className="absolute right-0 mt-2 w-56 bg-forest-800 border border-forest-600 rounded-lg shadow-xl z-50">
                    <div className="py-2">
                      {/* Connected Address */}
                      <div className="px-4 py-2 border-b border-forest-700">
                        <p className="text-xs text-primary-300 uppercase tracking-wide mb-1">
                          Connected
                        </p>
                        {selectedNetwork === BlockchainNetwork.ALGORAND && nfd?.name ? (
                          <>
                            <div className="flex items-center gap-2 mb-1">
                              {nfd.avatar && (
                                <img
                                  src={nfd.avatar}
                                  alt={nfd.name}
                                  className="w-6 h-6 rounded-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              )}
                              <p className="text-sm text-primary-100 font-display font-bold">
                                {nfd.name}
                              </p>
                            </div>
                            <p className="text-xs text-primary-300 font-mono break-all">
                              {account}
                            </p>
                          </>
                        ) : (
                          <p className="text-sm text-primary-100 font-mono break-all">
                            {account}
                          </p>
                        )}
                      </div>

                      {/* Copy Address */}
                      <button
                        onClick={handleCopyAddress}
                        className="w-full px-4 py-2 text-left text-sm text-primary-100 hover:bg-forest-700 transition-colors flex items-center gap-2"
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
                        Copy Address
                      </button>

                      {/* Disconnect */}
                      <button
                        onClick={handleDisconnect}
                        className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-forest-700 transition-colors flex items-center gap-2"
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
                )}
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-primary-300 hover:text-primary-100 p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
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

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-forest-700 pt-4 pb-4">
            <div className="flex flex-col space-y-3">
              <a
                href="/app"
                className={getMobileLinkClasses("/app")}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Your Routes
              </a>
              <a
                href="/app/analytics"
                className={getMobileLinkClasses("/app/analytics")}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Analytics
              </a>
              <a
                href="/app/vision-roadmap"
                className={getMobileLinkClasses("/app/vision-roadmap")}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Vision & Roadmap
              </a>
              <a
                href="/app/docs"
                className={getMobileLinkClasses("/app/docs")}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Docs
              </a>
            </div>
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
