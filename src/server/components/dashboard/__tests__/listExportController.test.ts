import { PassThrough } from "node:stream";
import type { Request, Response } from "express";
import { prisma } from "server/models/db/__mocks__/prisma-client";
import { listExportController } from "../controllers/listExportController";

jest.mock("server/models/db/prisma-client");

describe("listExportController", () => {
  it("preserves CSV columns, escaping, empty values, and formula protection", async () => {
    prisma.list.findUniqueOrThrow.mockResolvedValue({
      id: 12,
      type: "lawyers",
      country: { name: "Spain" },
      items: [
        {
          id: 7,
          type: "lawyers",
          jsonData: {
            organisationName: "Normal Org",
            emailAddress: "person@example.test",
            empty: "",
            quoted: 'Comma, and "quote"',
            formula: "=1+1",
          },
          updatedAt: new Date("2024-01-01T00:00:00.000Z"),
          addressId: 1,
          listId: 12,
          metadata: {},
          declaration: [],
          updatedJsonData: {},
          addressCountry: "UK",
          country: "UK",
        },
      ],
    } as never);

    const response = new PassThrough();
    const setHeader = jest.fn().mockReturnThis();
    const redirect = jest.fn();
    Object.assign(response, { set: setHeader, redirect });

    const csvOutput = new Promise<string>((resolve, reject) => {
      const chunks: string[] = [];
      response.setEncoding("utf8");
      response.on("data", (chunk: string) => chunks.push(chunk));
      response.on("end", () => resolve(chunks.join("")));
      response.on("error", reject);
    });

    await listExportController(
      {
        params: { listId: "12" },
        user: { id: 3, emailAddress: "exporter@example.test" },
        flash: jest.fn(),
      } as unknown as Request,
      response as unknown as Response
    );

    expect(redirect).not.toHaveBeenCalled();
    expect(await csvOutput).toBe(
      'organisationName,emailAddress,empty,quoted,formula,id\nNormal Org,person@example.test,none provided,"Comma, and ""quote""",1+1,7'
    );
    expect(setHeader).toHaveBeenCalledWith("Content-Type", "text/csv");
    expect(prisma.audit.create).toHaveBeenCalled();
  });
});
