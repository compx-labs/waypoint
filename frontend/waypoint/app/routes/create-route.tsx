import { useNavigate, useSearchParams } from "react-router";
import type { Route } from "./+types/create-route";
import RouteCreationWizard, { type RouteFormData } from "../components/RouteCreationWizard";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Create Route - Waypoint" },
    {
      name: "description",
      content: "Create a new token route with customizable schedules and recipients.",
    },
  ];
}

export default function CreateRoute() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const routeType = searchParams.get('type') || 'simple-transfer';

  const handleComplete = (data: RouteFormData) => {
    console.log('Route creation completed:', data);
    // TODO: Submit route data to blockchain/backend
    // For now, just navigate back to dashboard
    alert('Route created successfully! (Mock)');
    navigate('/app');
  };

  const handleClose = () => {
    navigate('/app');
  };

  return (
    <RouteCreationWizard
      routeType={routeType}
      onClose={handleClose}
      onComplete={handleComplete}
    />
  );
}
