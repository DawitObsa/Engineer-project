import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { app } from "../src/app.js";

test("health endpoint exposes the API contract", async () => {
  const response = await request(app).get("/api/v1/health");
  assert.equal(response.status, 200);
  assert.equal(response.body.success, true);
  assert.equal(response.body.data.status, "ok");
});

test("protected project endpoint rejects missing authentication", async () => {
  const response = await request(app).get("/api/v1/projects");
  assert.equal(response.status, 401);
  assert.equal(response.body.success, false);
});

test("user registration rejects requests without an administrator session", async () => {
  const response = await request(app).post("/api/v1/users").send({});
  assert.equal(response.status, 401);
  assert.equal(response.body.success, false);
});

test("current-user endpoint rejects requests without a session", async () => {
  const response = await request(app).get("/api/v1/auth/me");
  assert.equal(response.status, 401);
  assert.equal(response.body.success, false);
});
