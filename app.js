import express from "express";
import cors from "cors";
import logger from "./middlewares/logger.js";
import router from "./router/router.js";
import { notFoundHandler, errorHandler, AppError } from "./middlewares/errorHandler.js";

const app = express();

app.use(
    cors({
        origin: ["http://127.0.0.1:5500"],
    })
);

app.use(express.json());
app.use(logger);

app.use(express.static("./public"));

app.get("/ping", (req, res) => {
    res.send("pong");
});

app.use(router);

if (process.env.NODE_ENV === "test") {
    app.get("/force-error", (req, res) => {
        throw new AppError("Boom", 418);
    });
}

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
