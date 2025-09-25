export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-teal-200 flex pb-4 sm:pb-20">
      <div className="relative ">
        <div className="flex flex-col items-center">
          {/* Left Side - Hero Logo */}
          <div className="flex ">
            <img
              src="/waypoint-logo-stylised-trans.png"
              alt="Waypoint Logo"
              className="w-full  drop-shadow-2xl"
            />
          </div>
          <div className="flex">
            <h1 className="text-4xl font-display text-forest-700 leading-tight uppercase text-center">
              Your route through stablecoin payments
            </h1>
          </div>
        </div>
      </div>
    </section>
  );
}
