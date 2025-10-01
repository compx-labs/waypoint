import type { Route } from "./+types/app";
import AppNavigation from "../components/AppNavigation";
import Footer from "../components/Footer";

// Mock data for token streams
const tokenStreams = [
  {
    id: 1,
    name: "xUSD",
    symbol: "T",
    color: "bg-gradient-to-br from-sunset-500 to-sunset-600",
    tvl: "$0.00",
    totalStreams: 1,
    incoming: { count: 1, value: "$0.00" },
    outgoing: { count: 0, value: "$0.00" },
  },
  {
    id: 2,
    name: "USDC",
    symbol: "C",
    color: "bg-gradient-to-br from-forest-500 to-forest-600",
    tvl: "$38.5K",
    totalStreams: 1,
    incoming: { count: 6, value: "$38.5K" },
    outgoing: { count: 11, value: "<$0.01" },
  },
];

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Waypoint App - Your Routes" },
    {
      name: "description",
      content:
        "Manage your token routes, view analytics, and create new payment flows with Waypoint.",
    },
  ];
}

export default function AppDashboard() {
  return (
    <div className="min-h-screen bg-primary-100">
      <AppNavigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-6">
            <div>
              <h1 className="text-4xl lg:text-5xl font-display font-bold text-forest-800 uppercase tracking-wide mb-4">
                Your Routes
              </h1>
              <p className="text-lg text-forest-800 leading-relaxed max-w-4xl">
                Create and manage token routes to send payments, vesting
                schedules, or subscriptions over time. Route tokens gradually to
                recipients with customizable unlock schedules and cliff periods.
              </p>
            </div>

            <div className="flex items-center space-x-4 mt-6 lg:mt-0">
              <button className="bg-forest-500 hover:bg-forest-600 text-primary-100 font-display text-sm uppercase tracking-wider font-bold py-3 px-6 rounded-lg transition-all duration-200 ease-out transform hover:translate-y-0.5 hover:scale-105 shadow-lg hover:shadow-xl border-2 border-forest-400">
                + CREATE
              </button>
            </div>
          </div>
        </div>

        {/* Token Stream Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
          {tokenStreams.map((stream) => (
            <div
              key={stream.id}
              className="bg-gradient-to-br from-forest-800 to-forest-900 border border-forest-600 rounded-xl p-6 hover:border-sunset-500 transition-all duration-200 hover:transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              {/* Token Header */}
              <div className="flex items-center space-x-3 mb-4">
                <div
                  className={`w-10 h-10 ${stream.color} rounded-full flex items-center justify-center`}
                >
                  <span className="text-primary-100 font-display font-bold text-lg">
                    {stream.symbol}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-primary-100 font-display font-semibold text-sm uppercase tracking-wide truncate">
                    {stream.name}
                  </h3>
                </div>
                <svg
                  className="w-5 h-5 text-sunset-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>

              {/* TVL Section */}
              <div className="mb-4">
                <div className="text-primary-400 text-xs uppercase tracking-wide font-display mb-1">
                  TVL
                </div>
                <div className="text-2xl font-bold text-primary-100 font-display">
                  {stream.tvl}
                </div>
                <div className="text-sm text-primary-300">USD Value</div>
              </div>

              {/* Streams Info */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-primary-400 font-display uppercase tracking-wide">
                    Total Streams:
                  </span>
                  <span className="text-primary-100 font-semibold">
                    {stream.totalStreams}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-green-400 font-display uppercase tracking-wide">
                    Incoming:
                  </span>
                  <span className="text-green-400 font-semibold">
                    {stream.incoming.count} / {stream.incoming.value}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-sunset-400 font-display uppercase tracking-wide">
                    Outgoing:
                  </span>
                  <span className="text-sunset-400 font-semibold">
                    {stream.outgoing.count} / {stream.outgoing.value}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
