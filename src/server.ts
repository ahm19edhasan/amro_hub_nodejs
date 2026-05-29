import app from "./app.js";

const PORT = Number(process.env.PORT) || 5004;

const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// Graceful shutdown
const shutdown = (signal: string) => {
    console.log(`\n${signal} received — shutting down...`);
    server.close(() => {
        console.log("HTTP server closed.");
        process.exit(0);
    });
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("unhandledRejection", (reason) => {
    console.error("Unhandled Rejection:", reason);
});