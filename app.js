import express from "express";
import cors from "cors";
import logger from "./middlewares/logger.js";
import router from "./router/router.js";
import { notFoundHandler, errorHandler, AppError } from "./middlewares/errorHandler.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

// Дополнительная конфигурация CORS: можно указать через переменную окружения CORS_ORIGINS="http://localhost:5173,http://127.0.0.1:5500"
const extraOrigins = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(/[,;\s]+/).filter(Boolean) : [];
const defaultOrigins = [
    "http://127.0.0.1:5500",
    "http://localhost:5173",
    "http://localhost:5174",

    "https://cards-projec.netlify.app"
    
];
const allowedOrigins = Array.from(new Set([...defaultOrigins, ...extraOrigins]));

const app = express();

app.use(
    cors({
        origin: (origin, cb) => {
            // Разрешаем REST инструменты без origin (Postman) и явно разрешенные.
            if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
            return cb(new Error("CORS: Origin not allowed"));
        },
        credentials: true,
        allowedHeaders: ["Content-Type", "Authorization", "x-auth-token"],
        exposedHeaders: ["Authorization", "x-auth-token"],
    })
);

app.use(express.json());
app.use(logger);

app.use(express.static("./public"));

app.get("/ping", (req, res) => {
    res.send("pong");
});

// Health-check endpoint expected by front/tests
app.get('/health', (req, res) => {
    const dbState = mongoose.connection.readyState; // 0=disconnected,1=connected,2=connecting,3=disconnecting
    const map = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
    res.status(dbState === 1 ? 200 : 503).json({
        status: 'ok',
        uptime: process.uptime(),
        db: map[dbState] || 'unknown'
    });
});

// Основной роутер
app.use(router);

if (process.env.NODE_ENV === "test") {
    app.get("/force-error", (req, res) => {
        throw new AppError("Boom", 418);
    });
}

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
