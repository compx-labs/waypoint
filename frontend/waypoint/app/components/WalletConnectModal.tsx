import { useWallet } from "@txnlab/use-wallet-react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface AlgorandWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AlgorandWalletModal({ isOpen, onClose }: AlgorandWalletModalProps) {
  const { wallets } = useWallet();

  const handleOnConnect = async (wallet: any) => {
    try {
      await wallet.connect();
      onClose();
    } catch (error) {
      console.error("Failed to connect Algorand wallet:", error);
    }
  };

  const handleClose = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        aria-labelledby="modal-title"
        role="dialog"
        aria-modal="true"
      >
        {/* Backdrop */}
        <motion.div
          className="fixed inset-0 bg-gray-900 bg-opacity-75"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={handleClose}
        />

        {/* Modal Content */}
        <motion.div
          className="relative w-full max-w-md"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
        >
          {/* Modal container */}
          <div className="relative bg-gradient-to-br from-forest-900 via-forest-800 to-forest-900 rounded-lg border-2 border-forest-600 shadow-xl p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-forest-700 to-forest-800 rounded-lg flex items-center justify-center border border-forest-600">
                  <img src="/algorand-logo.svg" alt="Algorand" className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-display font-bold text-primary-100 uppercase tracking-wide">
                  Connect Algorand Wallet
                </h3>
              </div>
              
              <button
                onClick={handleClose}
                className="group relative p-2 rounded-lg hover:bg-forest-700 transition-all duration-150 border border-forest-600"
              >
                <X className="w-5 h-5 text-primary-300 group-hover:text-primary-100 transition-colors duration-150" />
              </button>
            </div>

            {/* Info notice */}
            <div className="flex items-center gap-3 mb-6 p-4 rounded-lg bg-forest-700/50 border border-forest-600">
              <img src="/algorand-logo.svg" alt="Algorand" className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm text-primary-200">
                Select your preferred Algorand wallet to connect to Waypoint
              </p>
            </div>

            {/* Wallet options */}
            <div className="space-y-3 mb-6">
              {wallets?.map((wallet, index) => (
                <motion.button
                  key={`wallet-${wallet.metadata.name}`}
                  className="group relative w-full"
                  onClick={() => handleOnConnect(wallet)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Button content */}
                  <div className="relative bg-forest-800 border-2 border-forest-600 rounded-lg p-4 hover:border-sunset-500 hover:bg-forest-700 transition-all duration-200">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-forest-700 to-forest-800 border border-forest-600 flex items-center justify-center">
                          <img
                            src={wallet.metadata.icon}
                            alt={`${wallet.metadata.name} logo`}
                            className="w-8 h-8 object-contain"
                          />
                        </div>
                      </div>
                      
                      <div className="flex-1 text-left">
                        <h4 className="font-display font-semibold text-primary-100 group-hover:text-sunset-400 transition-colors duration-200">
                          {wallet.metadata.name}
                        </h4>
                        <p className="text-sm text-primary-300">
                          Connect via {wallet.metadata.name}
                        </p>
                      </div>
                      
                      <div className="w-6 h-6 rounded-full border-2 border-forest-600 group-hover:border-sunset-500 transition-colors duration-200 flex items-center justify-center">
                        <svg className="w-4 h-4 text-primary-300 group-hover:text-sunset-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Footer */}
            <div className="text-center">
              <button
                onClick={handleClose}
                className="relative group overflow-hidden px-6 py-2 rounded-lg bg-forest-700 border border-forest-600 hover:bg-forest-600 transition-all duration-150"
              >
                <span className="relative text-primary-200 group-hover:text-primary-100 transition-colors duration-150 font-display">
                  Cancel
                </span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
