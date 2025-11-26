import React from 'react';
import { useUnifiedWallet } from '../contexts/UnifiedWalletContext';
import { BlockchainNetwork } from '../contexts/NetworkContext';
import { useAddressName } from '../hooks/useAddressName';

interface AddressDisplayProps {
  address: string;
  network: BlockchainNetwork | null;
  currentUserAddress?: string;
  truncateLength?: number; // Length for truncation if no name is found
  className?: string; // Additional CSS classes
}

const shortenAddress = (address: string, length: number = 8): string => {
  if (address.length <= length * 2 + 3) return address;
  return `${address.slice(0, length)}...${address.slice(-length)}`;
};

export default function AddressDisplay({ 
  address, 
  network, 
  currentUserAddress, 
  truncateLength = 6,
  className = ""
}: AddressDisplayProps) {
  const { name, loading } = useAddressName(address, network);
  const { account: connectedAccount } = useUnifiedWallet();

  // Use currentUserAddress if provided, otherwise fall back to connectedAccount
  const userAddress = currentUserAddress || connectedAccount;

  if (userAddress && address.toLowerCase() === userAddress.toLowerCase()) {
    return <span className={`font-display text-forest-800 ${className}`}>You</span>;
  }

  if (loading) {
    return (
      <span className={`text-forest-600 animate-pulse ${className}`}>
        Resolving...
      </span>
    );
  }

  if (name) {
    // Remove .algo or .apt suffix for display
    const displayName = name.replace(/\.(algo|apt)$/i, '');
    return (
      <span className={`font-display text-sunset-600 ${className}`} title={address}>
        {displayName}
      </span>
    );
  }

  return (
    <span className={`font-mono text-forest-800 ${className}`} title={address}>
      {shortenAddress(address, truncateLength)}
    </span>
  );
}

