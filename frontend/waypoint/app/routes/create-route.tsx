import { useNavigate, useSearchParams } from "react-router";
import { useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import type { Route } from "./+types/create-route";
import RouteCreationWizard, { type RouteFormData } from "../components/RouteCreationWizard";
import { useToast } from "../contexts/ToastContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

export function meta({}: Route["MetaArgs"]) {
  return [
    { title: "Create Route - Waypoint" },
    {
      name: "description",
      content: "Create a new token route with customizable schedules and recipients.",
    },
  ];
}

export default function CreateRoute() {
  const navigate = useNavigate();
  const { account } = useWallet();
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const routeType = searchParams.get('type') || 'simple-transfer';
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleComplete = async (data: RouteFormData) => {
    console.log('Route creation completed:', data);
    
    if (!account?.address) {
      toast.error({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to create a route",
      });
      return;
    }

    if (!data.selectedToken || !data.totalAmount || !data.unlockAmount || !data.unlockUnit || !data.startTime || !data.recipientAddress) {
      toast.error({
        title: "Missing Information",
        description: "Please complete all required fields",
      });
      return;
    }

    setIsSubmitting(true);
    setError(null);
    
    const toastId = toast.loading({
      title: "Creating Route",
      description: "Saving your route to the database...",
    });

    try {
      // The form collects:
      // - totalAmount: Total amount to route (e.g., $10)
      // - unlockAmount: Amount per unlock period (e.g., $1)
      // - unlockUnit: The period (e.g., 'hours')
      // This means: unlock $1 every 1 hour
      
      // Backend expects:
      // - payment_frequency_unit: The period unit (e.g., 'hours')
      // - payment_frequency_number: Always 1 (unlock every 1 unit)
      // - amount_token_units: Total amount in token units
      
      const frequencyUnit = data.unlockUnit;
      const frequencyNumber = 1; // Always 1 - we unlock every 1 unit (hour, day, etc.)

      // Convert total amount to token units (multiply by decimals)
      const amountInTokenUnits = Math.floor(
        parseFloat(data.totalAmount) * Math.pow(10, data.selectedToken.decimals)
      );

      // Convert amount per period to token units
      const amountPerPeriodInTokenUnits = Math.floor(
        parseFloat(data.unlockAmount!) * Math.pow(10, data.selectedToken.decimals)
      );

      const routePayload = {
        sender: account.address.toStringLong(),
        recipient: data.recipientAddress,
        token_id: data.selectedToken.id,
        amount_token_units: amountInTokenUnits.toString(),
        amount_per_period_token_units: amountPerPeriodInTokenUnits.toString(),
        start_date: data.startTime.toISOString(),
        payment_frequency_unit: frequencyUnit,
        payment_frequency_number: frequencyNumber,
        blockchain_tx_hash: null, // Will be updated later when blockchain tx is made
      };

      console.log('Submitting route:', routePayload);

      const response = await fetch(`${API_BASE_URL}/api/routes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(routePayload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to create route' }));
        throw new Error(errorData.error || 'Failed to create route');
      }

      const createdRoute = await response.json();
      console.log('Route created successfully:', createdRoute);

      // Update the loading toast to success
      toast.update(toastId, {
        type: "success",
        title: "Route Created! 🎉",
        description: `Successfully created route for ${data.totalAmount} ${data.selectedToken.symbol}`,
      });

      // Navigate back to dashboard after a brief delay
      setTimeout(() => {
        navigate('/app');
      }, 1000);
    } catch (err) {
      console.error('Error creating route:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create route';
      setError(errorMessage);
      
      // Update the loading toast to error
      toast.update(toastId, {
        type: "error",
        title: "Creation Failed",
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) {
      if (!confirm('Route creation is in progress. Are you sure you want to cancel?')) {
        return;
      }
    }
    navigate('/app');
  };

  return (
    <RouteCreationWizard
      routeType={routeType}
      onClose={handleClose}
      onComplete={handleComplete}
    />
  );
}
