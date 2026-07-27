import app from "../src/app";

// Vercel wraps the Express app as a serverless function.
// Local development still uses src/server.ts (npm run dev / npm start).
export default app;