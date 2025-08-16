import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import helmet from "helmet";
import path from "path";
import cors from "cors";

import { globalHandler } from "./utils/globalHandler";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.routes";
import { appError } from "./utils/appError";
import productRouter from "./routes/product.routes";
import orderRoute from "./routes/order.routes";
import hpp from "hpp";
import rateLimit from "express-rate-limit";
import { devMode } from "./config/server.config";
dotenv.config({ path: "./.env" });
const app = express();

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use(
  cors({
    origin: process.env.ORIGEN_URL || "http://localhost:5173",
    credentials: true,
  })
);

if (devMode) app.use(morgan("dev"));

app.use(helmet());
app.use(hpp());
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  message: "Too many requests from this IP , please try again in an hour!",
});
if (!devMode) app.use(limiter);

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/product", productRouter);
app.use("/api/v1/order", orderRoute);

app.all(/(.*)/, (req, res, next) => {
  next(
    new appError(
      `Can't find ${req.originalUrl} on this server!`,
      404,
      "INVALID_ROUTE"
    )
  );
});

app.use(globalHandler);
export default app;
