import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/landing.tsx"),
  route("/app", "routes/app.tsx"),
  route("/app/analytics", "routes/analytics.tsx"),
  route("/app/docs", "routes/docs.tsx"),
  route("/app/token", "routes/token-routes.tsx"),
  route("/create-route", "routes/create-route.tsx")
] satisfies RouteConfig;
