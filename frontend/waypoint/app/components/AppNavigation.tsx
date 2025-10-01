import { useState, useEffect } from "react";

export default function AppNavigation() {
  const [WalletSelector, setWalletSelector] = useState<any>(null);
  const [currentPath, setCurrentPath] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  useEffect(() => {
    // Dynamically import WalletSelector only on the client side
    import("@aptos-labs/wallet-adapter-ant-design").then((module) => {
      setWalletSelector(() => module.WalletSelector);
    });
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
                href="/app/docs"
                className={getLinkClasses("/app/docs")}
              >
                Docs
              </a>
            </div>
          </div>

          {/* Right Side - Actions */}
          <div className="flex items-center space-x-4">
            {/* Network Selector */}
            

            {/* Wallet Selector */}
            {WalletSelector && <WalletSelector />}

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
    </nav>
  );
}
