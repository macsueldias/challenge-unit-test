import request from "supertest";
import { Connection } from "typeorm";

import { app } from "../../../../app";
import createConnection from "../../../../database";

let connection: Connection;

describe("Get Operation", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to authenticate a user, log operations and obtain an operation", async () => {
    await request(app).post("/api/v1/users").send({
      name: "Admin",
      email: "user@gmail.com",
      password: "1234",
    });

    const session = await request(app).post("/api/v1/sessions").send({
      email: "user@gmail.com",
      password: "1234",
    });

    const { token } = await session.body;

    await request(app)
      .post("/api/v1/statements/deposit")
      .set('Authorization', `Bearer ${token}`)
      .send({
      amount: 100,
      description: 'test deposit for withdrawal',
    });

    const withdraw = await request(app)
      .post("/api/v1/statements/withdraw")
      .set('Authorization', `Bearer ${token}`)
      .send({
        amount: 20,
        description: 'test withdraw',
      });

    const { id:statement_id } = await withdraw.body

    const response = await request(app)
      .get(`/api/v1/statements/${statement_id}`)
      .set('Authorization', `Bearer ${token}`)

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('amount');
      expect(response.body).toHaveProperty('type');
  });
})
