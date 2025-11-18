import React, { useState } from "react";
import { useAlgorand } from "../contexts/AlgorandContext";
import { useToast } from "../contexts/ToastContext";
import type { RouteData } from "../lib/api";

interface InvoiceCardProps {
  invoice: RouteData;
  onAccept?: (routeAppId: bigint) => Promise<void>;
  onDecline?: (routeAppId: bigint) => Promise<void>;
  onStatusChange?: () => void;
}

// Helper function to format token amount
const formatTokenAmount = (amount: string | number, decimals: number): string => {
  const value = typeof amount === 'string' ? parseFloat(amount) : amount;
  const formattedValue = value / Math.pow(10, decimals);
  
  if (formattedValue === 0) return "0";
  if (formattedValue < 0.01) return "<0.01";
  if (formattedValue >= 1000000) return `${(formattedValue / 1000000).toFixed(2)}M`;
  if (formattedValue >= 1000) return `${(formattedValue / 1000).toFixed(2)}K`;
  return formattedValue.toFixed(2);
};

// Helper to format schedule
const formatSchedule = (
  amount: string,
  amountPerPeriod: string,
  frequencyUnit: string,
  frequencyNumber: number,
  decimals: number
): string => {
  const total = parseFloat(amount);
  const perPeriod = parseFloat(amountPerPeriod);
  const periods = Math.ceil(total / perPeriod);
  
  const formattedAmount = formatTokenAmount(amountPerPeriod, decimals);
  
  if (periods === 1) {
    return `${formattedAmount} (one-time payment)`;
  }
  
  const unit = frequencyNumber === 1 ? frequencyUnit.slice(0, -1) : `${frequencyNumber} ${frequencyUnit}`;
  return `${formattedAmount} every ${unit} (${periods} payments)`;
};

// Helper to format date
const formatDate = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Helper to truncate address
const truncateAddress = (address: string): string => {
  if (address.length <= 16) return address;
  return `${address.slice(0, 8)}...${address.slice(-8)}`;
};

export default function InvoiceCard({ invoice, onAccept, onDecline, onStatusChange }: InvoiceCardProps) {
  const { algorandWaypointClient } = useAlgorand();
  const toast = useToast();
  const [isAccepting, setIsAccepting] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const isPending = invoice.status === 'pending';
  const isDeclined = invoice.status === 'declined';
  const isActive = invoice.status === 'active';
  
  const totalAmount = formatTokenAmount(invoice.amount_token_units, invoice.token.decimals);
  const schedule = formatSchedule(
    invoice.amount_token_units,
    invoice.amount_per_period_token_units,
    invoice.payment_frequency_unit,
    invoice.payment_frequency_number,
    invoice.token.decimals
  );

  const handleAccept = async () => {
    if (!algorandWaypointClient || !invoice.route_obj_address) {
      toast.showToast("Wallet not connected or invalid route", "error");
      return;
    }

    try {
      setIsAccepting(true);
      
      // Parse the route app ID from blockchain_tx_hash or route_obj_address
      // For Algorand, route_obj_address should contain the app ID
      const routeAppId = BigInt(invoice.route_obj_address);
      
      if (onAccept) {
        await onAccept(routeAppId);
      }
      
      toast.showToast("Invoice accepted successfully!", "success");
      
      // Trigger status update
      if (onStatusChange) {
        onStatusChange();
      }
    } catch (error: any) {
      console.error("Error accepting invoice:", error);
      toast.showToast(
        error?.message || "Failed to accept invoice",
        "error"
      );
    } finally {
      setIsAccepting(false);
    }
  };

  const handleDecline = async () => {
    if (!algorandWaypointClient || !invoice.route_obj_address) {
      toast.showToast("Wallet not connected or invalid route", "error");
      return;
    }

    try {
      setIsDeclining(true);
      
      const routeAppId = BigInt(invoice.route_obj_address);
      
      if (onDecline) {
        await onDecline(routeAppId);
      }
      
      toast.showToast("Invoice declined", "info");
      
      // Trigger status update
      if (onStatusChange) {
        onStatusChange();
      }
    } catch (error: any) {
      console.error("Error declining invoice:", error);
      toast.showToast(
        error?.message || "Failed to decline invoice",
        "error"
      );
    } finally {
      setIsDeclining(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-forest-800 to-forest-900 border border-forest-600 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <img
            src={invoice.token.logo_url || '/logo.svg'}
            alt={invoice.token.symbol}
            className="w-12 h-12 rounded-full"
          />
          <div>
            <h3 className="text-xl font-display font-bold text-primary-100 uppercase tracking-wide">
              {totalAmount} {invoice.token.symbol}
            </h3>
            <p className="text-sm text-forest-300">Invoice Request</p>
          </div>
        </div>
        
        {/* Status Badge */}
        <div>
          {isPending && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
              ⏳ Pending
            </span>
          )}
          {isActive && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-green-500/20 text-green-300 border border-green-500/30">
              ✓ Funded
            </span>
          )}
          {isDeclined && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-500/20 text-red-300 border border-red-500/30">
              ✗ Declined
            </span>
          )}
        </div>
      </div>

      {/* Invoice Details */}
      <div className="space-y-3 mb-4">
        <div className="flex justify-between items-center text-sm">
          <span className="text-forest-300">From (Requester):</span>
          <span className="text-primary-100 font-mono">{truncateAddress(invoice.sender)}</span>
        </div>
        
        <div className="flex justify-between items-center text-sm">
          <span className="text-forest-300">To (Beneficiary):</span>
          <span className="text-primary-100 font-mono">{truncateAddress(invoice.recipient)}</span>
        </div>
        
        <div className="flex justify-between items-center text-sm">
          <span className="text-forest-300">Payment Schedule:</span>
          <span className="text-primary-100">{schedule}</span>
        </div>
        
        <div className="flex justify-between items-center text-sm">
          <span className="text-forest-300">Start Date:</span>
          <span className="text-primary-100">{formatDate(invoice.start_date)}</span>
        </div>
      </div>

      {/* Expandable Details */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="w-full text-xs text-forest-300 hover:text-primary-100 transition-colors mb-3 flex items-center justify-center space-x-1"
      >
        <span>{showDetails ? 'Hide' : 'Show'} Details</span>
        <svg 
          className={`w-4 h-4 transform transition-transform ${showDetails ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {showDetails && (
        <div className="bg-forest-950/50 rounded-lg p-3 mb-4 space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-forest-400">Route Type:</span>
            <span className="text-primary-100">{invoice.route_type || 'invoice-routes'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-forest-400">Route ID:</span>
            <span className="text-primary-100 font-mono">{invoice.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-forest-400">Created:</span>
            <span className="text-primary-100">{formatDate(invoice.created_at!)}</span>
          </div>
          {invoice.blockchain_tx_hash && (
            <div className="flex justify-between">
              <span className="text-forest-400">Tx Hash:</span>
              <span className="text-primary-100 font-mono text-xs break-all">
                {truncateAddress(invoice.blockchain_tx_hash)}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons - Only show for pending invoices */}
      {isPending && (
        <div className="flex space-x-3">
          <button
            onClick={handleAccept}
            disabled={isAccepting || isDeclining}
            className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-display font-bold text-sm uppercase tracking-wider py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center space-x-2"
          >
            {isAccepting ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Accepting...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Accept & Fund</span>
              </>
            )}
          </button>
          
          <button
            onClick={handleDecline}
            disabled={isAccepting || isDeclining}
            className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-display font-bold text-sm uppercase tracking-wider py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center space-x-2"
          >
            {isDeclining ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Declining...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                <span>Decline</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

