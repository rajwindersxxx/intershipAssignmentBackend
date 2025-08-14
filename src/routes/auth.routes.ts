import express from "express";
import { authController } from "../controller/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { validationMiddleware } from "../middleware/validationMiddleware";
import {
  changePasswordSchema,
  loginSchema,
  signupSchema,
} from "../zod/auth.zod";
const authRouter = express.Router();

authRouter.post(
  "/login",
  validationMiddleware(loginSchema),
  authController.loginUser
);
authRouter.post(
  "/signup",
  validationMiddleware(signupSchema),
  authMiddleware.hashPassword,
  authController.signupUser
);
authRouter.use(authMiddleware.protectedRoute);
authRouter.post("/logout", authController.logoutUser);
authRouter.patch(
  "/changePassword",
  validationMiddleware(changePasswordSchema),
  authController.changePassword
);
authRouter.get("/me", authController.getAuthDetails)
export default authRouter;
