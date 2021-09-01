jest.mock("server/services/logger");

const ioredisMock = require('ioredis-mock');
jest.setMock('ioredis', ioredisMock);

beforeEach(() => {
  expect.hasAssertions();
});
