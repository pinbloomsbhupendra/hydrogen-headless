import { type RouteConfig, index } from "@react-router/dev/routes";
import { flatRoutes } from "@react-router/fs-routes";

export default [
    index("routes/index.jsx"),
    ...(await flatRoutes()).filter((route) => route.file !== "routes/index.jsx"),
] satisfies RouteConfig;


