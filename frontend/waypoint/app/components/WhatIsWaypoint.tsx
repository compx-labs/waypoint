export default function WhatIsWaypoint() {
  return (
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
                  the way. 
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
            <div className="bg-forest-600 rounded-2xl p-8 border-4 border-sunset-400 shadow-2xl">
              {/* Route Tracking Visualization */}
              <div className="space-y-6">
                {/* Route Header */}
                <div className="text-center border-b-2 border-dashed border-sunset-400/50 pb-4">
                  <h3 className="font-display text-2xl text-sunset-700 uppercase tracking-wide">
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
                    <div className="text-xl font-bold text-forest-700">$2,300</div>
                    <div className="text-xs text-coral-600">of $5,000 total</div>
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
  );
}
