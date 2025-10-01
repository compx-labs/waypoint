import type { Route } from "./+types/docs";
import { motion } from "framer-motion";
import DocsNavigation from "../components/DocsNavigation";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Waypoint Docs - Your Adventure Guide" },
    {
      name: "description",
      content: "Complete documentation for the Waypoint ecosystem. Learn how to create payment routes, manage expeditions, and navigate the future of stablecoin streaming."
    },
    {
      name: "keywords",
      content: "waypoint, documentation, payment routes, stablecoin streaming, DeFi, blockchain, adventure guide"
    }
  ];
}

export default function Docs() {
  return (
    <div className="min-h-screen bg-primary-100 flex">
      {/* Sidebar Navigation */}
      <DocsNavigation />
      
      {/* Main Content */}
      <motion.div 
        className="flex-1 overflow-auto"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-forest-800 to-forest-700 border-b border-forest-600 px-8 py-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-sunset-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-primary-100" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <motion.h1 
              className="font-display text-3xl font-bold text-primary-100 uppercase tracking-wider"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              ADVENTURE OVERVIEW
            </motion.h1>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-8">
          {/* Welcome Section */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h2 className="font-display text-2xl font-bold text-forest-800 uppercase tracking-wide mb-4">
              Welcome to Waypoint - Adventure Guide
            </h2>
            <p className="text-lg text-forest-700 leading-relaxed mb-6">
              Get a complete overview of the Waypoint ecosystem and its route-mapping capabilities
            </p>
          </motion.div>

         

          {/* Content Description */}
          <motion.div
            className="prose prose-lg max-w-none"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <div className="bg-white rounded-xl p-6 border border-forest-200 shadow-sm">
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
        </div>
      </motion.div>
    </div>
  );
}
