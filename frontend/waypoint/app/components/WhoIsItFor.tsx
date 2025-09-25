import { Users, Globe, Zap, Send } from 'lucide-react';

export default function WhoIsItFor() {
  return (
    <section className="py-20 bg-primary-50 relative overflow-hidden">
      {/* Mountain silhouette background */}
      
      
      {/* Content overlay */}
      <div className="relative z-10">
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
              <Users className="w-10 h-10 text-white" />
            </div>
            <h3 className="font-display text-2xl text-forest-700 uppercase mb-4">Employers / Teams</h3>
            <p className="text-forest-600 leading-relaxed">
              Streamline payroll with continuous salary streams. Set waypoints for bonuses and milestone payments.
            </p>
          </div>

          {/* Projects / DAOs */}
          <div className="text-center group">
            <div className="w-24 h-24 bg-gradient-to-br from-forest-500 to-sky-500 rounded-full flex items-center justify-center mb-6 mx-auto shadow-lg group-hover:scale-110 transition-transform duration-200">
              <Globe className="w-10 h-10 text-white" />
            </div>
            <h3 className="font-display text-2xl text-forest-700 uppercase mb-4">Projects / DAOs</h3>
            <p className="text-forest-600 leading-relaxed">
              Distribute treasury funds continuously. Create transparent funding streams for contributors and grants.
            </p>
          </div>

          {/* Creators / Builders */}
          <div className="text-center group">
            <div className="w-24 h-24 bg-gradient-to-br from-coral-500 to-sunset-500 rounded-full flex items-center justify-center mb-6 mx-auto shadow-lg group-hover:scale-110 transition-transform duration-200">
              <Zap className="w-10 h-10 text-white" />
            </div>
            <h3 className="font-display text-2xl text-forest-700 uppercase mb-4">Creators / Builders</h3>
            <p className="text-forest-600 leading-relaxed">
              Receive continuous support from patrons. Set up subscription-style payments with flexible terms.
            </p>
          </div>

          {/* Everyday Users */}
          <div className="text-center group">
            <div className="w-24 h-24 bg-gradient-to-br from-sky-500 to-primary-500 rounded-full flex items-center justify-center mb-6 mx-auto shadow-lg group-hover:scale-110 transition-transform duration-200">
              <Send className="w-10 h-10 text-white" />
            </div>
            <h3 className="font-display text-2xl text-forest-700 uppercase mb-4">Everyday Users</h3>
            <p className="text-forest-600 leading-relaxed">
              Split bills, send allowances, or make regular payments. Simple streaming for everyday financial needs.
            </p>
          </div>
        </div>
        </div>
      </div>
    </section>
  );
}
