import request from "supertest";
import { Connection } from "typeorm";

import { app } from "../../../../app";
import createConnection from "../../../../database";

let connection: Connection;

describe("Information User Authenticate", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able list information user", async () => {
    await request(app).post("/api/v1/users").send({
      name: "Admin",
      email: "user@gmail.com",
      password: "1234",
    });

    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "user@gmail.com",
      password: "1234",
    });

    const { token } = responseToken.body

    const user = await request(app).get("/api/v1/profile").set('Authorization', `Bearer ${token}`);

    expect(user.statusCode).toBe(200);
    expect(user.body).toHaveProperty('id');
    expect(user.body).toHaveProperty('name');
    expect(user.body).toHaveProperty('email');
  })
})
