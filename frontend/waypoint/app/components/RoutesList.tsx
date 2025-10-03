import RouteCard from "./RouteCard";

// Types for token route data
export interface TokenRoute {
  id: number;
  name: string;
  symbol: string;
  color: string;
  logoSrc: string;
  tvl: string;
  totalRoutes: number;
  incoming: { count: number; value: string };
  outgoing: { count: number; value: string };
  completed: { count: number; value: string };
}

interface RoutesListProps {
  tokenRoutes: TokenRoute[];
}

export default function RoutesList({ tokenRoutes }: RoutesListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-12 pb-24 md:pb-0">
      {tokenRoutes.map((route) => (
        <RouteCard key={route.id} route={route} />
      ))}
    </div>
  );
}
