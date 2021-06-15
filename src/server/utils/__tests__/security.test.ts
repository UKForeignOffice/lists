import { enforceHttps } from "../security";

describe("Utils Security", () => {
  describe("enforceHttps", () => {
    test("it replaces http protocol with https", () => {
      const result = enforceHttps("http://test.com");
      expect(result).toBe("https://test.com");
    });

    test("it adds https protocol", () => {
      const result = enforceHttps("test.com");
      expect(result).toBe("https://test.com");
    });
  });
});
