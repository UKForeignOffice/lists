jest.mock("server/services/logger");
jest.mock("redis", () => jest.requireActual("redis-mock"));

beforeEach(() => {
  expect.hasAssertions();
});
