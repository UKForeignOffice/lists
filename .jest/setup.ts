jest.mock("server/services/logger", () => {
  const logger = jest.requireActual("server/services/logger");
  return {
    ...logger,
  };
});
jest.mock("server/services/redis");

jest.mock("crypto", () => {
  const crypto = jest.requireActual("crypto");

  return {
    ...crypto,
    randomBytes: jest.fn().mockReturnValue("12345678"),
  };
});

beforeEach(() => {
  expect.hasAssertions();
});
