import type { Route } from "./+types/app";
import { useState } from "react";
import AppNavigation from "../components/AppNavigation";
import Footer from "../components/Footer";
import RouteCreationModal from "../components/RouteCreationModal";

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
  const [isRouteModalOpen, setIsRouteModalOpen] = useState(false);

  const handleCreateRoute = () => {
    setIsRouteModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsRouteModalOpen(false);
  };

  const handleRouteTypeSelect = (routeTypeId: string) => {
    console.log("Selected route type:", routeTypeId);
    // Navigate to route creation wizard with the selected type
    window.location.href = `/create-route?type=${routeTypeId}`;
  };

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

            {/* Desktop Create Button */}
            <div className="hidden md:flex items-center space-x-4 mt-6 lg:mt-0">
              <button 
                onClick={handleCreateRoute}
                className="bg-forest-500 hover:bg-forest-600 text-primary-100 font-display text-sm uppercase tracking-wider font-bold py-3 px-6 rounded-lg transition-all duration-200 ease-out transform hover:translate-y-0.5 hover:scale-105 shadow-lg hover:shadow-xl border-2 border-forest-400"
              >
                + CREATE
              </button>
            </div>
          </div>
        </div>

        {/* Token Stream Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-12 md:mb-12 pb-24 md:pb-0">
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
      
      {/* Mobile Create Button - Fixed at Bottom */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-primary-100 via-primary-100/95 to-transparent p-4 pt-8">
        <button 
          onClick={handleCreateRoute}
          className="w-full bg-gradient-to-r from-forest-500 to-forest-600 hover:from-forest-600 hover:to-forest-700 text-primary-100 font-display text-base uppercase tracking-wider font-bold py-4 px-8 rounded-xl transition-all duration-200 ease-out active:scale-95 shadow-lg border-2 border-forest-400 flex items-center justify-center space-x-2"
          style={{ 
            touchAction: 'manipulation',
            WebkitTapHighlightColor: 'transparent' 
          }}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          <span>CREATE ROUTE</span>
        </button>
      </div>
      
      <Footer />
      
      {/* Route Creation Modal */}
      <RouteCreationModal
        isOpen={isRouteModalOpen}
        onClose={handleCloseModal}
        onRouteTypeSelect={handleRouteTypeSelect}
      />
    </div>
  );
}
