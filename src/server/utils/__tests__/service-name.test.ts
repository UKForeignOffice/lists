import serviceName from "../service-name";

describe("service-name", () => {
  it("should throw an error if an unrecognised name is passed", () => {
    expect(() => {
      serviceName("Unknown");
    }).toThrow("Service name not found");
  });

  it('should return "lawyers" when "lawyers" is passed', () => {
    expect(serviceName("lawyers")).toEqual("lawyers");
  });
});
