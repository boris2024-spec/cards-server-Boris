// Centralized error handling middleware
// Usage: next(new AppError(message, statusCode)) or throw inside async route (Express 5)

export class AppError extends Error {
    constructor(message, statusCode = 500, details = null) {
        super(message);
        this.statusCode = statusCode;
        this.details = details;
    }
}

export const notFoundHandler = (req, res, next) => {
    next(new AppError(`Route ${req.method} ${req.originalUrl} not found`, 404));
};

import chalk from "chalk";
import { logger } from "../logger.js";

export const errorHandler = (err, req, res, next) => {
    const status = err.statusCode || 500;
    const isProd = process.env.NODE_ENV === "production";
    const payload = {
        error: {
            message: err.message || "Internal Server Error",
            status,
        },
    };
    if (err.details) payload.error.details = err.details;
    if (!isProd && err.stack) payload.error.stack = err.stack;

    // Compose message for logging
    const errorMessage = `STATUS: ${status} | METHOD: ${req.method} | URL: ${req.originalUrl} | IP: ${req.ip} | ERROR: ${err.message}`;

    // Log to file
    logger.error(errorMessage);

    // Colored logging to console: errors always red
    const line = `[ERROR] ${req.method} ${req.originalUrl} -> ${status}: ${err.message}`;
    // Red background with white (bold) text for stronger visibility
    console.error(chalk.bgRed.white.bold(line));

    res.status(status).json(payload);
};

// Helper to wrap async handlers (optional for clarity)
export const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
