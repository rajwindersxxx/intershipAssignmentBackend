// Here i define field which used to identify the logged in user
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request } from "express";
declare global {
  namespace Express {
    interface Request {
      user: { id: number; role: string };
      filePaths?: string[];
    }
  }
}
