import type { Route } from "./+types/analytics";
import AppNavigation from "../components/AppNavigation";
import Footer from "../components/Footer";

// Analytics data structure
interface NetworkAnalytics {
  name: string;
  routes: number;
  totalValueLocked: string;
  totalValueRouted: string;
  color: string;
  logoSrc: string;
}

// Mock analytics data - all set to 0 as requested
const networkData: NetworkAnalytics[] = [
  {
    name: "Aptos",
    routes: 0,
    totalValueLocked: "$0.00",
    totalValueRouted: "$0.00",
    color: "bg-gradient-to-br from-blue-500 to-blue-600",
    logoSrc: "/aptos-logo.svg"
  },
  {
    name: "Algorand", 
    routes: 0,
    totalValueLocked: "$0.00",
    totalValueRouted: "$0.00",
    color: "bg-gradient-to-br from-gray-500 to-gray-600",
    logoSrc: "/algorand-logo.svg"
  }
];

// Calculate overall totals
const overallData = {
  routes: networkData.reduce((sum, network) => sum + network.routes, 0),
  totalValueLocked: "$0.00",
  totalValueRouted: "$0.00"
};

export function meta({}: Route["MetaArgs"]) {
  return [
    { title: "Analytics - Waypoint" },
    {
      name: "description",
      content: "View analytics and metrics for your Waypoint routes across all supported networks."
    }
  ];
}

export default function Analytics() {
  return (
    <div className="min-h-screen bg-primary-100">
      <AppNavigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl lg:text-5xl font-display font-bold text-forest-800 uppercase tracking-wide mb-4">
            Analytics
          </h1>
          <p className="text-lg text-forest-800 leading-relaxed max-w-4xl">
            Track performance metrics and usage statistics for your routes across all supported networks.
          </p>
        </div>

        {/* Overall Stats Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-display font-bold text-forest-800 uppercase tracking-wide mb-6">
            Overall Statistics
          </h2>
          <div className="bg-gradient-to-br from-forest-800 to-forest-900 border border-forest-600 rounded-xl p-8 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Overall Routes */}
              <div className="text-center">
                <div className="text-primary-400 text-sm uppercase tracking-wide font-display mb-2">
                  Total Routes
                </div>
                <div className="text-4xl font-bold text-primary-100 font-display mb-1">
                  {overallData.routes}
                </div>
                <div className="text-sm text-primary-300">Across All Networks</div>
              </div>

              {/* Overall TVL */}
              <div className="text-center">
                <div className="text-primary-400 text-sm uppercase tracking-wide font-display mb-2">
                  Total Value Locked
                </div>
                <div className="text-4xl font-bold text-primary-100 font-display mb-1">
                  {overallData.totalValueLocked}
                </div>
                <div className="text-sm text-primary-300">USD Value</div>
              </div>

              {/* Overall Volume */}
              <div className="text-center">
                <div className="text-primary-400 text-sm uppercase tracking-wide font-display mb-2">
                  Total Value Routed
                </div>
                <div className="text-4xl font-bold text-primary-100 font-display mb-1">
                  {overallData.totalValueRouted}
                </div>
                <div className="text-sm text-primary-300">All Time</div>
              </div>
            </div>
          </div>
        </div>

        {/* Network-Specific Analytics */}
        <div className="mb-12">
          <h2 className="text-2xl font-display font-bold text-forest-800 uppercase tracking-wide mb-6">
            Network Analytics
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {networkData.map((network, index) => (
              <div
                key={network.name}
                className="bg-gradient-to-br from-forest-800 to-forest-900 border border-forest-600 rounded-xl p-8 hover:border-sunset-500 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {/* Network Header */}
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center p-2">
                    <img
                      src={network.logoSrc}
                      alt={`${network.name} logo`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <h3 className="text-2xl font-display font-bold text-primary-100 uppercase tracking-wide">
                      {network.name}
                    </h3>
                  </div>
                </div>

                {/* Network Stats Grid */}
                <div className="grid grid-cols-1 gap-6">
                  {/* Routes */}
                  <div className="flex justify-between items-center py-3 border-b border-forest-700">
                    <span className="text-primary-400 font-display text-sm uppercase tracking-wide">
                      Routes
                    </span>
                    <span className="text-2xl font-bold text-primary-100 font-display">
                      {network.routes}
                    </span>
                  </div>

                  {/* Total Value Locked */}
                  <div className="flex justify-between items-center py-3 border-b border-forest-700">
                    <span className="text-primary-400 font-display text-sm uppercase tracking-wide">
                      Total Value Locked
                    </span>
                    <span className="text-2xl font-bold text-primary-100 font-display">
                      {network.totalValueLocked}
                    </span>
                  </div>

                  {/* Total Value Routed */}
                  <div className="flex justify-between items-center py-3">
                    <span className="text-primary-400 font-display text-sm uppercase tracking-wide">
                      Total Value Routed
                    </span>
                    <span className="text-2xl font-bold text-primary-100 font-display">
                      {network.totalValueRouted}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Coming Soon Section */}
        <div className="text-center py-12">
          <div className="bg-gradient-to-br from-sunset-500/10 to-sunset-600/10 border border-sunset-500/20 rounded-xl p-8">
            <h3 className="text-xl font-display font-bold text-forest-800 uppercase tracking-wide mb-4">
              More Analytics Coming Soon
            </h3>
            <p className="text-forest-700 max-w-2xl mx-auto">
              We're working on additional analytics features including historical charts, 
              route performance metrics, and detailed transaction breakdowns.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
