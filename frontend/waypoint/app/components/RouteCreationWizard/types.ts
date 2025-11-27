import React from "react";

export interface RouteFormData {
  // Step 1: Token Selection
  selectedToken?: {
    id: number;
    symbol: string;
    name: string;
    contract_address: string;
    decimals: number;
    logo_url: string;
    network: string;
  };

  // Step 2: Amount & Schedule
  totalAmount?: string;
  unlockUnit?: "minutes" | "hours" | "days" | "weeks" | "months";
  unlockAmount?: string;

  // Step 3: Timing
  startTime?: Date;

  // Step 4: Recipient (or Payer for invoices)
  recipientAddress?: string; // The final resolved address (or direct address)
  recipientNFD?: string; // The NFD name if one was used (e.g., "alice.algo")
  
  // Step 4b: Payer (for invoice routes only)
  payerAddress?: string; // The payer's resolved address
  payerNFD?: string; // The payer's NFD name if one was used
}

export interface WizardStepProps {
  data: RouteFormData;
  updateData: (updates: Partial<RouteFormData>) => void;
  onNext: () => void;
  onPrevious: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  routeType?: string;
}

export interface WizardStep {
  id: number;
  title: string;
  description: string;
  component: React.ComponentType<WizardStepProps>;
}

export interface RouteCreationWizardProps {
  routeType: string;
  onClose: () => void;
  onComplete: (data: RouteFormData) => void;
}

