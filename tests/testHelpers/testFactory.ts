import request from "supertest";
import app from "../../src/app";
import { endpoint } from "./utils";

const toggleLogs = process.env.LOGS === "true";
const agent = request.agent(app);
interface props {
  path: string;
  data?: object;
  expectedStatus?: number;
  id?: number;
}

export class testFactory {
  token: string | null = null;
  cookie: string | null = null;
  port!: number;
  logs?: boolean;
  constructor() {
    this.logs = toggleLogs;
  }
  async setup(
    email: string = "test@gmail.com",
    password: string = "123456"
  ): Promise<string | null> {
    const loginPath = "/api/v1/auth/login";
    const res = await agent.post(loginPath).send({ email, password });
    if (res.statusCode !== 200) throw console.log(res.body);
    if (this.logs)
      this.logOutput("POST", loginPath, { email, password }, res.body, true);
    return this.token;
  }
  async logout(expectedStatus = 200) {
    const logoutPath = "/api/v1/auth/logout";
    if (!this.token || !this.cookie) {
      throw new Error(
        "Cannot logout: token or cookie is missing. Did you forget to call setup()?"
      );
    }

    const res = await agent.post(logoutPath);

    if (res.status !== expectedStatus) {
      console.error("Logout failed response:", { Output: res.body });
    }
    try {
      if (this.logs)
        this.logOutput("POST", logoutPath, "Logout user", res.body, true);
      expect(res.status).toBe(expectedStatus);
    } catch (err) {
      this.logOutput("POST", logoutPath, "Logout user", res.body);
      throw err;
    }
  }
  async post({ path, data, expectedStatus = 201, id }: props) {
    let fullPath = `${endpoint}${path}`;
    if (id) {
      fullPath += `/${id}`;
    }
    const res = await agent.post(fullPath).send(data);
    try {
      if (this.logs) this.logOutput("POST", fullPath, data, res.body, true);
      expect(res.statusCode).toBe(expectedStatus);
    } catch (err) {
      this.logOutput("POST", fullPath, data, res.body);
      throw err;
    }
    return res.body;
  }
  async patch({ path, data, expectedStatus = 200, id }: props) {
    let fullPath = `${endpoint}${path}`;
    if (id) {
      fullPath += `/${id}`;
    }
    const res = await agent.patch(fullPath).send(data);
    try {
      if (this.logs) this.logOutput("PATCH", fullPath, data, res.body, true);
      expect(res.statusCode).toBe(expectedStatus);
    } catch (err) {
      this.logOutput("PATCH", fullPath, data, res.body);
      throw err;
    }
    return res.body;
  }
  async get({ path, expectedStatus = 200, id }: props) {
    let fullPath = `${endpoint}${path}`;
    if (id) {
      fullPath += `/${id}`;
    }
    const res = await agent.get(fullPath);
    try {
      if (this.logs) this.logOutput("GET", fullPath, null, res.body, true);
      expect(res.statusCode).toBe(expectedStatus);
    } catch (err) {
      this.logOutput("GET", fullPath, null, res.body);
      throw err;
    }

    return res.body;
  }
  async delete({ path, expectedStatus = 204, id }: props) {
    let fullPath = `${endpoint}${path}`;
    if (id) {
      fullPath += `/${id}`;
    }
    const res = await agent.delete(fullPath);
    try {
      if (this.logs) this.logOutput("DELETE", fullPath, null, res.body, true);
      expect(res.statusCode).toBe(expectedStatus);
    } catch (err) {
      this.logOutput("DELETE", fullPath, null, res.body);
      throw err;
    }
    return res.body;
  }
  logOutput(
    requestType: string,
    fullPath: string,
    input?: object | null | string,
    output?: object | null,
    success?: boolean
  ) {
    const infoString = success
      ? `${requestType} ✅ ${fullPath} ✅\n`
      : `${requestType} ❌ ${fullPath} ❌\n`;
    const inputString = input
      ? `Input:\n${JSON.stringify(input, null, 2)}\n`
      : "";
    const outputString = output
      ? `Output:\n${JSON.stringify(output, null, 2)}\n`
      : "";
    console.log(
      infoString + inputString + outputString + `TimeStamp: ${new Date()}`
    );
  }
}
