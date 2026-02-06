import app from "./hono";

const port = parseInt(process.env.PORT || "3000");

console.log(`Starting Yuguyu API server on port ${port}...`);

export default {
  fetch: app.fetch,
  port,
};
