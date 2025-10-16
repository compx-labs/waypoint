import { useNavigate } from "react-router-dom";
import { type TokenRoute } from "./RoutesList";

interface RouteCardProps {
  route: TokenRoute;
}

export default function RouteCard({ route }: RouteCardProps) {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/app/token?id=${route.id}`);
  };

  return (
    <div 
      className="bg-gradient-to-br from-forest-800 to-forest-900 border border-forest-600 rounded-xl p-6 hover:border-sunset-500 transition-all duration-200 hover:transform hover:scale-105 shadow-lg hover:shadow-xl cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Token Header */}
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white p-1">
          <img
            src={route.logoSrc}
            alt={`${route.name} logo`}
            className="w-full h-full object-contain"
          />
        </div>
        <div className="flex-1">
          <h3 className="text-primary-100 font-display font-semibold text-sm uppercase tracking-wide truncate">
            {route.name}
          </h3>
        </div>
        <svg
          className="w-5 h-5 text-sunset-500"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </div>

      

      {/* Routes Info */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-primary-400 font-display uppercase tracking-wide">
            Total Routes:
          </span>
          <span className="text-primary-100 font-semibold">
            {route.totalRoutes}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-green-400 font-display uppercase tracking-wide">
            Incoming:
          </span>
          <span className="text-green-400 font-semibold">
            {route.incoming.count} / {route.incoming.value}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-sunset-400 font-display uppercase tracking-wide">
            Outgoing:
          </span>
          <span className="text-sunset-400 font-semibold">
            {route.outgoing.count} / {route.outgoing.value}
          </span>
        </div>

        {/* Completed Routes Section */}
        <div className="mt-4 pt-4 border-t border-forest-700">
          <div className="flex justify-between items-center">
            <span className="text-sm text-primary-400 font-display uppercase tracking-wide">
              Completed:
            </span>
            <span className="text-primary-100 font-semibold">
              {route.completed.count} / {route.completed.value}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
