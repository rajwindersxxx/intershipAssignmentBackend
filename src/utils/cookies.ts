import { Response } from "express";
import { devMode } from "../config/server.config";
const testMode = process.env.NODE_ENV === "test";
export function responseCookie(
  res: Response,
  cookieName: string,
  data: string
) {
  res.cookie(cookieName, data, {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: devMode || testMode ? false : true,
    sameSite: "none",
    path: "/",
  });
}

export function clearCookie(res: Response, cookieName: string) {
  res.clearCookie(cookieName, {
    httpOnly: true,
    secure: devMode || testMode ? false : true,
    sameSite: "none",
    path: "/",
  });
}
