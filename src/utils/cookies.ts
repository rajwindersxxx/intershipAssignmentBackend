import { Response } from "express";

export function responseCookie(
  res: Response,
  cookieName: string,
  data: string
) {
  const isSecure = process.env.NODE_ENV !== "test";
  res.cookie(cookieName, data, {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: isSecure,
    sameSite: process.env.NODE_ENV === "test" ? "lax" : "strict",
    path: "/",
  });
}

export function clearCookie(res: Response, cookieName: string) {
  const isSecure = process.env.NODE_ENV !== "test";
  res.clearCookie(cookieName, {
    httpOnly: true,
    secure: isSecure,
    sameSite: isSecure ? "strict" : "lax",
    path: "/",
  });
}
