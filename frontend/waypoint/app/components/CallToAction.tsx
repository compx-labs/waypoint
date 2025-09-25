export default function CallToAction() {
  return (
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
  );
}
