import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/landing.tsx"),
  route("/app", "routes/app.tsx"),
  route("/app/docs", "routes/docs.tsx"),
  route("/create-route", "routes/create-route.tsx")
] satisfies RouteConfig;
