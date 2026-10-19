import express, { type NextFunction, type Request, type Response } from "express";
import request from "supertest";

jest.mock("server/middlewares/csrf", () => ({
  singleRouteCsrf: (_req: Request, _res: Response, next: NextFunction) => next(),
  addCsrfTokenToLocals: (_req: Request, _res: Response, next: NextFunction) => next(),
}));

jest.mock("../handlers", () => ({
  start: { get: (_req: Request, res: Response) => res.sendStatus(200) },
  countrySelect: {
    get: (req: Request, res: Response) =>
      res.json(req.body === undefined ? { bodyIsUndefined: true } : { body: req.body }),
    post: (req: Request, res: Response) =>
      res.json(req.body === undefined ? { bodyIsUndefined: true } : { body: req.body }),
  },
  stop: { get: (_req: Request, res: Response) => res.sendStatus(200) },
}));

import { applyRouter } from "../router";

describe("form runner route body parsing", () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(applyRouter);
  });

  const countrySelectPath = "/application/lawyers/which-country-list-do-you-want-to-be-added-to";

  test("parses JSON bodies on the country-select route", async () => {
    const response = await request(app).post(countrySelectPath).send({ country: "Spain" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ body: { country: "Spain" } });
  });

  test("parses nested URL-encoded bodies on the country-select route", async () => {
    const response = await request(app)
      .post(countrySelectPath)
      .type("application/x-www-form-urlencoded")
      .send("country=Spain&address%5Bregion%5D=Andalusia");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      body: { country: "Spain", address: { region: "Andalusia" } },
    });
  });

  test("initializes an empty body when the country-select content type is not parsed", async () => {
    const response = await request(app).post(countrySelectPath).type("text/plain").send("unparsed body");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ body: {} });
  });

  test("initializes an empty body on a country-select GET", async () => {
    const response = await request(app).get(countrySelectPath);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ body: {} });
  });

  test("returns 400 for malformed JSON on the country-select route", async () => {
    const response = await request(app).post(countrySelectPath).type("application/json").send('{"country":');

    expect(response.status).toBe(400);
  });
});
