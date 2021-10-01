jest.mock("server/services/logger");
jest.mock("server/services/redis");
jest.mock("redis", () => jest.requireActual("redis-mock"));

beforeEach(() => {
  expect.hasAssertions();
});
