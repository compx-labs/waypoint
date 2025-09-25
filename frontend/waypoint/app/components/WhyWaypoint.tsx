import { Navigation, Anchor, Route, Award, Eye } from 'lucide-react';

export default function WhyWaypoint() {
  return (
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
            Chart your course through the payment frontier with expedition-grade reliability
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Simple & Friendly */}
          <div className="bg-gradient-to-br from-primary-50/10 to-forest-900/30 rounded-xl p-6 border-2 border-dashed border-sunset-400/50 backdrop-blur-sm">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 bg-sunset-500 rounded-full flex items-center justify-center shadow-lg">
                <Navigation className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-display text-xl text-primary-50 uppercase">Easy Navigation</h3>
            </div>
            <p className="text-primary-100 leading-relaxed text-sm">
              No complex terrain to traverse. Chart your payment route with simple waypoints and watch your funds flow downstream effortlessly.
            </p>
          </div>

          {/* Stablecoin Native */}
          <div className="bg-gradient-to-br from-primary-50/10 to-forest-900/30 rounded-xl p-6 border-2 border-dashed border-sunset-400/50 backdrop-blur-sm">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 bg-coral-500 rounded-full flex items-center justify-center shadow-lg">
                <Anchor className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-display text-xl text-primary-50 uppercase">Stable Basecamp</h3>
            </div>
            <p className="text-primary-100 leading-relaxed text-sm">
              Anchor your expedition with reliable stablecoins. No market storms or volatility detours on your payment trail.
            </p>
          </div>

          {/* Flexible Routes */}
          <div className="bg-gradient-to-br from-primary-50/10 to-forest-900/30 rounded-xl p-6 border-2 border-dashed border-sunset-400/50 backdrop-blur-sm">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 bg-sky-500 rounded-full flex items-center justify-center shadow-lg">
                <Route className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-display text-xl text-primary-50 uppercase">Custom Pathways</h3>
            </div>
            <p className="text-primary-100 leading-relaxed text-sm">
              Blaze your own trail with custom waypoints, scheduling stops, and conditional checkpoints along your payment journey.
            </p>
          </div>

          {/* Tradeable Keys */}
          <div className="bg-gradient-to-br from-primary-50/10 to-forest-900/30 rounded-xl p-6 border-2 border-dashed border-sunset-400/50 backdrop-blur-sm">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 bg-primary-400 rounded-full flex items-center justify-center shadow-lg">
                <Award className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-display text-xl text-primary-50 uppercase">Trail Deeds</h3>
            </div>
            <p className="text-primary-100 leading-relaxed text-sm">
              Own your routes with NFT-backed trail deeds that can be traded, transferred, or pledged. True ownership of your payment pathways.
            </p>
          </div>

          {/* On-Chain Transparency */}
          <div className="bg-gradient-to-br from-primary-50/10 to-forest-900/30 rounded-xl p-6 border-2 border-dashed border-sunset-400/50 backdrop-blur-sm">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 bg-forest-400 rounded-full flex items-center justify-center shadow-lg">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-display text-xl text-primary-50 uppercase">Clear Trail Markers</h3>
            </div>
            <p className="text-primary-100 leading-relaxed text-sm">
              Follow every step of your expedition with on-chain breadcrumbs. Navigate with complete visibility and unwavering trust.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
