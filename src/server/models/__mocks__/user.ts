export const findUserByEmail = jest.fn().mockResolvedValue(undefined);
export const createUser = jest
  .fn()
  .mockImplementation(async (userData) => userData);
