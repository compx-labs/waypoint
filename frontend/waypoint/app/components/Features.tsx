import { Clock, Droplets, Award, Calendar, Cog } from 'lucide-react';

export default function Features() {
  return (
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
                <Clock className="w-8 h-8 text-white" />
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
                <Droplets className="w-24 h-24 text-sunset-400 opacity-60" />
              </div>
            </div>
          </div>

          {/* NFT-Backed Routes */}
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="bg-gradient-to-br from-primary-50/10 to-forest-900/30 rounded-2xl p-8 border-2 border-dashed border-coral-400/50 lg:order-1">
              <div className="h-48 flex items-center justify-center">
                <Award className="w-24 h-24 text-coral-400 opacity-60" />
              </div>
            </div>
            <div className="space-y-6 lg:order-2">
              <div className="w-16 h-16 bg-coral-500 rounded-full flex items-center justify-center shadow-lg">
                <Award className="w-8 h-8 text-white" />
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
                <Calendar className="w-8 h-8 text-white" />
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
                <Cog className="w-24 h-24 text-sky-400 opacity-60" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
