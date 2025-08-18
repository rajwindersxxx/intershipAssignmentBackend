import { Response } from "express";
const isProd = process.env.NODE_ENV === "production"
export function responseCookie(
  res: Response,
  cookieName: string,
  data: string
) {
  res.cookie(cookieName, data, {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: isProd ? true : false,
    sameSite: "none",
    path: "/",
  });
}

export function clearCookie(res: Response, cookieName: string) {
  res.clearCookie(cookieName, {
    httpOnly: true,
    secure: isProd ? true : false,
    sameSite: "none",
    path: "/",
  });
}
