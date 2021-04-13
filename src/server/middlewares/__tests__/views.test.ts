import { server } from "../../server";

describe("Views middleware", () => {
  test("views folder is configured correctly", () => {
    expect(server.settings.views.indexOf("/views")).not.toBe(-1);
  });
});
