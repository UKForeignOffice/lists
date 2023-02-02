export const logger = {
  error: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  log: jest.fn(),
  child: jest.fn().mockReturnThis(),
};
