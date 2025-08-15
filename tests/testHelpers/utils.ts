import request from "supertest";
import app from "../../src/app";

export const endpoint = "/api/v1";
export let accessToken: string;
interface props {
  username: string;
  password: string;
}
export async function loginAndToken({ username, password }: props) {
  if (accessToken) return accessToken;

  const res = await request(app).post("/api/v1/auth/login").send({
    username,
    password,
  });
  accessToken = res.body.accessToken;
  return accessToken;
}

export async function testCatchAsync(
  callback: () => Promise<void>,
  errorStack?: boolean
) {
  try {
    await callback();
  } catch (error) {
    if (errorStack === true) return console.error(error);
  }
}
