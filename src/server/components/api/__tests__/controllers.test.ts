import type { Express } from "express";
import request from "supertest";
import { getServer } from "server/server";
import { prisma } from "server/models/db/prisma-client";
import { createSignatureDigest } from "../middleware/validateSignature";

jest.mock("server/models/db/prisma-client");

describe("listsApiPostController", () => {
  let server: Express;
  const THIRTY_SECONDS = 30000;
  const timeout = THIRTY_SECONDS;

  beforeAll(async () => {
    server = await getServer();
  }, timeout);

  it("should check /api/lists/ endpoint is working correctly", async () => {
    const mockData = {
      type: "funeralDirectors",
      country: "United States",
    };

    prisma.list.findFirst.mockResolvedValue(true);
    const res = await requestWithSignature(server, mockData).send(mockData);

    expect(res.status).toBe(200);
  });

  it("should return a 400 error if no list is found", async () => {
    const mockData = {
      type: "funeralDirectors",
      country: "Barbados",
    };

    prisma.list.findFirst.mockResolvedValue(false);
    const res = await requestWithSignature(server, mockData).send(mockData);

    expect(res.status).toBe(400);
  });

  it("should return a 500 error if an error occurs", async () => {
    const mockData = {
      type: "funeralDirectors",
      country: "United States",
    };

    prisma.list.findFirst.mockRejectedValue("error");
    const res = await requestWithSignature(server, mockData).send(mockData);

    expect(res.status).toBe(500);
  });

  it("should return a 401 if signature is invalid", async () => {
    const mockData = {
      type: "funeralDirectors",
      country: "United States",
    };

    const res = await request(server).post("/api/lists").set("signature", "test1234").send(mockData);

    expect(res.status).toBe(401);
  });

  it("should return a 400 error if the request body is invalid", async () => {
    const mockData = {
      type: "invalid-type",
      country: "United States",
    };

    prisma.list.findFirst.mockResolvedValue(true);
    const res = await requestWithSignature(server, mockData).send(mockData);

    expect(res.status).toBe(400);
  });
});

function requestWithSignature(server: Express, mockData: Record<string, string>) {
  return request(server).post("/api/lists").set("signature", createSignatureDigest(mockData));
}
