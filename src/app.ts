import express, { type Application } from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";

const app: Application = express();

// Core middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());

// Health check
app.get("/health", (_req, res) => {
    res.json({ status: "ok", uptime: process.uptime() });
});

// TODO: app.use("/api", routes);
// TODO: app.use(notFound);
// TODO: app.use(errorHandler);

export default app;