import express from "express";
import request from "supertest";
import { configureBodyParser } from "../body-parser";

describe("configureBodyParser", () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    configureBodyParser(app);
    app.use((req, res) => {
      res.json(req.body === undefined ? { bodyIsUndefined: true } : { body: req.body });
    });
  });

  test("parses JSON request bodies", async () => {
    const response = await request(app).post("/").send({ country: "Spain" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ body: { country: "Spain" } });
  });

  test("parses nested URL-encoded request bodies", async () => {
    const response = await request(app)
      .post("/")
      .type("application/x-www-form-urlencoded")
      .send("country=Spain&address%5Bregion%5D=Andalusia");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      body: { country: "Spain", address: { region: "Andalusia" } },
    });
  });

  test("initializes an empty body when the content type is not parsed", async () => {
    const response = await request(app).post("/").type("text/plain").send("unparsed body");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ body: {} });
  });

  test("initializes an empty body when no content type is provided", async () => {
    const response = await request(app).get("/");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ body: {} });
  });

  test("returns 400 for malformed JSON", async () => {
    const response = await request(app).post("/").type("application/json").send('{"country":');

    expect(response.status).toBe(400);
  });

  test("returns 413 when the JSON body exceeds the default limit", async () => {
    const response = await request(app)
      .post("/")
      .send({ value: "x".repeat(101 * 1024) });

    expect(response.status).toBe(413);
  });
});
