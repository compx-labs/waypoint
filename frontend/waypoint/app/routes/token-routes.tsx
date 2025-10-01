import type { Route } from "./+types/token-routes";
import { useParams } from "react-router";
import { useState } from "react";
import AppNavigation from "../components/AppNavigation";
import Footer from "../components/Footer";

// Types for individual route data
interface TokenRoute {
  id: number;
  recipient: string;
  total: string;
  remaining: string;
  payoutPeriod: string;
  payoutAmount: string;
}

// Mock token data - you could fetch this based on tokenId in a real app
const tokenData: Record<string, { name: string; symbol: string; color: string; logoSrc: string; routes: TokenRoute[] }> = {
  "1": {
    name: "xUSD",
    symbol: "T",
    color: "bg-gradient-to-br from-sunset-500 to-sunset-600",
    logoSrc: "/xusd-logo.svg",
    routes: [
      {
        id: 1,
        recipient: "0x1234...5678",
        total: "$5,000.00",
        remaining: "$3,200.00",
        payoutPeriod: "Monthly",
        payoutAmount: "$500.00"
      },
    ]
  },
  "2": {
    name: "USDC",
    symbol: "C", 
    color: "bg-gradient-to-br from-forest-500 to-forest-600",
    logoSrc: "/usdc-logo.svg",
    routes: [
      {
        id: 2,
        recipient: "0xabcd...efgh",
        total: "$10,000.00",
        remaining: "$7,500.00", 
        payoutPeriod: "Weekly",
        payoutAmount: "$250.00"
      },
      {
        id: 3,
        recipient: "0x9876...1234",
        total: "$15,000.00",
        remaining: "$12,000.00",
        payoutPeriod: "Daily",
        payoutAmount: "$100.00"
      },
      {
        id: 4,
        recipient: "0xfedc...ba98",
        total: "$8,500.00",
        remaining: "$5,100.00",
        payoutPeriod: "Bi-weekly", 
        payoutAmount: "$425.00"
      },
    ]
  }
};

export function meta({}: Route["MetaArgs"]) {
  return [
    { title: "Token Routes - Waypoint" },
    {
      name: "description", 
      content: "View and manage individual routes for your token streams."
    }
  ];
}

export default function TokenRoutes() {
  const { tokenId } = useParams();
  const token = tokenData[tokenId || ""] || { name: "Unknown Token", symbol: "?", color: "bg-gray-500", logoSrc: "", routes: [] };
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const toggleRow = (routeId: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(routeId)) {
      newExpanded.delete(routeId);
    } else {
      newExpanded.add(routeId);
    }
    setExpandedRows(newExpanded);
  };

  return (
    <div className="min-h-screen bg-primary-100">
      <AppNavigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          {/* Mobile Header - Centered */}
          <div className="sm:hidden text-center mb-6">
            {/* Token Icon */}
            {token.logoSrc ? (
              <div className="w-16 h-16 rounded-full flex items-center justify-center bg-white p-3 mx-auto mb-4">
                <img
                  src={token.logoSrc}
                  alt={`${token.name} logo`}
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className={`w-16 h-16 ${token.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                <span className="text-primary-100 font-display font-bold text-2xl">
                  {token.symbol}
                </span>
              </div>
            )}
            <h1 className="text-3xl font-display font-bold text-forest-800 uppercase tracking-wide mb-4">
              {token.name} Routes
            </h1>
            <p className="text-base text-forest-800 leading-relaxed px-4">
              All routes using {token.name} tokens. Monitor progress, recipients, and payout schedules in one place.
            </p>
          </div>

          {/* Desktop Header - Side by side */}
          <div className="hidden sm:flex sm:items-center sm:space-x-4 mb-6">
            {/* Token Icon */}
            {token.logoSrc ? (
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-white p-2 flex-shrink-0">
                <img
                  src={token.logoSrc}
                  alt={`${token.name} logo`}
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className={`w-12 h-12 ${token.color} rounded-full flex items-center justify-center flex-shrink-0`}>
                <span className="text-primary-100 font-display font-bold text-xl">
                  {token.symbol}
                </span>
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-4xl lg:text-5xl font-display font-bold text-forest-800 uppercase tracking-wide">
                {token.name} Routes
              </h1>
              <p className="text-lg text-forest-800 leading-relaxed max-w-4xl mt-2">
                All routes using {token.name} tokens. Monitor progress, recipients, and payout schedules in one place.
              </p>
            </div>
          </div>
        </div>

        {/* Routes Table */}
        <div className="bg-white rounded-xl shadow-lg border border-forest-200 overflow-hidden">
          {token.routes.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-forest-600 text-lg">No routes found for this token.</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  {/* Table Header */}
                  <thead className="bg-forest-50 border-b border-forest-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-display font-semibold text-forest-800 uppercase tracking-wide">
                        Recipient
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-display font-semibold text-forest-800 uppercase tracking-wide">
                        Total
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-display font-semibold text-forest-800 uppercase tracking-wide">
                        Remaining
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-display font-semibold text-forest-800 uppercase tracking-wide">
                        Payout Period
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-display font-semibold text-forest-800 uppercase tracking-wide">
                        Payout Amount
                      </th>
                    </tr>
                  </thead>

                  {/* Table Body */}
                  <tbody className="divide-y divide-forest-100">
                    {token.routes.map((route, index) => (
                      <tr 
                        key={route.id}
                        className={`hover:bg-forest-25 transition-colors duration-150 ${
                          index % 2 === 0 ? 'bg-white' : 'bg-forest-10'
                        }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-mono text-forest-800">
                            {route.recipient}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-forest-800">
                            {route.total}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-green-600">
                            {route.remaining}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-sunset-100 text-sunset-800 border border-sunset-200">
                            {route.payoutPeriod}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-forest-800">
                            {route.payoutAmount}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Expandable Cards */}
              <div className="md:hidden">
                {token.routes.map((route, index) => {
                  const isExpanded = expandedRows.has(route.id);
                  return (
                    <div 
                      key={route.id} 
                      className={`border-b border-forest-100 last:border-b-0 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-forest-10'
                      }`}
                    >
                      {/* Main Row - Always Visible */}
                      <div 
                        className="p-4 cursor-pointer hover:bg-forest-25 transition-colors duration-150"
                        onClick={() => toggleRow(route.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            {/* Recipient */}
                            <div className="mb-2">
                              <div className="text-xs font-display font-semibold text-forest-600 uppercase tracking-wide mb-1">
                                Recipient
                              </div>
                              <div className="text-sm font-mono text-forest-800 truncate">
                                {route.recipient}
                              </div>
                            </div>
                            
                            {/* Total and Remaining in a row */}
                            <div className="flex space-x-4">
                              <div className="flex-1">
                                <div className="text-xs font-display font-semibold text-forest-600 uppercase tracking-wide mb-1">
                                  Total
                                </div>
                                <div className="text-sm font-semibold text-forest-800">
                                  {route.total}
                                </div>
                              </div>
                              <div className="flex-1">
                                <div className="text-xs font-display font-semibold text-forest-600 uppercase tracking-wide mb-1">
                                  Remaining
                                </div>
                                <div className="text-sm font-semibold text-green-600">
                                  {route.remaining}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Expand/Collapse Icon */}
                          <div className="ml-4 flex-shrink-0">
                            <svg 
                              className={`w-5 h-5 text-forest-600 transition-transform duration-200 ${
                                isExpanded ? 'transform rotate-180' : ''
                              }`} 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <div className="px-4 pb-4 border-t border-forest-100 bg-forest-25">
                          <div className="pt-4 space-y-3">
                            <div>
                              <div className="text-xs font-display font-semibold text-forest-600 uppercase tracking-wide mb-1">
                                Payout Period
                              </div>
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-sunset-100 text-sunset-800 border border-sunset-200">
                                {route.payoutPeriod}
                              </span>
                            </div>
                            <div>
                              <div className="text-xs font-display font-semibold text-forest-600 uppercase tracking-wide mb-1">
                                Payout Amount
                              </div>
                              <div className="text-sm font-semibold text-forest-800">
                                {route.payoutAmount}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Back Navigation */}
        <div className="mt-8">
          <a
            href="/app"
            className="inline-flex items-center space-x-2 text-forest-600 hover:text-forest-800 transition-colors duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-display text-sm uppercase tracking-wide">Back to Routes</span>
          </a>
        </div>
      </div>

      <Footer />
    </div>
  );
}
