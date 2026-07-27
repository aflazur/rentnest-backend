import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application, NextFunction, Request, Response } from "express";
import helmet from "helmet";
import httpStatus from "http-status";
import morgan from "morgan";
import { globalErrorHandler } from "./middlewares/globalErrorHandler";
import { notFound } from "./middlewares/notFound";
import { apiRouter } from "./routes";


const app: Application = express();

// Security & core middlewares
app.use(helmet());
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

// Health check
app.get("/", (req: Request, res: Response) => {
  res.status(httpStatus.OK).json({
    success: true,
    message: "🏠 RentNest API is running",
    data: { docs: "/api-docs", health: "/health" },
  });
});

app.get("/health", (req: Request, res: Response) => {
  res.status(httpStatus.OK).json({ success: true, message: "OK", data: { uptime: process.uptime() } });
});

// API routes
app.use("/api", apiRouter);

// 404 handler
app.use(notFound);

// Centralized structured error handler (must be the last middleware)
app.use(globalErrorHandler as any);

export default app;