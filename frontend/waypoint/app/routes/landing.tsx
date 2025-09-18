import type { Route } from "./+types/landing";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Waypoint - Your Payments, Your Expedition" },
    {
      name: "description",
      content:
        "Mark the route. Stream the journey. Discover the future of payments with Waypoint's adventure-inspired platform.",
    },
    {
      name: "keywords",
      content:
        "stablecoin, streaming, payments, DeFi, blockchain, continuous payments, expedition",
    },
  ];
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-forest-700">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-forest-800 via-forest-600 to-forest-500 min-h-screen flex items-center">
        {/* Background decorative elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-sunset-500 blur-xl"></div>
          <div className="absolute bottom-32 right-20 w-48 h-48 rounded-full bg-coral-500 blur-2xl"></div>
          <div className="absolute top-1/2 left-1/4 w-24 h-24 rounded-full bg-primary-100 blur-lg"></div>

          {/* Adventure map markers */}
          <div className="absolute top-32 right-32 w-8 h-8 bg-sunset-400/40 rounded-full"></div>
          <div className="absolute bottom-40 left-20 w-6 h-6 bg-coral-400/50 rounded-full"></div>
          <div className="absolute top-1/3 right-1/4 w-5 h-5 bg-sky-400/60 rounded-full"></div>
          <div className="absolute bottom-1/4 right-1/3 w-7 h-7 bg-primary-300/40 rounded-full"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-5 gap-12 items-center">
            {/* Left Content - 60% */}
            <div className="lg:col-span-3 space-y-8">
              {/* Headline */}
              <div className="space-y-6">
                <h1 className="font-display text-6xl lg:text-8xl text-primary-50 leading-tight tracking-wide uppercase">
                  Streaming Value
                  <span className="text-sunset-400 block transform rotate-1">
                    One Waypoint at a Time!
                  </span>
                </h1>

                {/* Sub-headline */}
                <p className="text-xl lg:text-2xl text-primary-100 max-w-2xl leading-relaxed font-medium">
                  Effortlessly schedule stablecoin payments that release over
                  time.{" "}
                  <span className="block mt-3 text-lg lg:text-xl text-sunset-200">
                    Every claim, every checkpoint, mapped clearly on your route.
                  </span>
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-6 pt-8">
                <button className="btn-sunset text-xl px-12 py-6 font-display uppercase tracking-wide">
                  Start Streaming
                </button>
                <button className="btn-coral text-xl px-12 py-6 font-display uppercase tracking-wide">
                  View Demo
                </button>
              </div>

              {/* Adventure badges */}
              <div className="flex items-center gap-4 pt-12 overflow-x-auto">
                <div className="flex items-center gap-3 bg-forest-900/40 px-5 py-3 rounded-xl backdrop-blur-sm border border-sunset-400/50">
                  <div className="w-3 h-3 bg-coral-500 rounded-full"></div>
                  <span className="text-sm font-bold text-primary-50 uppercase tracking-wide">
                    Transparent Streams
                  </span>
                </div>
                <div className="flex items-center gap-3 bg-forest-900/40 px-5 py-3 rounded-xl backdrop-blur-sm border border-sunset-400/50">
                  <div className="w-3 h-3 bg-sunset-500 rounded-full"></div>
                  <span className="text-sm font-bold text-primary-50 uppercase tracking-wide">
                    Stablecoin Native
                  </span>
                </div>
                <div className="flex items-center gap-3 bg-forest-900/40 px-5 py-3 rounded-xl backdrop-blur-sm border border-sunset-400/50">
                  <div className="w-3 h-3 bg-sky-500 rounded-full"></div>
                  <span className="text-sm font-bold text-primary-50 uppercase tracking-wide">
                    Milestone Tracking
                  </span>
                </div>
              </div>
            </div>

            {/* Right Illustration - 40% */}
            <div className="lg:col-span-2 relative">
              <div className="relative w-full max-w-lg mx-auto">
                {/* Adventure map container */}
                <div className="relative bg-gradient-to-br from-primary-50/20 to-forest-900/30 rounded-2xl p-8 backdrop-blur-sm border-2 border-dashed border-sunset-400/60 shadow-2xl">
                  {/* Treasure map illustration */}
                  <div className="space-y-6">
                    {/* Central compass */}
                    <div className="relative mx-auto w-32 h-32 bg-gradient-to-br from-sunset-500 to-coral-500 rounded-full flex items-center justify-center shadow-2xl">
                      <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center border-4 border-forest-600/50">
                        <div className="w-8 h-8 bg-forest-700 rounded-full relative">
                          <div className="absolute inset-1 border-2 border-sunset-500 rounded-full"></div>
                          <div className="absolute top-1/2 left-1/2 w-1 h-6 bg-coral-500 transform -translate-x-1/2 -translate-y-1/2"></div>
                          <div className="absolute top-1/2 left-1/2 w-6 h-1 bg-coral-500 transform -translate-x-1/2 -translate-y-1/2"></div>
                        </div>
                      </div>
                      {/* Compass rings */}
                      <div className="absolute -inset-4 border-2 border-primary-100/50 rounded-full"></div>
                      <div className="absolute -inset-8 border border-sunset-400/40 rounded-full"></div>
                    </div>

                    {/* Trail routes visualization */}
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-forest-500 rounded-full flex items-center justify-center border-2 border-sunset-400">
                            <div className="w-3 h-3 bg-primary-50 rounded-full"></div>
                          </div>
                          <div className="flex-1 h-3 bg-gradient-to-r from-forest-500 to-sunset-500 rounded-full relative overflow-hidden border-2 border-dashed border-coral-400/50">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-50/60 to-transparent"></div>
                          </div>
                          <div className="w-8 h-8 bg-coral-500 rounded-full flex items-center justify-center border-2 border-sunset-400">
                            <div className="w-4 h-4 bg-primary-50 transform rotate-45 border border-forest-500"></div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Adventure waypoint markers */}
                    <div className="flex justify-center gap-4 pt-6">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="w-12 h-12 bg-primary-50/30 rounded-xl flex items-center justify-center backdrop-blur-sm border-2 border-dashed border-sunset-400/60"
                        >
                          <div
                            className={`w-5 h-5 rounded-full ${
                              i === 1
                                ? "bg-coral-500"
                                : i === 2
                                  ? "bg-sunset-500"
                                  : "bg-sky-500"
                            } shadow-lg`}
                          ></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Adventure floating elements */}
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-sunset-500/30 rounded-xl border-2 border-dashed border-coral-400/60"></div>
                <div className="absolute -bottom-6 -left-6 w-12 h-12 bg-forest-500/40 rounded-full border-2 border-sunset-400/60"></div>
              </div>
            </div>
          </div>
        </div>

        
      </section>

      {/* What is Waypoint Section */}
      <section className="py-20 bg-primary-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="space-y-6">
                <h2 className="font-display text-4xl lg:text-6xl text-forest-700 leading-tight uppercase">
                  What is
                  <span className="text-sunset-500 block">Waypoint?</span>
                </h2>

                <div className="space-y-6 text-lg text-forest-600 leading-relaxed">
                  <p>
                    <strong className="text-forest-700">
                      Waypoint revolutionizes payments
                    </strong>{" "}
                    by turning continuous token streaming into an intuitive
                    journey. Instead of complex DeFi protocols, think of payment
                    routes with clear milestones.
                  </p>

                  <p>
                    Set up streams that flow automatically from sender to
                    receiver, with waypoints marking important milestones along
                    the way. Each waypoint can trigger actions, notifications,
                    or route changes.
                  </p>

                  <p className="text-sunset-600 font-medium italic">
                    "Think of it like markers along your route marking milestones along the way –
                    you always know where your payments are and where they're
                    headed."
                  </p>

                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-coral-500 rounded-full"></div>
                        <span className="font-semibold text-forest-700">
                          Continuous Flow
                        </span>
                      </div>
                      <p className="text-sm text-forest-500 pl-5">
                        Payments stream in real-time, not batches
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-sunset-500 rounded-full"></div>
                        <span className="font-semibold text-forest-700">
                          Smart Waypoints
                        </span>
                      </div>
                      <p className="text-sm text-forest-500 pl-5">
                        Milestones that trigger actions automatically
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-sky-500 rounded-full"></div>
                        <span className="font-semibold text-forest-700">
                          Route Control
                        </span>
                      </div>
                      <p className="text-sm text-forest-500 pl-5">
                        Adjust, pause, or redirect streams anytime
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
                        <span className="font-semibold text-forest-700">
                          Stablecoin Ready
                        </span>
                      </div>
                      <p className="text-sm text-forest-500 pl-5">
                        Built for stable, predictable payments
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Visual - Route Tracking */}
            <div className="relative">
              <div className="bg-gradient-to-br from-primary-100 to-forest-200 rounded-2xl p-8 border-4 border-sunset-400 shadow-2xl">
                {/* Route Tracking Visualization */}
                <div className="space-y-6">
                  {/* Route Header */}
                  <div className="text-center border-b-2 border-dashed border-sunset-400/50 pb-4">
                    <h3 className="font-display text-2xl text-forest-700 uppercase tracking-wide">
                      Live Route Tracking
                    </h3>
                    <p className="text-sm text-forest-600 mt-1 font-semibold">
                      Monthly Salary Stream
                    </p>
                  </div>

                  {/* Straight Route Path */}
                  <div className="relative h-32 bg-primary-50 rounded-xl p-6 border-2 border-dashed border-forest-300">
                    {/* Straight Route Line */}
                    <div className="relative flex items-center h-full">
                      {/* Completed Route (Solid) */}
                      <div className="absolute left-4 right-1/2 top-1/2 transform -translate-y-1/2 h-2 bg-sunset-500 rounded-full"></div>
                      
                      {/* Remaining Route (Dotted) */}
                      <div className="absolute left-1/2 right-4 top-1/2 transform -translate-y-1/2 h-2 bg-coral-400 rounded-full opacity-60" style={{backgroundImage: 'repeating-linear-gradient(to right, transparent, transparent 8px, #FF6B6B 8px, #FF6B6B 16px)'}}></div>

                      {/* Route Waypoints on straight line */}
                      <div className="absolute inset-0 flex items-center justify-between px-4">
                        {/* Start Point */}
                        <div className="flex flex-col items-center">
                          <div className="w-6 h-6 bg-forest-500 border-3 border-primary-50 rounded-full shadow-lg"></div>
                          <div className="text-xs text-forest-700 font-bold mt-1 text-center">
                            START
                          </div>
                        </div>

                        {/* Waypoint 1 - Completed */}
                        <div className="flex flex-col items-center">
                          <div className="w-5 h-5 bg-sunset-500 border-2 border-primary-50 rounded-full shadow-lg"></div>
                          <div className="text-xs text-forest-600 font-bold mt-1 text-center">
                            25%
                          </div>
                        </div>

                        {/* Current Position - Active */}
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 bg-coral-500 border-4 border-primary-50 rounded-full shadow-xl flex items-center justify-center">
                            <div className="w-3 h-3 bg-primary-50 rounded-full"></div>
                          </div>
                          <div className="text-xs text-coral-600 font-bold mt-1 text-center">
                            CURRENT
                          </div>
                        </div>

                        {/* Waypoint 2 - Upcoming */}
                        <div className="flex flex-col items-center">
                          <div className="w-5 h-5 bg-stone-400 border-2 border-dashed border-primary-50 rounded-full opacity-60"></div>
                          <div className="text-xs text-stone-600 font-bold mt-1 text-center">
                            75%
                          </div>
                        </div>

                        {/* End Point - Destination */}
                        <div className="flex flex-col items-center">
                          <div className="w-6 h-6 bg-stone-500 border-2 border-dashed border-primary-50 rounded-full opacity-50"></div>
                          <div className="text-xs text-stone-600 font-bold mt-1 text-center">
                            END
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Live Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-primary-50/80 rounded-lg p-4 border border-forest-300">
                      <div className="text-xs text-forest-600 uppercase tracking-wide">
                        Distance Covered
                      </div>
                      <div className="text-xl font-bold text-forest-700">2.3 km</div>
                      <div className="text-xs text-coral-600">of 5.8 km total</div>
                    </div>

                    <div className="bg-primary-50/80 rounded-lg p-4 border border-forest-300">
                      <div className="text-xs text-forest-600 uppercase tracking-wide">
                        Stream Rate
                      </div>
                      <div className="text-xl font-bold text-forest-700">$167/day</div>
                      <div className="text-xs text-coral-600">Next checkpoint: 3 days</div>
                    </div>
                  </div>

                  {/* Route Status */}
                  <div className="bg-gradient-to-r from-primary-50/80 to-forest-100/60 rounded-lg p-4 border-2 border-dashed border-forest-300">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-forest-700 uppercase tracking-wide">
                        Route Status
                      </span>
                      <span className="text-xs bg-coral-500 text-primary-50 px-3 py-1 rounded-full font-bold">
                        TRACKING
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-forest-600">Progress</span>
                        <span className="font-bold text-forest-700">$1,875 / $5,000</span>
                      </div>

                      <div className="w-full bg-forest-200 rounded-full h-3 border border-forest-300">
                        <div
                          className="bg-gradient-to-r from-sunset-500 to-coral-500 h-full rounded-full"
                          style={{ width: "37.5%" }}
                        ></div>
                      </div>

                      <div className="flex justify-between text-xs">
                        <span className="text-forest-600 font-semibold">ETA: 18 days</span>
                        <span className="text-coral-600 font-semibold">37.5% complete</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Waypoint Section */}
      <section className="py-20 bg-gradient-to-br from-forest-700 via-forest-600 to-forest-500">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl lg:text-6xl text-primary-50 leading-tight uppercase mb-6">
              Why 
              <span className="text-sunset-400 block">
                Waypoint?
              </span>
            </h2>
            <p className="text-xl text-primary-100 max-w-3xl mx-auto">
              Built for the modern payment landscape with adventure-grade reliability
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Simple & Friendly */}
            <div className="bg-gradient-to-br from-primary-50/10 to-forest-900/30 rounded-2xl p-8 border-2 border-dashed border-sunset-400/50 backdrop-blur-sm">
              <div className="w-16 h-16 bg-sunset-500 rounded-full flex items-center justify-center mb-6 shadow-lg">
                <div className="text-2xl">🌊</div>
              </div>
              <h3 className="font-display text-2xl text-primary-50 uppercase mb-4">Simple & Friendly</h3>
              <p className="text-primary-100 leading-relaxed">
                No complex DeFi jargon. Just set your route and watch your payments flow like a gentle stream.
              </p>
            </div>

            {/* Stablecoin Native */}
            <div className="bg-gradient-to-br from-primary-50/10 to-forest-900/30 rounded-2xl p-8 border-2 border-dashed border-sunset-400/50 backdrop-blur-sm">
              <div className="w-16 h-16 bg-coral-500 rounded-full flex items-center justify-center mb-6 shadow-lg">
                <div className="text-2xl">💵</div>
              </div>
              <h3 className="font-display text-2xl text-primary-50 uppercase mb-4">Stablecoin Native</h3>
              <p className="text-primary-100 leading-relaxed">
                Built for stable, predictable payments. No volatility surprises on your financial journey.
              </p>
            </div>

            {/* Flexible Routes */}
            <div className="bg-gradient-to-br from-primary-50/10 to-forest-900/30 rounded-2xl p-8 border-2 border-dashed border-sunset-400/50 backdrop-blur-sm">
              <div className="w-16 h-16 bg-sky-500 rounded-full flex items-center justify-center mb-6 shadow-lg">
                <div className="text-2xl">🛠</div>
              </div>
              <h3 className="font-display text-2xl text-primary-50 uppercase mb-4">Flexible Routes</h3>
              <p className="text-primary-100 leading-relaxed">
                Customize your payment streams with waypoints, schedules, and conditions that work for you.
              </p>
            </div>

            {/* Tradeable Keys */}
            <div className="bg-gradient-to-br from-primary-50/10 to-forest-900/30 rounded-2xl p-8 border-2 border-dashed border-sunset-400/50 backdrop-blur-sm">
              <div className="w-16 h-16 bg-primary-400 rounded-full flex items-center justify-center mb-6 shadow-lg">
                <div className="text-2xl">🔑</div>
              </div>
              <h3 className="font-display text-2xl text-primary-50 uppercase mb-4">Tradeable Keys</h3>
              <p className="text-primary-100 leading-relaxed">
                NFT-backed routes that can be transferred, sold, or used as collateral. True ownership of your streams.
              </p>
            </div>

            {/* On-Chain Transparency */}
            <div className="bg-gradient-to-br from-primary-50/10 to-forest-900/30 rounded-2xl p-8 border-2 border-dashed border-sunset-400/50 backdrop-blur-sm">
              <div className="w-16 h-16 bg-forest-400 rounded-full flex items-center justify-center mb-6 shadow-lg">
                <div className="text-2xl">🔍</div>
              </div>
              <h3 className="font-display text-2xl text-primary-50 uppercase mb-4">On-Chain Transparency</h3>
              <p className="text-primary-100 leading-relaxed">
                Every transaction is verifiable on-chain. Track your payments with complete transparency and trust.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Who is it For Section */}
      <section className="py-20 bg-primary-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl lg:text-6xl text-forest-700 leading-tight uppercase mb-6">
              Who is it 
              <span className="text-sunset-500 block">
                For?
              </span>
            </h2>
            <p className="text-xl text-forest-600 max-w-3xl mx-auto">
              Waypoint serves adventurers across the payment landscape
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Employers / Teams */}
            <div className="text-center group">
              <div className="w-24 h-24 bg-gradient-to-br from-sunset-500 to-coral-500 rounded-full flex items-center justify-center mb-6 mx-auto shadow-lg group-hover:scale-110 transition-transform duration-200">
                <div className="text-3xl">⚓</div>
              </div>
              <h3 className="font-display text-2xl text-forest-700 uppercase mb-4">Employers / Teams</h3>
              <p className="text-forest-600 leading-relaxed">
                Streamline payroll with continuous salary streams. Set waypoints for bonuses and milestone payments.
              </p>
            </div>

            {/* Projects / DAOs */}
            <div className="text-center group">
              <div className="w-24 h-24 bg-gradient-to-br from-forest-500 to-sky-500 rounded-full flex items-center justify-center mb-6 mx-auto shadow-lg group-hover:scale-110 transition-transform duration-200">
                <div className="text-3xl">🛟</div>
              </div>
              <h3 className="font-display text-2xl text-forest-700 uppercase mb-4">Projects / DAOs</h3>
              <p className="text-forest-600 leading-relaxed">
                Distribute treasury funds continuously. Create transparent funding streams for contributors and grants.
              </p>
            </div>

            {/* Creators / Builders */}
            <div className="text-center group">
              <div className="w-24 h-24 bg-gradient-to-br from-coral-500 to-sunset-500 rounded-full flex items-center justify-center mb-6 mx-auto shadow-lg group-hover:scale-110 transition-transform duration-200">
                <div className="text-3xl">⛵</div>
              </div>
              <h3 className="font-display text-2xl text-forest-700 uppercase mb-4">Creators / Builders</h3>
              <p className="text-forest-600 leading-relaxed">
                Receive continuous support from patrons. Set up subscription-style payments with flexible terms.
              </p>
            </div>

            {/* Everyday Users */}
            <div className="text-center group">
              <div className="w-24 h-24 bg-gradient-to-br from-sky-500 to-primary-500 rounded-full flex items-center justify-center mb-6 mx-auto shadow-lg group-hover:scale-110 transition-transform duration-200">
                <div className="text-3xl">📬</div>
              </div>
              <h3 className="font-display text-2xl text-forest-700 uppercase mb-4">Everyday Users</h3>
              <p className="text-forest-600 leading-relaxed">
                Split bills, send allowances, or make regular payments. Simple streaming for everyday financial needs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-forest-600 to-forest-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl lg:text-6xl text-primary-50 leading-tight uppercase mb-6">
              Adventure-Grade 
              <span className="text-sunset-400 block">
                Features
              </span>
            </h2>
          </div>

          <div className="space-y-24">
            {/* Continuous Payments */}
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-6">
                <div className="w-16 h-16 bg-sunset-500 rounded-full flex items-center justify-center shadow-lg">
                  <div className="text-2xl">⏳</div>
                </div>
                <h3 className="font-display text-3xl lg:text-4xl text-primary-50 uppercase">Continuous Payments</h3>
                <p className="text-xl text-primary-100 leading-relaxed">
                  Money flows in real-time, not batches. Watch your balance update every second as payments stream continuously to their destination.
                </p>
                <div className="flex gap-4">
                  <div className="bg-primary-50/20 px-4 py-2 rounded-full">
                    <span className="text-sm text-sunset-300 font-semibold">Real-time</span>
                  </div>
                  <div className="bg-primary-50/20 px-4 py-2 rounded-full">
                    <span className="text-sm text-sunset-300 font-semibold">Gas Efficient</span>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-primary-50/10 to-forest-900/30 rounded-2xl p-8 border-2 border-dashed border-sunset-400/50">
                <div className="h-48 flex items-center justify-center">
                  <div className="text-6xl opacity-60">💧</div>
                </div>
              </div>
            </div>

            {/* NFT-Backed Routes */}
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="bg-gradient-to-br from-primary-50/10 to-forest-900/30 rounded-2xl p-8 border-2 border-dashed border-coral-400/50 lg:order-1">
                <div className="h-48 flex items-center justify-center">
                  <div className="text-6xl opacity-60">🔑</div>
                </div>
              </div>
              <div className="space-y-6 lg:order-2">
                <div className="w-16 h-16 bg-coral-500 rounded-full flex items-center justify-center shadow-lg">
                  <div className="text-2xl">🔑</div>
                </div>
                <h3 className="font-display text-3xl lg:text-4xl text-primary-50 uppercase">NFT-Backed Routes</h3>
                <p className="text-xl text-primary-100 leading-relaxed">
                  Every payment stream is backed by an NFT. Transfer ownership, use as collateral, or trade your streams like any other digital asset.
                </p>
                <div className="flex gap-4">
                  <div className="bg-primary-50/20 px-4 py-2 rounded-full">
                    <span className="text-sm text-coral-300 font-semibold">Tradeable</span>
                  </div>
                  <div className="bg-primary-50/20 px-4 py-2 rounded-full">
                    <span className="text-sm text-coral-300 font-semibold">Collateral</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Custom Schedules */}
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-6">
                <div className="w-16 h-16 bg-sky-500 rounded-full flex items-center justify-center shadow-lg">
                  <div className="text-2xl">🪝</div>
                </div>
                <h3 className="font-display text-3xl lg:text-4xl text-primary-50 uppercase">Custom Schedules</h3>
                <p className="text-xl text-primary-100 leading-relaxed">
                  Set waypoints with custom triggers. Pause streams, change rates, or redirect funds based on time, conditions, or external events.
                </p>
                <div className="flex gap-4">
                  <div className="bg-primary-50/20 px-4 py-2 rounded-full">
                    <span className="text-sm text-sky-300 font-semibold">Flexible</span>
                  </div>
                  <div className="bg-primary-50/20 px-4 py-2 rounded-full">
                    <span className="text-sm text-sky-300 font-semibold">Automated</span>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-primary-50/10 to-forest-900/30 rounded-2xl p-8 border-2 border-dashed border-sky-400/50">
                <div className="h-48 flex items-center justify-center">
                  <div className="text-6xl opacity-60">⚙️</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-32 bg-gradient-to-br from-forest-800 via-sky-900 to-forest-700 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-sunset-500 blur-xl"></div>
          <div className="absolute bottom-32 right-20 w-48 h-48 rounded-full bg-coral-500 blur-2xl"></div>
          <div className="absolute top-1/2 left-1/4 w-24 h-24 rounded-full bg-primary-100 blur-lg"></div>
        </div>
        
        <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="font-display text-5xl lg:text-7xl text-primary-50 leading-tight uppercase mb-8">
            Payments Should Feel Like a 
            <span className="text-sunset-400 block">
              Smooth Journey
            </span>
          </h2>
          <p className="text-2xl lg:text-3xl text-primary-100 leading-relaxed mb-12 max-w-4xl mx-auto">
            No more complex protocols or confusing interfaces. Just simple, stable, and fun payment streams that work the way you expect them to.
          </p>
          <div className="text-xl lg:text-2xl text-sunset-300 font-display uppercase tracking-wide">
            Waypoint: Keep your tokens sailing smoothly.
          </div>
        </div>
      </section>

      {/* Call-to-Action Section */}
      <section className="py-20 bg-gradient-to-br from-primary-100 to-sunset-100">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="font-display text-4xl lg:text-6xl text-forest-700 leading-tight uppercase mb-8">
            Start your first stream in 
            <span className="text-sunset-500 block">
              just a few clicks
            </span>
          </h2>
          <p className="text-xl text-forest-600 leading-relaxed mb-12 max-w-3xl mx-auto">
            Join the adventure and discover how smooth payments can be. No complex setup, no hidden fees, just pure streaming simplicity.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button className="btn-sunset text-xl px-12 py-6 font-display uppercase tracking-wide">
              Launch App
            </button>
            <button className="btn-coral text-xl px-12 py-6 font-display uppercase tracking-wide">
              Read the Docs
            </button>
          </div>

          <div className="mt-16 flex justify-center gap-8 text-forest-500">
            <div className="text-center">
              <div className="text-3xl font-bold text-forest-700">10K+</div>
              <div className="text-sm uppercase tracking-wide">Streams Created</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-forest-700">$2M+</div>
              <div className="text-sm uppercase tracking-wide">Volume Streamed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-forest-700">99.9%</div>
              <div className="text-sm uppercase tracking-wide">Uptime</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
