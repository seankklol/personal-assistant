import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/index.tsx"),
  route("chat", "routes/chat.tsx"),
  route("chat/:chatId", "routes/chat-detail.tsx"),
  route("admin", "routes/admin.tsx"),
] satisfies RouteConfig;
