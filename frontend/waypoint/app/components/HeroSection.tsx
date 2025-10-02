import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-stone-200 flex items-center min-h-screen pt-20 sm:pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Side - Text and Buttons */}
          <motion.div 
            className="flex flex-col space-y-8 text-left"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <motion.h1 
                className="text-5xl lg:text-6xl font-display text-forest-700 leading-tight uppercase"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                Your route through{" "}
                <motion.span 
                  className="text-sunset-500"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                >
                  stablecoin payments
                </motion.span>
              </motion.h1>
              <motion.p 
                className="mt-6 text-lg text-forest-600 font-display leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.9 }}
              >
                Mark the route. Stream the journey. Discover the future of payments with Waypoint's 
                adventure-inspired platform for continuous stablecoin streaming.
              </motion.p>
            </motion.div>
            
            {/* Action Buttons */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.1 }}
            >
              <motion.button 
                className="bg-forest-500 hover:bg-forest-600 text-primary-100 font-display text-lg uppercase tracking-wider font-bold py-4 px-7 rounded-xl transition-all duration-200 ease-out transform hover:translate-y-1 hover:scale-105 shadow-lg hover:shadow-xl border-2 border-forest-600"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                Start Your Journey
              </motion.button>
              <motion.button 
                className="bg-transparent border-2 border-forest-500 text-forest-500 hover:bg-forest-500 hover:text-primary-100 font-display text-lg uppercase tracking-wider font-semibold py-4 px-7 rounded-xl transition-all duration-200 ease-out transform hover:translate-y-1 hover:scale-105 shadow-md hover:shadow-lg"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                Learn More
              </motion.button>
            </motion.div>
            
            {/* Key Features */}
            <motion.div 
              className="grid grid-cols-2 gap-6 pt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.3, staggerChildren: 0.1 }}
            >
              {["Continuous Streaming", "Multi-Chain Support", "Transparent schedules", "Easy to use"].map((feature, index) => (
                <motion.div 
                  key={feature}
                  className="flex items-center space-x-3"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 1.4 + (index * 0.1) }}
                >
                  <motion.div 
                    className="w-3 h-3 bg-sunset-500 rounded-full"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3, delay: 1.5 + (index * 0.1) }}
                  />
                  <span className="text-forest-600 font-display text-sm uppercase tracking-wide">
                    {feature}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Side - Hero Logo */}
          <motion.div 
            className="flex justify-center lg:justify-end"
            initial={{ opacity: 0, x: 50, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
          >
            <motion.img
              src="/waypoint-logo-stylised-trans.png"
              alt="Waypoint Logo"
              className="w-full drop-shadow-2xl"
              initial={{ rotate: -5, scale: 0.9 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ duration: 1.2, delay: 0.8 }}
              whileHover={{ 
                scale: 1.05,
                rotate: 2,
                transition: { duration: 0.3 }
              }}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
