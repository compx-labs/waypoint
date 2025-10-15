import { useWallet } from "@txnlab/use-wallet-react";
import { motion } from "framer-motion";

interface AlgorandWalletListProps {
  onConnect?: () => void;
}

export default function AlgorandWalletList({ onConnect }: AlgorandWalletListProps) {
  const { wallets } = useWallet();

  const handleOnConnect = async (wallet: any) => {
    try {
      await wallet.connect();
      onConnect?.();
    } catch (error) {
      console.error("Failed to connect Algorand wallet:", error);
    }
  };

  return (
    <div className="space-y-3">
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
  );
}

