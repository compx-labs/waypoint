export default function AppNavigation() {
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
                className="text-primary-200 hover:text-primary-100 font-display text-sm uppercase tracking-wide transition-colors duration-200 border-b-2 border-sunset-500"
              >
                Routes
              </a>
              <a
                href="/app/portfolio"
                className="text-primary-300 hover:text-primary-100 font-display text-sm uppercase tracking-wide transition-colors duration-200 hover:border-b-2 hover:border-sunset-500"
              >
                Portfolio
              </a>
              <a
                href="/app/analytics"
                className="text-primary-300 hover:text-primary-100 font-display text-sm uppercase tracking-wide transition-colors duration-200 hover:border-b-2 hover:border-sunset-500"
              >
                Analytics
              </a>
            </div>
          </div>

          {/* Right Side - Actions */}
          <div className="flex items-center space-x-4">
            {/* Network Selector */}
            

            {/* Connect Wallet Button */}
            <button className="bg-sunset-500 hover:bg-sunset-600 text-primary-100 font-display text-sm uppercase tracking-wider font-bold py-3 px-6 rounded-lg transition-all duration-200 ease-out transform hover:translate-y-0.5 hover:scale-105 shadow-lg hover:shadow-xl border border-sunset-400">
              Connect Wallet
            </button>

            {/* Mobile Menu Button */}
            <button className="md:hidden text-primary-300 hover:text-primary-100 p-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-forest-700 pt-4 pb-4">
          <div className="flex flex-col space-y-3">
            <a
              href="/app"
              className="text-primary-200 hover:text-primary-100 font-display text-sm uppercase tracking-wide transition-colors duration-200 px-2"
            >
              Routes
            </a>
            <a
              href="/app/portfolio"
              className="text-primary-300 hover:text-primary-100 font-display text-sm uppercase tracking-wide transition-colors duration-200 px-2"
            >
              Portfolio
            </a>
            <a
              href="/app/analytics"
              className="text-primary-300 hover:text-primary-100 font-display text-sm uppercase tracking-wide transition-colors duration-200 px-2"
            >
              Analytics
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
