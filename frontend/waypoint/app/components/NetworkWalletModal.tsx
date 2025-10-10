import { useState, useEffect, useContext } from 'react';
import { NetworkContext, BlockchainNetwork } from '../contexts/NetworkContext';
import { WalletSelector } from '@aptos-labs/wallet-adapter-ant-design';
import AlgorandWalletList from './AlgorandWalletList';

interface NetworkWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NetworkWalletModal({ isOpen, onClose }: NetworkWalletModalProps) {
  const networkContext = useContext(NetworkContext);
  const selectedNetwork = networkContext?.selectedNetwork || BlockchainNetwork.APTOS;
  const setSelectedNetwork = networkContext?.setSelectedNetwork || (() => {});
  
  // Simple state for connection - will be enhanced later
  const [connected] = useState(false);
  const [account] = useState<string | null>(null);
  
  const disconnect = async () => {
    console.log('Disconnect - to be implemented with network-specific logic');
  };
  
  const [showNetworkSelect, setShowNetworkSelect] = useState(true);

  // Reset to network selection when modal opens
  useEffect(() => {
    if (isOpen && !connected) {
      setShowNetworkSelect(true);
    }
  }, [isOpen, connected]);

  const handleNetworkSelect = (network: BlockchainNetwork) => {
    setSelectedNetwork(network);
    setShowNetworkSelect(false);
  };

  const handleDisconnect = async () => {
    await disconnect();
    setShowNetworkSelect(true);
  };

  const handleBack = () => {
    setShowNetworkSelect(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity" 
          aria-hidden="true"
          onClick={onClose}
        ></div>

        {/* Center modal */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-gradient-to-br from-forest-900 via-forest-800 to-forest-900 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-forest-600">
          {/* Header */}
          <div className="bg-gradient-to-r from-forest-800 to-forest-700 px-6 py-4 border-b border-forest-600 flex justify-between items-center">
            <h3 className="text-xl font-display font-bold text-primary-100 uppercase tracking-wide">
              {connected ? 'Wallet Connected' : showNetworkSelect ? 'Select Network' : 'Connect Wallet'}
            </h3>
            <button
              onClick={onClose}
              className="text-primary-300 hover:text-primary-100 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-6">
            {connected ? (
              // Connected State
              <div className="space-y-4">
                <div className="bg-forest-700 rounded-lg p-4 border border-forest-600">
                  <div className="text-sm text-primary-300 mb-1">Connected Network</div>
                  <div className="font-display font-bold text-primary-100 uppercase tracking-wide flex items-center gap-2">
                    {selectedNetwork === BlockchainNetwork.APTOS ? (
                      <>
                        <img src="/aptos-logo.svg" alt="Aptos" className="w-6 h-6" />
                        Aptos
                      </>
                    ) : (
                      <>
                        <img src="/algorand-logo.svg" alt="Algorand" className="w-6 h-6" />
                        Algorand
                      </>
                    )}
                  </div>
                </div>

                <div className="bg-forest-700 rounded-lg p-4 border border-forest-600">
                  <div className="text-sm text-primary-300 mb-1">Account Address</div>
                  <div className="font-mono text-sm text-primary-100 break-all">
                    {account}
                  </div>
                </div>

                <button
                  onClick={handleDisconnect}
                  className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-display font-bold uppercase tracking-wide rounded-lg transition-colors duration-200"
                >
                  Disconnect Wallet
                </button>
              </div>
            ) : showNetworkSelect ? (
              // Network Selection
              <div className="space-y-4">
                <p className="text-primary-200 text-center mb-6">
                  Choose which blockchain network you want to connect to
                </p>

                <button
                  onClick={() => handleNetworkSelect(BlockchainNetwork.APTOS)}
                  className="w-full flex items-center gap-4 p-6 bg-forest-700 hover:bg-forest-600 border-2 border-forest-600 hover:border-sunset-500 rounded-lg transition-all duration-200 group"
                >
                  <img src="/aptos-logo.svg" alt="Aptos" className="w-12 h-12" />
                  <div className="flex-1 text-left">
                    <div className="font-display font-bold text-lg text-primary-100 uppercase tracking-wide group-hover:text-sunset-400 transition-colors">
                      Aptos
                    </div>
                    <div className="text-sm text-primary-300">
                      Connect to Aptos blockchain
                    </div>
                  </div>
                  <svg className="w-6 h-6 text-primary-300 group-hover:text-sunset-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                <button
                  onClick={() => handleNetworkSelect(BlockchainNetwork.ALGORAND)}
                  className="w-full flex items-center gap-4 p-6 bg-forest-700 hover:bg-forest-600 border-2 border-forest-600 hover:border-sunset-500 rounded-lg transition-all duration-200 group"
                >
                  <img src="/algorand-logo.svg" alt="Algorand" className="w-12 h-12" />
                  <div className="flex-1 text-left">
                    <div className="font-display font-bold text-lg text-primary-100 uppercase tracking-wide group-hover:text-sunset-400 transition-colors">
                      Algorand
                    </div>
                    <div className="text-sm text-primary-300">
                      Connect to Algorand blockchain
                    </div>
                  </div>
                  <svg className="w-6 h-6 text-primary-300 group-hover:text-sunset-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            ) : (
              // Wallet Connection UI
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <button
                    onClick={handleBack}
                    className="text-primary-300 hover:text-primary-100 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <div className="flex items-center gap-2 text-primary-100 font-display font-bold uppercase tracking-wide">
                    {selectedNetwork === BlockchainNetwork.APTOS ? (
                      <>
                        <img src="/aptos-logo.svg" alt="Aptos" className="w-6 h-6" />
                        Aptos Wallets
                      </>
                    ) : (
                      <>
                        <img src="/algorand-logo.svg" alt="Algorand" className="w-6 h-6" />
                        Algorand Wallets
                      </>
                    )}
                  </div>
                </div>

                {selectedNetwork === BlockchainNetwork.APTOS ? (
                  <div className="flex justify-center">
                    <WalletSelector />
                  </div>
                ) : selectedNetwork === BlockchainNetwork.ALGORAND ? (
                  <AlgorandWalletList onConnect={onClose} />
                ) : (
                  <div className="text-center text-primary-300 py-8">
                    Loading wallet options...
                  </div>
                )}

                <p className="text-sm text-primary-300 text-center mt-4">
                  Select a wallet to connect to {selectedNetwork === BlockchainNetwork.APTOS ? 'Aptos' : 'Algorand'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

