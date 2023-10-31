import request from "supertest";
import { Connection } from "typeorm";

import { app } from "../../../../app";
import createConnection from "../../../../database";

let connection: Connection;

describe("Create a new deposit or withdraw", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });


  it("should be able authenticate and register operation deposit", async () => {
    await request(app).post("/api/v1/users").send({
      name: "Admin",
      email: "user@gmail.com",
      password: "1234",
    });

    const response = await request(app).post("/api/v1/sessions").send({
      email: "user@gmail.com",
      password: "1234",
    });

    const { token } = response.body;

    const deposit = await request(app)
      .post("/api/v1/statements/deposit")
      .set('Authorization', `Bearer ${token}`)
      .send({
      amount: 100,
      description: 'test deposit',
    });

    expect(deposit.statusCode).toBe(201);
  });

  it("should be able authenticate and register operation withdraw", async () => {
    await request(app).post("/api/v1/users").send({
      name: "Admin",
      email: "user@gmail.com",
      password: "1234",
    });

    const response = await request(app).post("/api/v1/sessions").send({
      email: "user@gmail.com",
      password: "1234",
    });

    const { token } = response.body;

    await request(app)
      .post("/api/v1/statements/deposit")
      .set('Authorization', `Bearer ${token}`)
      .send({
      amount: 100,
      description: 'test deposit for withdraw',
    });

    const withdraw = await request(app)
      .post("/api/v1/statements/withdraw")
      .set('Authorization', `Bearer ${token}`)
      .send({
      amount: 20,
      description: 'test withdraw',
    });

    expect(withdraw.statusCode).toBe(201);
  });
})
