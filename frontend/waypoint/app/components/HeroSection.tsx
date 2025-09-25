export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-stone-200 flex items-center min-h-screen pt-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Side - Text and Buttons */}
          <div className="flex flex-col space-y-8 text-left">
            <div>
              <h1 className="text-5xl lg:text-6xl font-display text-forest-700 leading-tight uppercase">
                Your route through{" "}
                <span className="text-sunset-500">stablecoin payments</span>
              </h1>
              <p className="mt-6 text-lg text-forest-600 font-display leading-relaxed">
                Mark the route. Stream the journey. Discover the future of payments with Waypoint's 
                adventure-inspired platform for continuous stablecoin streaming.
              </p>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="bg-forest-500 hover:bg-forest-600 text-primary-100 font-display text-lg uppercase tracking-wider font-bold py-4 px-7 rounded-xl transition-all duration-200 ease-out transform hover:translate-y-1 hover:scale-105 shadow-lg hover:shadow-xl border-2 border-forest-600">
                Start Your Journey
              </button>
              <button className="bg-transparent border-2 border-forest-500 text-forest-500 hover:bg-forest-500 hover:text-primary-100 font-display text-lg uppercase tracking-wider font-semibold py-4 px-7 rounded-xl transition-all duration-200 ease-out transform hover:translate-y-1 hover:scale-105 shadow-md hover:shadow-lg">
                Learn More
              </button>
            </div>
            
            {/* Key Features */}
            <div className="grid grid-cols-2 gap-6 pt-4">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-sunset-500 rounded-full"></div>
                <span className="text-forest-600 font-display text-sm uppercase tracking-wide">
                  Continuous Streaming
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-sunset-500 rounded-full"></div>
                <span className="text-forest-600 font-display text-sm uppercase tracking-wide">
                  Multi-Chain Support
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-sunset-500 rounded-full"></div>
                <span className="text-forest-600 font-display text-sm uppercase tracking-wide">
                  Transparent schedules
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-sunset-500 rounded-full"></div>
                <span className="text-forest-600 font-display text-sm uppercase tracking-wide">
                  Easy to use
                </span>
              </div>
            </div>
          </div>

          {/* Right Side - Hero Logo */}
          <div className="flex justify-center lg:justify-end">
            <img
              src="/waypoint-logo-stylised-trans.png"
              alt="Waypoint Logo"
              className="w-full  drop-shadow-2xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
