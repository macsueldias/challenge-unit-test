import request from "supertest";
import { Connection } from "typeorm";

import { app } from "../../../../app";
import createConnection from "../../../../database";

let connection: Connection;

describe("Authenticate User", () => {

    beforeAll(async () => {
      connection = await createConnection();
      await connection.runMigrations();
    });

    afterAll(async () => {
      await connection.dropDatabase();
      await connection.close();
    });

    it("should be able authenticate user", async () => {
      await request(app).post("/api/v1/users").send({
        name: "Admin",
        email: "user@gmail.com",
        password: "1234",
      });

      const response = await request(app).post("/api/v1/sessions").send({
        email: "user@gmail.com",
        password: "1234",
      });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).toHaveProperty('name');
      expect(response.body.user).toHaveProperty('email');

    });
  });
