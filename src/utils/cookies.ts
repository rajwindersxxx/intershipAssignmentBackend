import {  Response } from "express";

export function responseCookie(
  res: Response,
  cookieName: string,
  data: string
) {
  res.cookie(cookieName, data, {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true, // Always secure from JS access
    secure: process.env.SKIP_WSS === "true" ? false : true,
    sameSite: "strict",
    path: "/",
  });
}

export function clearCookie(res: Response, cookieName: string) {
  res.clearCookie(cookieName, {
    httpOnly: true,
    secure: process.env.SKIP_WSS === "true" ? false : true,
    sameSite: "strict",
    path: "/",
  });
}
