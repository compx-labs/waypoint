/**
 * Unified wallet hook that combines network and wallet context
 * This provides a simple, consistent interface for wallet operations
 * across both Aptos and Algorand networks.
 */

import { useContext } from 'react';
import { UnifiedWalletContext } from '../contexts/UnifiedWalletContext';
import { NetworkContext, BlockchainNetwork } from '../contexts/NetworkContext';
import { AptosContext } from '../contexts/AptosContext';
import { AlgorandContext } from '../contexts/AlgorandContext';

export function useWallet() {
  // Use contexts directly to avoid throwing errors during initialization
  const unifiedWallet = useContext(UnifiedWalletContext);
  const network = useContext(NetworkContext);
  const aptosContext = useContext(AptosContext);
  const algorandContext = useContext(AlgorandContext);

  // Provide defaults if contexts aren't available
  const selectedNetwork = network?.selectedNetwork || BlockchainNetwork.APTOS;
  const isAptos = selectedNetwork === BlockchainNetwork.APTOS;
  const isAlgorand = selectedNetwork === BlockchainNetwork.ALGORAND;
  
  // Default wallet state if context not available
  const defaultWalletState = {
    connected: false,
    connecting: false,
    account: null,
    connect: async () => { throw new Error('Wallet context not initialized'); },
    disconnect: async () => { throw new Error('Wallet context not initialized'); },
    signAndSubmitTransaction: async () => { throw new Error('Wallet context not initialized'); },
    currentNetwork: selectedNetwork,
    error: 'Wallet context not initialized',
  };

  return {
    // Wallet connection
    ...(unifiedWallet || defaultWalletState),
    
    // Network selection
    selectedNetwork,
    setSelectedNetwork: network?.setSelectedNetwork || (() => {}),
    
    // Network type helpers
    isAptos,
    isAlgorand,
    
    // Network-specific contexts (for advanced usage)
    aptosContext: isAptos ? aptosContext : null,
    algorandContext: isAlgorand ? algorandContext : null,
    
    // Convenience method to get current network context
    getNetworkContext: () => {
      if (isAptos) return aptosContext;
      if (isAlgorand) return algorandContext;
      return null;
    },
  };
}

export default useWallet;

