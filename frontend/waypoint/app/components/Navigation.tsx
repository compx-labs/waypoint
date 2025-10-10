import { useNavigate } from "react-router-dom";

export default function Navigation() {
  const navigate = useNavigate();
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-transparent backdrop-blur-lg ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <img
              src="/logo.svg"
              alt="Waypoint"
              className="h-8 w-auto rounded-full"
            />
          </div>

          {/* Launch App Button */}
          <div className="flex items-center">
            <button 
            onClick={() => {
              navigate("/app");
            }}
            className="bg-forest-500 hover:bg-forest-600 text-primary-100 font-display text-sm uppercase tracking-wider font-bold py-4 px-7 rounded-xl transition-all duration-200 ease-out transform hover:translate-y-1 hover:scale-105 shadow-lg hover:shadow-xl border-2 border-forest-600">
              Launch App
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
