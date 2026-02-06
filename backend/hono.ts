import { trpcServer } from "@hono/trpc-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { serve } from "@hono/node-server";

import { appRouter } from "./trpc/app-router";
import { createContext } from "./trpc/create-context";

const app = new Hono();

app.use("*", logger());
app.use("*", cors());

app.get("/", (c) => {
  return c.json({ status: "ok", message: "Yuguyu API is running" });
});

app.use(
  "/api/trpc/*",
  trpcServer({
    endpoint: "/api/trpc",
    router: appRouter,
    createContext,
  }),
);

const port = parseInt(process.env.PORT || "5000");

serve({
  fetch: app.fetch,
  port,
});

console.log(`Backend API running on port ${port}`);

export default app;
