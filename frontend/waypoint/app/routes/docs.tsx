import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DocsNavigation from "../components/DocsNavigation";
import AppNavigation from "../components/AppNavigation";
import Footer from "../components/Footer";

export default function Docs() {
  const [activeSection, setActiveSection] = useState("overview");

  useEffect(() => {
    document.title = "Waypoint Docs - Your Adventure Guide";
  }, []);

  return (
    <div className="min-h-screen bg-primary-100">
      <AppNavigation />
      
      <div className="flex flex-col md:flex-row">
        {/* Sidebar Navigation */}
        <DocsNavigation activeSection={activeSection} onSectionChange={setActiveSection} />
      
      {/* Main Content */}
      <div 
        className="flex-1 overflow-auto w-full"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-forest-800 to-forest-700 border-b border-forest-600 px-4 md:px-8 py-4 md:py-6">
          <div className="flex items-center space-x-3 mb-2 md:mb-4">
            <div className="w-6 h-6 md:w-8 md:h-8 bg-sunset-500 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-3 h-3 md:w-4 md:h-4 text-primary-100" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="font-display text-xl md:text-3xl font-bold text-primary-100 uppercase tracking-wider break-words">
              {activeSection === "overview" && "ADVENTURE OVERVIEW"}
              {activeSection === "supported-tokens" && "SUPPORTED TOKENS"}
              {activeSection === "creating-route" && "CREATING A ROUTE"}
              {activeSection === "claiming-linear-route" && "LINEAR ROUTES"}
              {activeSection === "milestone-routes" && "MILESTONE ROUTES"}
              {activeSection === "invoice-routes" && "INVOICE ROUTES"}
            </h1>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4 md:p-8">
          {/* Overview Section */}
          {activeSection === "overview" && (
            <>
              <motion.div
                className="mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="font-display text-xl md:text-2xl font-bold text-forest-800 uppercase tracking-wide mb-4">
                  Welcome to Waypoint - Adventure Guide
                </h2>
                <p className="text-base md:text-lg text-forest-700 leading-relaxed mb-6">
                  Get a complete overview of the Waypoint ecosystem and its route-mapping capabilities
                </p>
              </motion.div>

              <motion.div
                className="prose prose-lg max-w-none"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="bg-white rounded-xl p-4 md:p-6 border border-forest-200 shadow-sm">
                  <p className="text-forest-700 leading-relaxed mb-4">
                    <span className="font-bold text-sunset-600">Waypoint</span> is an adventure-inspired payment routing protocol built on multiple blockchains, designed with 
                    a clean, intuitive interface that creates an engaging experience for both DeFi 
                    newcomers and veterans.
                  </p>
                  
                  <p className="text-forest-700 leading-relaxed mb-4">
                    Our platform transforms complex payment streams into simple routes that anyone can navigate. 
                    Whether you're setting up recurring payments, creating vesting schedules, or managing subscription flows, 
                    Waypoint guides you through each step of your financial journey.
                  </p>

                  <div className="bg-gradient-to-r from-forest-100 to-sunset-100 rounded-lg p-4 mt-6">
                    <h4 className="font-display text-lg font-bold text-forest-800 uppercase tracking-wide mb-3">
                      Key Features
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-sunset-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <span className="font-semibold text-forest-800">Multi-Chain Routes:</span>
                          <span className="text-forest-700"> Stream across Algorand and Aptos</span>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-sunset-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <span className="font-semibold text-forest-800">Adventure UX:</span>
                          <span className="text-forest-700"> Intuitive, journey-inspired design</span>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-sunset-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <span className="font-semibold text-forest-800">Flexible Scheduling:</span>
                          <span className="text-forest-700"> Custom unlock and cliff periods</span>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-sunset-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <span className="font-semibold text-forest-800">Real-time Tracking:</span>
                          <span className="text-forest-700"> Monitor routes and progress</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}

          {/* Supported Tokens Section */}
          {activeSection === "supported-tokens" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="bg-white rounded-xl p-4 md:p-6 border border-forest-200 shadow-sm mb-6">
                <h2 className="font-display text-xl md:text-2xl font-bold text-forest-800 uppercase tracking-wide mb-4">
                  Available Tokens
                </h2>
                <p className="text-base md:text-lg text-forest-700 leading-relaxed mb-6">
                  Waypoint currently supports a curated selection of stablecoins for routing on Aptos and Algorand blockchains.
                </p>

                <div className="space-y-4">
                  <div className="border border-forest-200 rounded-lg p-5 hover:border-sunset-400 transition-colors">
                    <div className="flex items-center space-x-4">
                      <img src="/usdc-logo.svg" alt="USDC" className="w-12 h-12" />
                      <div className="flex-1">
                        <h3 className="font-display font-bold text-lg text-forest-800">USDC</h3>
                        <p className="text-sm text-forest-600">USD Coin - Circle's regulated stablecoin</p>
                      </div>
                      <div className="flex gap-2">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">Aptos</span>
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold">Algorand</span>
                      </div>
                    </div>
                  </div>

                  <div className="border border-forest-200 rounded-lg p-5 hover:border-sunset-400 transition-colors">
                    <div className="flex items-center space-x-4">
                      <img src="/xusd-logo.svg" alt="xUSD" className="w-12 h-12" />
                      <div className="flex-1">
                        <h3 className="font-display font-bold text-lg text-forest-800">xUSD</h3>
                        <p className="text-sm text-forest-600">xUSD - CompX over-collateralized stablecoin</p>
                      </div>
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold">Algorand</span>
                    </div>
                  </div>

                  <div className="border border-forest-200 rounded-lg p-5 hover:border-sunset-400 transition-colors">
                    <div className="flex items-center space-x-4">
                      <img src="/usdt-logo.svg" alt="USDT" className="w-12 h-12" />
                      <div className="flex-1">
                        <h3 className="font-display font-bold text-lg text-forest-800">USDT</h3>
                        <p className="text-sm text-forest-600">Tether - World's most liquid stablecoin</p>
                      </div>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">Aptos</span>
                    </div>
                  </div>

                  <div className="border border-forest-200 rounded-lg p-5 hover:border-sunset-400 transition-colors">
                    <div className="flex items-center space-x-4">
                      <img src="/usde-logo.svg" alt="USDe" className="w-12 h-12" />
                      <div className="flex-1">
                        <h3 className="font-display font-bold text-lg text-forest-800">USDe</h3>
                        <p className="text-sm text-forest-600">Ethena USD - Synthetic dollar protocol</p>
                      </div>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">Aptos</span>
                    </div>
                  </div>

                  <div className="border border-forest-200 rounded-lg p-5 hover:border-sunset-400 transition-colors">
                    <div className="flex items-center space-x-4">
                      <img src="/usda-logo.svg" alt="AURO USDA" className="w-12 h-12" />
                      <div className="flex-1">
                        <h3 className="font-display font-bold text-lg text-forest-800">AURO USDA</h3>
                        <p className="text-sm text-forest-600">Auro USD - Decentralized stablecoin</p>
                      </div>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">Aptos</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                  <p className="text-sm text-forest-700">
                    <span className="font-semibold text-emerald-600">Multi-Chain Support:</span> Waypoint now supports both Aptos and Algorand blockchains! We're actively working on expanding support to include additional tokens and blockchain networks.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Creating a Route Section */}
          {activeSection === "creating-route" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="bg-white rounded-xl p-4 md:p-6 border border-forest-200 shadow-sm mb-6">
                <h2 className="font-display text-xl md:text-2xl font-bold text-forest-800 uppercase tracking-wide mb-4">
                  Creating Your First Route
                </h2>
                <p className="text-base md:text-lg text-forest-700 leading-relaxed mb-6">
                  Follow this step-by-step guide to create a payment route on Waypoint. Routes can be created on either Aptos or Algorand blockchain.
                </p>

                <div className="space-y-6">
                  <div className="flex space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-sunset-500 rounded-full flex items-center justify-center text-white font-bold">1</div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-display font-bold text-lg text-forest-800 mb-2">Choose Network & Connect Wallet</h3>
                      <p className="text-forest-700 leading-relaxed mb-3">
                        Click the "Connect Wallet" button in the top right corner and select your blockchain network:
                      </p>
                      <div className="space-y-2 ml-4">
                        <div className="flex items-start">
                          <span className="inline-flex items-center justify-center px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-semibold mr-2 mt-0.5">Aptos</span>
                          <p className="text-sm text-forest-600">Petra, Martian, Pontem, Nightly, or other Aptos-compatible wallets</p>
                        </div>
                        <div className="flex items-start">
                          <span className="inline-flex items-center justify-center px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-xs font-semibold mr-2 mt-0.5">Algorand</span>
                          <p className="text-sm text-forest-600">Pera, Defly, or Lute wallets</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-sunset-500 rounded-full flex items-center justify-center text-white font-bold">2</div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-display font-bold text-lg text-forest-800 mb-2">Navigate to Your Routes</h3>
                      <p className="text-forest-700 leading-relaxed">
                        Go to the "Your Routes" page from the navigation menu. Click the "+ CREATE" button to open the route creation wizard.
                      </p>
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-sunset-500 rounded-full flex items-center justify-center text-white font-bold">3</div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-display font-bold text-lg text-forest-800 mb-2">Select Token & Amount</h3>
                      <p className="text-forest-700 leading-relaxed mb-3">
                        Choose the token you want to route and enter the total amount you wish to stream to the recipient. Available tokens depend on your selected network:
                      </p>
                      <div className="space-y-2 ml-4 mb-3">
                        <p className="text-sm text-forest-600"><span className="font-semibold">Aptos:</span> USDC, USDT, USDe, AURO USDA</p>
                        <p className="text-sm text-forest-600"><span className="font-semibold">Algorand:</span> USDC, xUSD</p>
                      </div>
                      <div className="bg-forest-50 p-3 rounded border border-forest-200">
                        <p className="text-sm text-forest-600"><span className="font-semibold">Example:</span> 1,000 USDC over 10 weeks</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-sunset-500 rounded-full flex items-center justify-center text-white font-bold">4</div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-display font-bold text-lg text-forest-800 mb-2">Configure Unlock Schedule</h3>
                      <p className="text-forest-700 leading-relaxed mb-3">
                        Set how frequently tokens unlock for claiming. You can choose from minutes, hours, days, weeks, or months. This determines how often the recipient can claim their tokens.
                      </p>
                      <div className="bg-forest-50 p-3 rounded border border-forest-200">
                        <p className="text-sm text-forest-600"><span className="font-semibold">Example:</span> 100 USDC unlocks every 1 week</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-sunset-500 rounded-full flex items-center justify-center text-white font-bold">5</div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-display font-bold text-lg text-forest-800 mb-2">Enter Recipient Address</h3>
                      <p className="text-forest-700 leading-relaxed mb-2">
                        Enter the recipient's wallet address on your selected blockchain. The address format depends on the network:
                      </p>
                      <div className="space-y-1 ml-4 mb-3">
                        <p className="text-sm text-forest-600"><span className="font-semibold">Aptos:</span> 0x... format address</p>
                        <p className="text-sm text-forest-600"><span className="font-semibold">Algorand:</span> Standard Algorand address or .algo NFD</p>
                      </div>
                      <p className="text-sm text-forest-600">
                        💡 Use the Address Book feature to save and select frequently used addresses with custom labels.
                      </p>
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-sunset-500 rounded-full flex items-center justify-center text-white font-bold">6</div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-display font-bold text-lg text-forest-800 mb-2">Set Start Date & Time</h3>
                      <p className="text-forest-700 leading-relaxed">
                        Choose when the route should begin. You can start immediately or schedule it for a future date and time.
                      </p>
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-sunset-500 rounded-full flex items-center justify-center text-white font-bold">7</div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-display font-bold text-lg text-forest-800 mb-2">Review & Create</h3>
                      <p className="text-forest-700 leading-relaxed mb-3">
                        Review all the details of your route. If everything looks correct, click "Create Route" and approve the transaction in your wallet. Your route will be created on the blockchain and become visible in your dashboard!
                      </p>
                      <div className="bg-forest-50 p-3 rounded border border-forest-200">
                        <p className="text-sm text-forest-600"><span className="font-semibold">Note:</span> A small protocol fee and network gas fees will apply when creating the route.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 p-5 bg-gradient-to-r from-forest-100 to-sunset-100 rounded-lg border border-sunset-200">
                  <h4 className="font-display font-bold text-forest-800 mb-2">💡 Pro Tip</h4>
                  <p className="text-forest-700 text-sm">
                    Use the Address Book to save recipient addresses with labels (e.g., "Team Member", "Contractor") for easier route creation in the future.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Linear Routes - Claiming Section */}
          {activeSection === "claiming-linear-route" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="bg-white rounded-xl p-4 md:p-6 border border-forest-200 shadow-sm mb-6">
                <h2 className="font-display text-xl md:text-2xl font-bold text-forest-800 uppercase tracking-wide mb-4">
                  Linear Routes: Claiming Tokens
                </h2>
                <p className="text-base md:text-lg text-forest-700 leading-relaxed mb-6">
                  Learn how to claim tokens from linear routes that have been created for you on Aptos or Algorand. Linear routes automatically unlock tokens over time based on a fixed schedule.
                </p>

                <div className="space-y-6">
                  <div>
                    <h3 className="font-display font-bold text-lg text-forest-800 mb-3">How Token Unlocking Works</h3>
                    <p className="text-forest-700 leading-relaxed mb-4">
                      Waypoint uses a <span className="font-semibold text-sunset-600">linear unlocking mechanism</span> on both Aptos and Algorand. This means tokens gradually become available for claiming based on the schedule set by the sender. Instead of waiting for the entire payment, you can claim tokens as they unlock over time.
                    </p>
                    
                    <div className="bg-forest-50 p-4 rounded-lg border border-forest-200 mb-4">
                      <p className="text-sm text-forest-700 mb-2">
                        <span className="font-semibold">Example:</span> If someone creates a route to send you 1,000 USDC over 10 weeks (100 USDC per week):
                      </p>
                      <ul className="text-sm text-forest-600 space-y-1 ml-4">
                        <li>• After 1 week: 100 USDC available to claim</li>
                        <li>• After 2 weeks: 200 USDC total available (if you haven't claimed yet)</li>
                        <li>• After 5 weeks: 500 USDC total available</li>
                        <li>• After 10 weeks: All 1,000 USDC available</li>
                      </ul>
                    </div>
                  </div>

                  <div className="border-t border-forest-200 pt-6">
                    <h3 className="font-display font-bold text-lg text-forest-800 mb-4">Steps to Claim</h3>
                    
                    <div className="space-y-5">
                      <div className="flex space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-sunset-500 rounded-full flex items-center justify-center text-white font-bold">1</div>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-display font-semibold text-forest-800 mb-2">Connect Your Wallet</h4>
                          <p className="text-forest-700 mb-2">
                            Connect the wallet that is set as the recipient on the route. This must be the exact address the sender specified. Select the appropriate blockchain network:
                          </p>
                          <div className="flex gap-2 ml-4">
                            <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">Aptos</span>
                            <span className="text-sm text-forest-600">or</span>
                            <span className="inline-flex items-center px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-semibold">Algorand</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-sunset-500 rounded-full flex items-center justify-center text-white font-bold">2</div>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-display font-semibold text-forest-800 mb-2">View Your Incoming Routes</h4>
                          <p className="text-forest-700">
                            Go to "Your Routes" to see all routes where you are the recipient. The dashboard will show how much is currently available to claim for each route.
                          </p>
                        </div>
                      </div>

                      <div className="flex space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-sunset-500 rounded-full flex items-center justify-center text-white font-bold">3</div>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-display font-semibold text-forest-800 mb-2">Click the Route Card</h4>
                          <p className="text-forest-700">
                            Click on the token route card to view detailed information about the route, including the unlock schedule, total amount, and claimable balance.
                          </p>
                        </div>
                      </div>

                      <div className="flex space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-sunset-500 rounded-full flex items-center justify-center text-white font-bold">4</div>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-display font-semibold text-forest-800 mb-2">Claim Available Tokens</h4>
                          <p className="text-forest-700 mb-3">
                            Click the "Claim" button to initiate a blockchain transaction. Your wallet will prompt you to approve the transaction. Once confirmed, the tokens will be transferred to your wallet.
                          </p>
                          <div className="bg-sunset-50 p-3 rounded border border-sunset-200">
                            <p className="text-sm text-forest-600">
                              <span className="font-semibold">Note:</span> You can claim as frequently as you like, but keep in mind each claim is a blockchain transaction with associated gas fees (APT on Aptos, ALGO on Algorand).
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-forest-200 pt-6">
                    <h3 className="font-display font-bold text-lg text-forest-800 mb-3">Claiming Strategy</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <h4 className="font-semibold text-green-800 mb-2 flex items-center">
                          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Batch Claims
                        </h4>
                        <p className="text-sm text-green-700">
                          Wait to accumulate larger amounts before claiming to minimize network gas fees. For example, claim once a month instead of weekly. This strategy works on both Aptos and Algorand.
                        </p>
                      </div>

                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
                          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                          </svg>
                          Regular Claims
                        </h4>
                        <p className="text-sm text-blue-700">
                          For consistent cash flow, set a regular claiming schedule (e.g., every payday) to ensure steady income.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 p-5 bg-gradient-to-r from-forest-100 to-sunset-100 rounded-lg border border-sunset-200">
                  <h4 className="font-display font-bold text-forest-800 mb-2">🔒 Security Note</h4>
                  <p className="text-forest-700 text-sm">
                    Only the designated recipient address can claim tokens from a route. The sender cannot reclaim or modify tokens once the route is created, ensuring trustless and transparent payments.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Invoice Routes Section */}
          {activeSection === "invoice-routes" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="bg-white rounded-xl p-4 md:p-6 border border-forest-200 shadow-sm mb-6">
                <h2 className="font-display text-xl md:text-2xl font-bold text-forest-800 uppercase tracking-wide mb-4">
                  Invoice Routes: Request, Approve & Pay
                </h2>
                <p className="text-base md:text-lg text-forest-700 leading-relaxed mb-6">
                  Invoice routes allow you to request payment from a payer with flexible payment schedules. Unlike regular routes where the sender deposits tokens immediately, invoice routes create a payment request that the payer must accept and fund before tokens are routed to you. 
                </p>

                <div className="space-y-6">
                  <div>
                    <h3 className="font-display font-bold text-lg text-forest-800 mb-3">How Invoice Routes Work</h3>
                    <p className="text-forest-700 leading-relaxed mb-4">
                      Invoice routes involve two parties: the <span className="font-semibold text-sunset-600">requester/beneficiary</span> (you, who creates the invoice and receives payments) and the <span className="font-semibold text-sunset-600">payer</span> (who accepts and funds it). You create an invoice without needing to own any tokens—the payer funds the route when they accept, and you receive the payments.
                    </p>
                    
                    <div className="bg-forest-50 p-4 rounded-lg border border-forest-200 mb-4">
                      <p className="text-sm text-forest-700 mb-2">
                        <span className="font-semibold">Key Difference:</span> Unlike regular routes where you deposit tokens immediately, invoice routes let you request payment from someone else. The payer reviews and decides whether to accept or decline your invoice.
                      </p>
                      <ul className="text-sm text-forest-600 space-y-1 ml-4 mt-2">
                        <li>• Requester creates invoice (no tokens needed)</li>
                        <li>• Payer reviews and accepts/declines</li>
                        <li>• If accepted, payer funds the route</li>
                        <li>• Requester (as beneficiary) claims tokens as they unlock</li>
                      </ul>
                    </div>
                  </div>

                  <div className="border-t border-forest-200 pt-6">
                    <h3 className="font-display font-bold text-lg text-forest-800 mb-4">Creating an Invoice Route</h3>
                    
                    <div className="space-y-5">
                      <div className="flex space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-sunset-500 rounded-full flex items-center justify-center text-white font-bold">1</div>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-display font-semibold text-forest-800 mb-2">Connect Wallet & Select Invoice Route</h4>
                          <p className="text-forest-700 mb-2">
                            Connect your wallet (Aptos or Algorand) and navigate to "Your Routes". Click "+ CREATE" and select "Invoice Route" as the route type. Your connected wallet will automatically be set as the beneficiary who receives payments.
                          </p>
                          <div className="space-y-2 ml-4 mb-3">
                            <div className="flex items-start">
                              <span className="inline-flex items-center justify-center px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-semibold mr-2 mt-0.5">Aptos</span>
                              <p className="text-sm text-forest-600">Petra, Martian, Pontem, Nightly, or other Aptos-compatible wallets</p>
                            </div>
                            <div className="flex items-start">
                              <span className="inline-flex items-center justify-center px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-xs font-semibold mr-2 mt-0.5">Algorand</span>
                              <p className="text-sm text-forest-600">Pera, Defly, or Lute wallets</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-sunset-500 rounded-full flex items-center justify-center text-white font-bold">2</div>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-display font-semibold text-forest-800 mb-2">Select Token & Amount</h4>
                          <p className="text-forest-700 mb-3">
                            Choose the token you want to request payment in and enter the total amount. You don't need to own this token—you're requesting payment, not sending it. Available tokens depend on your selected network:
                          </p>
                          <div className="space-y-2 ml-4 mb-3">
                            <p className="text-sm text-forest-600"><span className="font-semibold">Aptos:</span> USDC, USDT, USDe, AURO USDA</p>
                            <p className="text-sm text-forest-600"><span className="font-semibold">Algorand:</span> USDC, xUSD</p>
                          </div>
                          <div className="bg-forest-50 p-3 rounded border border-forest-200">
                            <p className="text-sm text-forest-600"><span className="font-semibold">Example:</span> Request 5,000 USDC for completed project work</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-sunset-500 rounded-full flex items-center justify-center text-white font-bold">3</div>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-display font-semibold text-forest-800 mb-2">Configure Payment Schedule</h4>
                          <p className="text-forest-700 mb-3">
                            Set how frequently tokens should unlock for claiming. You can choose from minutes, hours, days, weeks, or months. This determines how often the beneficiary can claim tokens once the payer accepts.
                          </p>
                          <div className="bg-forest-50 p-3 rounded border border-forest-200">
                            <p className="text-sm text-forest-600"><span className="font-semibold">Example:</span> 1,000 USDC unlocks every 1 month over 5 months</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-sunset-500 rounded-full flex items-center justify-center text-white font-bold">4</div>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-display font-semibold text-forest-800 mb-2">Enter Payer Address</h4>
                          <p className="text-forest-700 mb-2">
                            Enter the wallet address of the person or organization who should receive and pay this invoice. The address format depends on your selected network:
                          </p>
                          <div className="space-y-1 ml-4 mb-3">
                            <p className="text-sm text-forest-600"><span className="font-semibold">Aptos:</span> 0x... format address</p>
                            <p className="text-sm text-forest-600"><span className="font-semibold">Algorand:</span> Standard Algorand address or NFD (Name) address like <span className="font-mono">alice.algo</span></p>
                          </div>
                          <p className="text-sm text-forest-600">
                            💡 Use the Address Book feature to save frequently used payer addresses with custom labels.
                          </p>
                        </div>
                      </div>

                      <div className="flex space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-sunset-500 rounded-full flex items-center justify-center text-white font-bold">5</div>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-display font-semibold text-forest-800 mb-2">Set Start Date</h4>
                          <p className="text-forest-700">
                            Choose when the route should begin after the payer accepts. You can schedule it to start immediately upon acceptance or at a future date and time.
                          </p>
                        </div>
                      </div>

                      <div className="flex space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-sunset-500 rounded-full flex items-center justify-center text-white font-bold">6</div>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-display font-semibold text-forest-800 mb-2">Create Invoice</h4>
                          <p className="text-forest-700 mb-3">
                            Review all details and click "Create Invoice". Approve the transaction in your wallet. No tokens are transferred at this stage—you're just creating the payment request.
                          </p>
                          <div className="bg-forest-50 p-3 rounded border border-forest-200">
                            <p className="text-sm text-forest-600">
                              <span className="font-semibold">Note:</span> You'll pay minimal network gas fees (APT on Aptos, ALGO on Algorand) for creating the invoice transaction. Platform fees are deducted from the payment amount when the payer accepts, so they're effectively paid by you as the requester.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-forest-200 pt-6">
                    <h3 className="font-display font-bold text-lg text-forest-800 mb-4">For Payers: Approving an Invoice</h3>
                    
                    <div className="space-y-5">
                      <div className="flex space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold">1</div>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-display font-semibold text-forest-800 mb-2">View Incoming Invoices</h4>
                          <p className="text-forest-700">
                            Go to "Your Routes" and navigate to the "Invoices" tab. You'll see all invoices where you are listed as the payer. Invoices will show as "Pending" until you take action.
                          </p>
                        </div>
                      </div>

                      <div className="flex space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold">2</div>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-display font-semibold text-forest-800 mb-2">Review Invoice Details</h4>
                          <p className="text-forest-700 mb-3">
                            Click on the invoice card to view full details including:
                          </p>
                          <ul className="text-sm text-forest-600 space-y-1 ml-4">
                            <li>• Total amount requested</li>
                            <li>• Payment schedule (unlock frequency)</li>
                            <li>• Start date</li>
                            <li>• Beneficiary address</li>
                            <li>• Token type</li>
                          </ul>
                        </div>
                      </div>

                      <div className="flex space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold">3</div>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-display font-semibold text-forest-800 mb-2">Accept & Fund Invoice</h4>
                          <p className="text-forest-700 mb-3">
                            If you approve the invoice, click "Accept & Fund". You'll need to have sufficient balance of the requested token in your wallet. The transaction will transfer the full route amount plus network gas fees (APT on Aptos, ALGO on Algorand).
                          </p>
                          <div className="bg-forest-50 p-3 rounded border border-forest-200">
                            <p className="text-sm text-forest-600">
                              <span className="font-semibold">Note:</span> Platform fees are deducted from the route amount itself, so you transfer the full requested amount. The platform fee is effectively paid by the requester since it reduces the amount they receive.
                            </p>
                          </div>
                          <p className="text-sm text-forest-600 mt-3">
                            Once confirmed, the invoice becomes an active route and tokens begin unlocking according to the schedule.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-forest-200 pt-6">
                    <h3 className="font-display font-bold text-lg text-forest-800 mb-4">Declining an Invoice</h3>
                    
                    <div className="space-y-5">
                      <div className="flex space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white font-bold">1</div>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-display font-semibold text-forest-800 mb-2">Review the Invoice</h4>
                          <p className="text-forest-700">
                            If you need to decline an invoice, first review it to ensure you understand what you're rejecting. Once declined, the invoice cannot be reactivated.
                          </p>
                        </div>
                      </div>

                      <div className="flex space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white font-bold">2</div>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-display font-semibold text-forest-800 mb-2">Click Decline</h4>
                          <p className="text-forest-700 mb-3">
                            Click the "Decline" button on the invoice card. You'll be asked to confirm the action. Approve the transaction in your wallet to finalize the decline.
                          </p>
                          <div className="bg-red-50 p-3 rounded border border-red-200">
                            <p className="text-sm text-forest-600">
                              <span className="font-semibold">Note:</span> Declining an invoice only requires a small network gas fee (APT on Aptos, ALGO on Algorand). No tokens are transferred when declining.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white font-bold">3</div>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-display font-semibold text-forest-800 mb-2">Invoice Status Updates</h4>
                          <p className="text-forest-700">
                            After declining, the invoice status changes to "Declined" and will appear in both your and the requester's invoice history. The requester will be able to see that the invoice was declined.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-forest-200 pt-6">
                    <h3 className="font-display font-bold text-lg text-forest-800 mb-4">Receiving Payments (As Requester/Beneficiary)</h3>
                    
                    <div className="space-y-5">
                      <div className="flex space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">1</div>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-display font-semibold text-forest-800 mb-2">Wait for Payer Acceptance</h4>
                          <p className="text-forest-700 mb-3">
                            After creating an invoice, it will show as "Pending" until the payer accepts it. You cannot claim tokens until the payer accepts and funds the invoice.
                          </p>
                          <div className="bg-forest-50 p-3 rounded border border-forest-200">
                            <p className="text-sm text-forest-600">
                              <span className="font-semibold">Tip:</span> You can check the invoice status in "Your Routes" → "Invoices" tab to see if it's been accepted or declined.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">2</div>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-display font-semibold text-forest-800 mb-2">Invoice Becomes Active Route</h4>
                          <p className="text-forest-700">
                            Once the payer accepts and funds the invoice, it automatically becomes an active route. Tokens begin unlocking according to the schedule you set when creating the invoice. Note that platform fees are deducted from the total amount, so you'll receive slightly less than the requested amount.
                          </p>
                        </div>
                      </div>

                      <div className="flex space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">3</div>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-display font-semibold text-forest-800 mb-2">Claim Tokens as They Unlock</h4>
                          <p className="text-forest-700 mb-3">
                            Claim tokens just like a regular linear route. Go to "Your Routes", find the active invoice route, and click "Claim" to transfer available tokens to your wallet. You can claim as frequently as you like.
                          </p>
                          <div className="bg-blue-50 p-3 rounded border border-blue-200">
                            <p className="text-sm text-forest-600">
                              <span className="font-semibold">Claiming Strategy:</span> Consider batching claims to minimize gas fees (APT on Aptos, ALGO on Algorand). For example, if tokens unlock weekly, you might claim monthly to reduce transaction costs.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-forest-200 pt-6">
                    <h3 className="font-display font-bold text-lg text-forest-800 mb-4">Understanding Fees</h3>
                    <p className="text-forest-700 leading-relaxed mb-4">
                      Invoice routes have two types of fees:
                    </p>
                    <div className="space-y-4">
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <h4 className="font-semibold text-blue-800 mb-2">1. Network Fees</h4>
                        <p className="text-sm text-blue-700">
                          Network fees (gas fees) are paid by everyone when signing blockchain transactions. These are minimal fees required by the network:
                        </p>
                        <ul className="text-sm text-blue-700 space-y-1 ml-4 mt-2">
                          <li>• Creating an invoice: Small network fee (APT on Aptos, ALGO on Algorand)</li>
                          <li>• Accepting/declining: Small network fee (APT on Aptos, ALGO on Algorand)</li>
                          <li>• Claiming tokens: Small network fee per claim (APT on Aptos, ALGO on Algorand)</li>
                        </ul>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                        <h4 className="font-semibold text-purple-800 mb-2">2. Platform Fees</h4>
                        <p className="text-sm text-purple-700 mb-2">
                          Platform fees are taken out of the requested payment amount, meaning they are effectively paid by the requester (you):
                        </p>
                        <ul className="text-sm text-purple-700 space-y-1 ml-4">
                          <li>• <span className="font-semibold">Aptos:</span> 0.5% of the route amount</li>
                          <li>• <span className="font-semibold">Algorand:</span> 0.5% to 0.1% depending on token type and FLUX level</li>
                        </ul>
                        <p className="text-sm text-purple-700 mt-2">
                          <span className="font-semibold">Example:</span> If you request 1,000 USDC and the platform fee is 0.5%, the payer transfers 1,000 USDC, but you receive 995 USDC (5 USDC goes to platform fees).
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-forest-200 pt-6">
                    <h3 className="font-display font-bold text-lg text-forest-800 mb-3">Invoice Routes vs. Other Route Types</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <h4 className="font-semibold text-purple-800 mb-2 flex items-center">
                          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                          </svg>
                          Invoice Routes
                        </h4>
                        <ul className="text-sm text-purple-700 space-y-1">
                          <li>• Request payment from payer</li>
                          <li>• Payer accepts/declines</li>
                          <li>• No tokens needed to create</li>
                          <li>• Payer funds when accepting</li>
                          <li>• Platform fees deducted from amount</li>
                          <li>• Available on Aptos & Algorand</li>
                        </ul>
                      </div>

                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
                          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                          Linear Routes
                        </h4>
                        <ul className="text-sm text-blue-700 space-y-1">
                          <li>• Sender deposits immediately</li>
                          <li>• Automatic time-based unlocking</li>
                          <li>• No approval needed</li>
                          <li>• Ideal for salaries</li>
                          <li>• Available on Aptos & Algorand</li>
                        </ul>
                      </div>

                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <h4 className="font-semibold text-green-800 mb-2 flex items-center">
                          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Milestone Routes
                        </h4>
                        <ul className="text-sm text-green-700 space-y-1">
                          <li>• Sender deposits upfront</li>
                          <li>• Sender approves each milestone</li>
                          <li>• Great for project work</li>
                          <li>• Sender maintains control</li>
                          <li>• Available on Aptos</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 p-5 bg-gradient-to-r from-forest-100 to-sunset-100 rounded-lg border border-sunset-200">
                  <h4 className="font-display font-bold text-forest-800 mb-2">💡 Use Cases</h4>
                  <p className="text-forest-700 text-sm mb-2">
                    Invoice routes are perfect for:
                  </p>
                  <ul className="text-forest-700 text-sm space-y-1 ml-4">
                    <li>• Freelancers requesting payment for completed work</li>
                    <li>• Businesses invoicing clients with payment plans</li>
                    <li>• Service providers requesting upfront or scheduled payments</li>
                    <li>• Any scenario where you need to request payment rather than send it</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          )}

          {/* Milestone Routes Section */}
          {activeSection === "milestone-routes" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="bg-white rounded-xl p-4 md:p-6 border border-forest-200 shadow-sm mb-6">
                <h2 className="font-display text-xl md:text-2xl font-bold text-forest-800 uppercase tracking-wide mb-4">
                  Milestone Routes: Approvals & Claims
                </h2>
                <p className="text-base md:text-lg text-forest-700 leading-relaxed mb-6">
                  Milestone routes give the sender control over when tokens are released. Unlike linear routes that unlock automatically, milestone routes require the sender to approve each payment before the recipient can claim. This is ideal for project-based payments, contractor work, or any situation where payment depends on completed milestones.
                </p>

                <div className="space-y-6">
                  <div>
                    <h3 className="font-display font-bold text-lg text-forest-800 mb-3">How Milestone Routes Work</h3>
                    <p className="text-forest-700 leading-relaxed mb-4">
                      Milestone routes operate differently from linear routes. While the route is set up with a schedule (e.g., 1000 USDC paid out 100 USDC monthly), tokens only become available after the <span className="font-semibold text-sunset-600">sender approves</span> each milestone. This creates a trustless escrow where:
                    </p>
                    
                    <div className="bg-forest-50 p-4 rounded-lg border border-forest-200 mb-4">
                      <ul className="text-sm text-forest-700 space-y-2">
                        <li className="flex items-start">
                          <span className="text-sunset-600 font-bold mr-2">1.</span>
                          <span>The sender deposits the full amount into the route upfront</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-sunset-600 font-bold mr-2">2.</span>
                          <span>When a milestone is complete, the sender approves an unlock amount</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-sunset-600 font-bold mr-2">3.</span>
                          <span>The recipient can then claim the approved amount</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-sunset-600 font-bold mr-2">4.</span>
                          <span>This repeats for each milestone until all funds are released</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="border-t border-forest-200 pt-6">
                    <h3 className="font-display font-bold text-lg text-forest-800 mb-4">For Senders: Approving Milestones</h3>
                    
                    <div className="space-y-5">
                      <div className="flex space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-sunset-500 rounded-full flex items-center justify-center text-white font-bold">1</div>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-display font-semibold text-forest-800 mb-2">Review Milestone Completion</h4>
                          <p className="text-forest-700">
                            When the recipient notifies you that a milestone is complete, review their work or deliverables to confirm the milestone has been satisfactorily achieved.
                          </p>
                        </div>
                      </div>

                      <div className="flex space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-sunset-500 rounded-full flex items-center justify-center text-white font-bold">2</div>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-display font-semibold text-forest-800 mb-2">Connect to Your Route</h4>
                          <p className="text-forest-700">
                            Go to "Your Routes" and find the milestone route you created. You must be connected with the wallet that created the route (the depositor address).
                          </p>
                        </div>
                      </div>

                      <div className="flex space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-sunset-500 rounded-full flex items-center justify-center text-white font-bold">3</div>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-display font-semibold text-forest-800 mb-2">Approve Unlock Amount</h4>
                          <p className="text-forest-700 mb-3">
                            Click "Approve Milestone" on the route card. Enter the amount you want to unlock for the recipient to claim. This can be the scheduled amount or any custom amount up to the remaining balance.
                          </p>
                          <div className="bg-forest-50 p-3 rounded border border-forest-200">
                            <p className="text-sm text-forest-600"><span className="font-semibold">Example:</span> If the route is 1000 USDC with 100 USDC per period, you can approve 100 USDC for the first milestone, or approve 200 USDC if two milestones are complete.</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-sunset-500 rounded-full flex items-center justify-center text-white font-bold">4</div>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-display font-semibold text-forest-800 mb-2">Confirm Transaction</h4>
                          <p className="text-forest-700 mb-3">
                            Approve the transaction in your wallet. Once confirmed on-chain, the specified amount becomes available for the recipient to claim immediately.
                          </p>
                          <div className="bg-blue-50 p-3 rounded border border-blue-200">
                            <p className="text-sm text-blue-700">
                              <span className="font-semibold">💡 Tip:</span> The recipient will be notified (if they're watching the route) that funds are available to claim.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-forest-200 pt-6">
                    <h3 className="font-display font-bold text-lg text-forest-800 mb-4">For Recipients: Claiming from Milestone Routes</h3>
                    
                    <div className="space-y-5">
                      <div className="flex space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold">1</div>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-display font-semibold text-forest-800 mb-2">Complete Your Milestone</h4>
                          <p className="text-forest-700">
                            Complete the work or deliverable associated with the milestone. Communicate with the sender to confirm the milestone is ready for review.
                          </p>
                        </div>
                      </div>

                      <div className="flex space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold">2</div>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-display font-semibold text-forest-800 mb-2">Wait for Approval</h4>
                          <p className="text-forest-700 mb-3">
                            The sender will review your work and approve the milestone payment. You'll see the "Approved Amount" increase on your route card once the approval transaction is confirmed.
                          </p>
                          <div className="bg-forest-50 p-3 rounded border border-forest-200">
                            <p className="text-sm text-forest-600"><span className="font-semibold">Note:</span> You cannot claim tokens until the sender approves the milestone, even if time has passed according to the schedule.</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold">3</div>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-display font-semibold text-forest-800 mb-2">Check Claimable Amount</h4>
                          <p className="text-forest-700">
                            Go to "Your Routes" and view your milestone route. The route card will show how much has been approved and is available for you to claim.
                          </p>
                        </div>
                      </div>

                      <div className="flex space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold">4</div>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-display font-semibold text-forest-800 mb-2">Claim Your Tokens</h4>
                          <p className="text-forest-700 mb-3">
                            Click "Claim" to initiate the claim transaction. Approve the transaction in your wallet, and the approved tokens will be transferred to your wallet immediately.
                          </p>
                          <div className="bg-sunset-50 p-3 rounded border border-sunset-200">
                            <p className="text-sm text-forest-600">
                              <span className="font-semibold">Gas Fees:</span> Each claim requires a blockchain transaction with gas fees (APT on Aptos, ALGO on Algorand).
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-forest-200 pt-6">
                    <h3 className="font-display font-bold text-lg text-forest-800 mb-3">Key Differences: Milestone vs Linear</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <h4 className="font-semibold text-purple-800 mb-2 flex items-center">
                          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Milestone Routes
                        </h4>
                        <ul className="text-sm text-purple-700 space-y-1">
                          <li>• Sender approval required before claims</li>
                          <li>• Great for project-based work</li>
                          <li>• Depositor maintains control</li>
                          <li>• Available on Aptos</li>
                        </ul>
                      </div>

                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
                          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                          Linear Routes
                        </h4>
                        <ul className="text-sm text-blue-700 space-y-1">
                          <li>• Automatic time-based unlocking</li>
                          <li>• Ideal for salaries & subscriptions</li>
                          <li>• Fully automated, no approvals</li>
                          <li>• Available on Aptos & Algorand</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 p-5 bg-gradient-to-r from-forest-100 to-sunset-100 rounded-lg border border-sunset-200">
                  <h4 className="font-display font-bold text-forest-800 mb-2">🤝 Trust & Flexibility</h4>
                  <p className="text-forest-700 text-sm">
                    Milestone routes balance trust with on-chain security. The sender maintains approval control, but once funds are deposited, they cannot be withdrawn—ensuring the recipient will receive payment once milestones are approved. This creates a fair, transparent process for both parties.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Discord CTA Section */}
        <div className="border-t border-forest-200 bg-gradient-to-r from-forest-50 to-sunset-50 py-8 md:py-12 px-4 md:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-br from-forest-600 to-forest-700 p-3 md:p-4 rounded-full">
                <svg
                  className="w-6 h-6 md:w-8 md:h-8 text-primary-100"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M20.317 4.36a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.111.806-.154 1.17-1.5-.224-2.994-.224-4.478 0a8.18 8.18 0 0 0-.155-1.17.076.076 0 0 0-.079-.037 19.736 19.736 0 0 0-4.885 1.515.07.07 0 0 0-.032.027C.533 8.074-.32 11.663.099 15.202a.082.082 0 0 0 .031.057c2.03 1.5 3.995 2.407 5.927 3.016a.076.076 0 0 0 .083-.026c.455-.623.885-1.278 1.244-1.966a.075.075 0 0 0-.041-.105 13.229 13.229 0 0 1-1.886-.9.075.075 0 0 1-.008-.126c.126-.094.252-.192.372-.29a.075.075 0 0 1 .078-.01c3.927 1.792 8.18 1.792 12.061 0a.075.075 0 0 1 .078.01c.12.099.246.196.373.29a.075.075 0 0 1-.007.127 12.239 12.239 0 0 1-1.887.899.075.075 0 0 0-.041.105c.363.689.79 1.343 1.243 1.967a.076.076 0 0 0 .083.026c1.937-.61 3.902-1.516 5.932-3.016a.076.076 0 0 0 .032-.057c.5-4.107-.839-7.66-3.549-10.815a.06.06 0 0 0-.031-.026Z"
                    fill="currentColor"
                  />
                </svg>
              </div>
            </div>
            <h3 className="font-display text-xl md:text-2xl font-bold text-forest-800 uppercase tracking-wide mb-3">
              Have Questions?
            </h3>
            <p className="text-base md:text-lg text-forest-700 leading-relaxed mb-6 max-w-2xl mx-auto">
              Need help or want to learn more? Join our Discord community to get support, share feedback, and connect with other Waypoint users.
            </p>
            <a
              href="https://discord.gg/pSG93C6UN8"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 md:space-x-3 bg-gradient-to-r from-forest-500 to-forest-600 hover:from-forest-600 hover:to-forest-700 text-primary-100 font-display text-base md:text-lg uppercase tracking-wider font-bold py-3 px-6 md:py-4 md:px-8 rounded-xl transition-all duration-200 ease-out transform hover:translate-y-1 hover:scale-105 shadow-lg hover:shadow-xl border-2 border-forest-600"
            >
              <svg
                className="w-5 h-5 md:w-6 md:h-6"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M20.317 4.36a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.111.806-.154 1.17-1.5-.224-2.994-.224-4.478 0a8.18 8.18 0 0 0-.155-1.17.076.076 0 0 0-.079-.037 19.736 19.736 0 0 0-4.885 1.515.07.07 0 0 0-.032.027C.533 8.074-.32 11.663.099 15.202a.082.082 0 0 0 .031.057c2.03 1.5 3.995 2.407 5.927 3.016a.076.076 0 0 0 .083-.026c.455-.623.885-1.278 1.244-1.966a.075.075 0 0 0-.041-.105 13.229 13.229 0 0 1-1.886-.9.075.075 0 0 1-.008-.126c.126-.094.252-.192.372-.29a.075.075 0 0 1 .078-.01c3.927 1.792 8.18 1.792 12.061 0a.075.075 0 0 1 .078.01c.12.099.246.196.373.29a.075.075 0 0 1-.007.127 12.239 12.239 0 0 1-1.887.899.075.075 0 0 0-.041.105c.363.689.79 1.343 1.243 1.967a.076.076 0 0 0 .083.026c1.937-.61 3.902-1.516 5.932-3.016a.076.076 0 0 0 .032-.057c.5-4.107-.839-7.66-3.549-10.815a.06.06 0 0 0-.031-.026Z"
                  fill="currentColor"
                />
              </svg>
              <span>Join Discord Community</span>
            </a>
          </div>
        </div>
      </div>
      </div>
      <Footer />
    </div>
  );
}
