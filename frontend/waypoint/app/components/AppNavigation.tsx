import { useState, useEffect, useContext } from "react";
import AddressBookModal from "./AddressBookModal";
import NetworkWalletModal from "./NetworkWalletModal";
import { NetworkContext, BlockchainNetwork } from "../contexts/NetworkContext";

export default function AppNavigation() {
  const [currentPath, setCurrentPath] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAddressBookOpen, setIsAddressBookOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  
  const networkContext = useContext(NetworkContext);
  const selectedNetwork = networkContext?.selectedNetwork || BlockchainNetwork.APTOS;
  
  // For now, keep it simple - wallet connection state will be shown in the modal
  // The modal handles the actual wallet connection UI
  const [connected] = useState(false);
  const [account] = useState<string | null>(null);

  useEffect(() => {
    // Set initial path and listen for changes
    setCurrentPath(window.location.pathname);
    
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    // Listen for navigation changes
    window.addEventListener('popstate', handleLocationChange);
    
    // Also listen for pushstate/replacestate (for programmatic navigation)
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    
    history.pushState = function(data: any, unused: string, url?: string | URL | null) {
      originalPushState.call(history, data, unused, url);
      handleLocationChange();
    };
    
    history.replaceState = function(data: any, unused: string, url?: string | URL | null) {
      originalReplaceState.call(history, data, unused, url);
      handleLocationChange();
    };

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
    };
  }, []);

  // Helper function to determine if a link is active
  const isActiveLink = (path: string) => {
    return currentPath === path;
  };

  // Helper function to get link classes
  const getLinkClasses = (path: string) => {
    const baseClasses = "font-display text-sm uppercase tracking-wide transition-colors duration-200";
    if (isActiveLink(path)) {
      return `${baseClasses} text-primary-100 border-b-2 border-sunset-500`;
    }
    return `${baseClasses} text-primary-300 hover:text-primary-100 hover:border-b-2 hover:border-sunset-500`;
  };

  // Helper function to get mobile link classes
  const getMobileLinkClasses = (path: string) => {
    const baseClasses = "font-display text-sm uppercase tracking-wide transition-colors duration-200 px-2";
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
              <a
                href="/app"
                className={getLinkClasses("/app")}
              >
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
              <a
                href="/app/docs"
                className={getLinkClasses("/app/docs")}
              >
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
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </button>

            {/* Wallet Connection Button */}
            {!connected ? (
              <button
                onClick={() => setIsWalletModalOpen(true)}
                className="hidden md:flex items-center gap-2 px-4 py-2 bg-sunset-600 hover:bg-sunset-700 text-white font-display font-bold uppercase tracking-wide rounded-lg transition-colors duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Connect
              </button>
            ) : (
              <button
                onClick={() => setIsWalletModalOpen(true)}
                className="hidden md:flex items-center gap-2 px-4 py-2 bg-forest-700 hover:bg-forest-600 border border-forest-600 text-primary-100 font-display rounded-lg transition-colors duration-200"
              >
                <div className="flex items-center gap-2">
                  {selectedNetwork === BlockchainNetwork.APTOS ? (
                    <img src="/aptos-logo.svg" alt="Aptos" className="w-5 h-5" />
                  ) : (
                    <img src="/algorand-logo.svg" alt="Algorand" className="w-5 h-5" />
                  )}
                  <span className="font-mono text-sm">
                    {account?.slice(0, 6)}...{account?.slice(-4)}
                  </span>
                </div>
              </button>
            )}

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden text-primary-300 hover:text-primary-100 p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
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
