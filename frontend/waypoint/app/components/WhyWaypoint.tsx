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
            Simple, reliable, and transparent payment routing built for everyone
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Simple & Friendly */}
          <div className="bg-gradient-to-br from-primary-50/10 to-forest-900/30 rounded-xl p-6 border-2 border-dashed border-sunset-400/50 backdrop-blur-sm">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 bg-sunset-500 rounded-full flex items-center justify-center shadow-lg">
                <Navigation className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-display text-xl text-primary-50 uppercase">Easy to Use</h3>
            </div>
            <p className="text-primary-100 leading-relaxed text-sm">
              Set up payment routes in minutes. Simple scheduling with clear visibility into every route.
            </p>
          </div>

          {/* Stablecoin Native */}
          <div className="bg-gradient-to-br from-primary-50/10 to-forest-900/30 rounded-xl p-6 border-2 border-dashed border-sunset-400/50 backdrop-blur-sm">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 bg-coral-500 rounded-full flex items-center justify-center shadow-lg">
                <Anchor className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-display text-xl text-primary-50 uppercase">Stablecoin Native</h3>
            </div>
            <p className="text-primary-100 leading-relaxed text-sm">
              Built for reliable stablecoins. Predictable value with no volatility risk on your payments.
            </p>
          </div>

          {/* Flexible Routes */}
          <div className="bg-gradient-to-br from-primary-50/10 to-forest-900/30 rounded-xl p-6 border-2 border-dashed border-sunset-400/50 backdrop-blur-sm">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 bg-sky-500 rounded-full flex items-center justify-center shadow-lg">
                <Route className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-display text-xl text-primary-50 uppercase">Flexible Scheduling</h3>
            </div>
            <p className="text-primary-100 leading-relaxed text-sm">
              Customize payment schedules to fit your needs. Daily, weekly, monthly, or custom frequencies.
            </p>
          </div>

          {/* Tradeable Keys */}
          <div className="bg-gradient-to-br from-primary-50/10 to-forest-900/30 rounded-xl p-6 border-2 border-dashed border-sunset-400/50 backdrop-blur-sm">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 bg-primary-400 rounded-full flex items-center justify-center shadow-lg">
                <Award className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-display text-xl text-primary-50 uppercase">NFT Ownership</h3>
            </div>
            <p className="text-primary-100 leading-relaxed text-sm">
              Own your payment routes as NFTs that can be traded, transferred, or used as collateral. True ownership of your routes.
            </p>
          </div>

          {/* On-Chain Transparency */}
          <div className="bg-gradient-to-br from-primary-50/10 to-forest-900/30 rounded-xl p-6 border-2 border-dashed border-sunset-400/50 backdrop-blur-sm">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 bg-forest-400 rounded-full flex items-center justify-center shadow-lg">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-display text-xl text-primary-50 uppercase">Full Transparency</h3>
            </div>
            <p className="text-primary-100 leading-relaxed text-sm">
              Every transaction is recorded on-chain. Complete visibility and verifiable trust.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
