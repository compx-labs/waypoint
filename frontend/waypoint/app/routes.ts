import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/landing.tsx"),
  route("/app", "routes/app.tsx")
] satisfies RouteConfig;
