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
dotenv.config({ path: "./.env" });
const app = express();
app.use(
  cors({
    origin: "http://localhost:5173", // allow your frontend
    credentials: true, // allow cookies if you're using them
  })
);
app.use(morgan("dev"));

app.use(helmet());
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

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
