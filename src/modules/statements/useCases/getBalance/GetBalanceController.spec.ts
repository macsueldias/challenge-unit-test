import request from "supertest";
import { Connection } from "typeorm";

import { app } from "../../../../app";
import createConnection from "../../../../database";

let connection: Connection;


describe("List all operation withdraw and deposit", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able authenticate user and list operation deposit and withdraw", async () => {
    await request(app).post("/api/v1/users").send({
      name: "Admin",
      email: "user@gmail.com",
      password: "1234",
    });

    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "user@gmail.com",
      password: "1234",
    });

    const { token } = responseToken.body;

    await request(app)
      .post("/api/v1/statements/deposit")
      .set('Authorization', `Bearer ${token}`)
      .send({
      amount: 100,
      description: 'test deposit for withdraw',
    });

    await request(app)
      .post("/api/v1/statements/withdraw")
      .set('Authorization', `Bearer ${token}`)
      .send({
      amount: 20,
      description: 'test withdraw',
    });

    const user = await request(app).get("/api/v1/profile").set('Authorization', `Bearer ${token}`);

    const response = await request(app).get("/api/v1/statements/balance").set('Authorization', `Bearer ${token}`).send({
      user: user.body,
    })

    expect(response.body).toHaveProperty('balance');
    expect(response.body.statement[0]).toHaveProperty('id');
  });
})
