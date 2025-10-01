import RouteCard from "./RouteCard";

// Types for token stream data
export interface TokenStream {
  id: number;
  name: string;
  symbol: string;
  color: string;
  tvl: string;
  totalStreams: number;
  incoming: { count: number; value: string };
  outgoing: { count: number; value: string };
  completed: { count: number; value: string };
}

interface RoutesListProps {
  tokenStreams: TokenStream[];
}

export default function RoutesList({ tokenStreams }: RoutesListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-12 md:mb-12 pb-24 md:pb-0">
      {tokenStreams.map((stream) => (
        <RouteCard key={stream.id} stream={stream} />
      ))}
    </div>
  );
}
