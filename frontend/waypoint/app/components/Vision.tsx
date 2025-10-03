export default function Vision() {
  return (
    <section className="py-32 bg-gradient-to-br from-forest-800 via-sky-900 to-forest-700 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-sunset-500 blur-xl"></div>
        <div className="absolute bottom-32 right-20 w-48 h-48 rounded-full bg-coral-500 blur-2xl"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 rounded-full bg-primary-100 blur-lg"></div>
      </div>
      
      <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-8 text-center">
        <h2 className="font-display text-5xl lg:text-7xl text-primary-50 leading-tight uppercase mb-8">
          Payments Should Be 
          <span className="text-sunset-400 block">
            Simple
          </span>
        </h2>
        <p className="text-2xl lg:text-3xl text-primary-100 leading-relaxed mb-12 max-w-4xl mx-auto">
          No complex interfaces or confusing steps. Just clear schedules, reliable routes, and complete control over your payments.
        </p>
      </div>
    </section>
  );
}
