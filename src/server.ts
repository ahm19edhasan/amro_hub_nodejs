import { env } from "./config/env.js";
import app from "./app.js";
import { prisma } from "./config/prisma.js";


const server = app.listen(env.PORT, () => {
    console.log(`🚀 Server running on http://localhost:${env.PORT} [${env.NODE_ENV}]`);
});

// Graceful shutdown
const shutdown = async (signal: string) => {
    console.log(`\n${signal} received — shutting down...`);
    server.close(() => {
        console.log("HTTP server closed.");
        process.exit(0);
    });
    await prisma.$disconnect();
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("unhandledRejection", (reason) => {
    console.error("Unhandled Rejection:", reason);
});