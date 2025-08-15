import app from "../../../src/app";
import request from "supertest";
import { prisma } from "../../../src/utils/prismaClient";
import { testCatchAsync } from "../../testHelpers/utils";

const authData = {
  email: "test52634564@gmail.com",
  password: "123456",
  confirmPassword: "123456",
  name: "test1234",
};
describe("Auth Routes (Cookie-based JWT)", () => {
  const agent = request.agent(app);
  beforeAll(async () => {
    await testCatchAsync(async () => {
      await prisma.user.delete({
        where: { email: authData.email },
      });
    });
  });

  it("should signup user", async () => {
    const res = await agent.post("/api/v1/auth/signup").send(authData);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("message");
  });

  it("should fail to login with wrong password", async () => {
    const res = await agent.post("/api/v1/auth/login").send({
      email: authData.email,
      password: "wrong_password",
    });
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toMatch(/Invalid username or password/i);
  });

  it("should fail to login with missing email", async () => {
    const res = await agent
      .post("/api/v1/auth/login")
      .send({ password: "user" });
    expect(res.statusCode).toBe(400);
  });

  it("should login successfully and set cookie", async () => {
    const res = await agent.post("/api/v1/auth/login").send({
      email: authData.email,
      password: authData.password,
    });
    expect(res.statusCode).toBe(200);
    expect(res.headers["set-cookie"]).toBeDefined();
  });

  it("should get auth Details with the valid cookie", async () => {
    const res = await agent.get("/api/v1/auth/me");
    expect(res.statusCode).toBe(200);
  });

  it("should fail to change password with wrong current password", async () => {
    const res = await agent.patch("/api/v1/auth/changePassword").send({
      currentPassword: "wrong",
      password: "newuser",
      confirmPassword: "newuser",
    });
    expect(res.statusCode).toBe(400);
  });

  it("should fail to change password with mismatched confirm password", async () => {
    const res = await agent.patch("/api/v1/auth/changePassword").send({
      currentPassword: authData.password,
      password: "newuser",
      confirmPassword: "differentPassword",
    });
    expect(res.statusCode).toBe(400);
  });

  it("should change password with correct credentials", async () => {
    const res = await agent.patch("/api/v1/auth/changePassword").send({
      currentPassword: authData.password,
      password: "newPassword",
      confirmPassword: "newPassword",
    });
    expect(res.statusCode).toBe(200);
    authData.password = "newPassword";
  });

  it("should not get user info after logout", async () => {
    const res = await agent.get("/api/v1/auth/me");
    expect(res.statusCode).toBe(401);
  });

  it("should login again after logout", async () => {
    const res = await agent.post("/api/v1/auth/login").send({
      email: authData.email,
      password: authData.password,
    });
    expect(res.statusCode).toBe(200);
  });

  it("should fail to get user info with invalid cookie", async () => {
    const res = await request(app)
      .get("/api/v1/auth/me")
      .set("Cookie", "jwtToken=invalidtoken");
    expect(res.statusCode).toBe(401);
  });

  it("should fail to get user info without cookie", async () => {
    const res = await request(app).get("/api/v1/auth/me");
    expect(res.statusCode).toBe(401);
  });

  it("should fail to logout with invalid cookie", async () => {
    const res = await request(app)
      .post("/api/v1/auth/logout")
      .set("Cookie", "jwtToken=invalidtoken");
    expect(res.statusCode).toBe(401);
  });

  it("should fail to logout without cookie", async () => {
    const res = await request(app).post("/api/v1/auth/logout");
    expect(res.statusCode).toBe(401);
  });
  it("should logout account", async () => {
    const res = await agent.post("/api/v1/auth/logout");
    expect(res.statusCode).toBe(200);
  });

  afterAll(async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    await testCatchAsync(async () => {
      await prisma.user.delete({
        where: { email: authData.email },
      });
    });
  });
});
