import { Link } from "react-router-dom";

export default function CallToAction() {
  return (
    <section className="py-20 bg-gradient-to-br from-primary-100 to-sunset-100">
      <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
        <h2 className="font-display text-4xl lg:text-6xl text-forest-700 leading-tight uppercase mb-8">
          Start your first route in
          <span className="text-sunset-500 block">just a few clicks</span>
        </h2>
        <p className="text-xl text-forest-600 leading-relaxed mb-12 max-w-3xl mx-auto">
          Experience how smooth continuous payments can be. No complex
          setup, no hidden fees, just simple routing.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <Link to="/app" className="bg-forest-500 hover:bg-forest-600 text-primary-100 font-display text-lg uppercase tracking-wider font-bold py-4 px-7 rounded-xl transition-all duration-200 ease-out transform hover:translate-y-1 hover:scale-105 shadow-lg hover:shadow-xl border-2 border-forest-600">
            Launch App
          </Link>
          <a href="/docs" className="bg-transparent border-2 border-forest-500 text-forest-500 hover:bg-forest-500 hover:text-primary-100 font-display text-lg uppercase tracking-wider font-semibold py-4 px-7 rounded-xl transition-all duration-200 ease-out transform hover:translate-y-1 hover:scale-105 shadow-md hover:shadow-lg">
          Read the Docs
          </a>
        </div>

        {/* <div className="mt-16 flex justify-center gap-8 text-forest-500">
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
        </div> */}
      </div>
    </section>
  );
}
