import { createSecret, rotateSecret, getSecretValue } from '../secrets-manager/aws';
import {
  CreateSecretCommand,
  GetSecretValueCommand,
  PutSecretValueCommand,
  SecretsManagerClient
} from '@aws-sdk/client-secrets-manager';

jest.mock('@aws-sdk/client-secrets-manager');

describe('Secrets Manager', () => {
  let secretsManager;

  beforeEach(() => {
    secretsManager = new SecretsManagerClient();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createSecret', () => {
    test('creates secret successfully', async () => {
      secretsManager.send.mockResolvedValue({});
      const result = await createSecret('TEST_SECRET');
      expect(result).toBe(true);
      expect(secretsManager.send).toHaveBeenCalledWith(expect.anything(CreateSecretCommand));
    });

    test('returns false when creation fails', async () => {
      secretsManager.send.mockRejectedValue(new Error('createSecret error message'));
      const result = await createSecret('TEST_SECRET');
      expect(result).toBe(false);
    });
  });

  describe('rotateSecret', () => {
    const mockSecret = {
      ARN: '123ARN',
      CreatedDate: new Date(),
    };

    test.each([
      [1, false],
      [29, false],
    ])('rotates secret based on age', async (daysAgo, shouldRotate) => {
      const currentDate = new Date();
      jest.spyOn(global.Date, 'now').mockReturnValue(currentDate.getTime());
      const mockSecretCreatedDate = new Date(currentDate.getTime());
      mockSecretCreatedDate.setUTCDate(currentDate.getUTCDate() - daysAgo);
      mockSecret.CreatedDate = mockSecretCreatedDate;
      secretsManager.send.mockResolvedValueOnce(mockSecret as any);

      const result = await rotateSecret('TEST_SECRET');
      mockSecret.CreatedDate = new Date(currentDate.getTime());

      expect(result).toBe(shouldRotate);
      if (shouldRotate) {
        expect(secretsManager.send).toHaveBeenCalledWith(expect.any(PutSecretValueCommand));
      } else {
        expect(secretsManager.send).toHaveBeenCalledWith(expect.any(GetSecretValueCommand));
      }
    });


  });


  describe('getSecretValue', () => {
    test('retrieves secret successfully', async () => {
      secretsManager.send.mockResolvedValue({ SecretString: '123ABC' });
      const secret = await getSecretValue('TEST_SECRET');
      expect(secret).toEqual('123ABC');
      expect(secretsManager.send).toHaveBeenCalledWith(expect.any(GetSecretValueCommand));
    });

    test('creates secret if not found', async () => {
      secretsManager.send
        .mockRejectedValueOnce({ name: 'ResourceNotFoundException' })
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({ SecretString: '123ABC' });

      const secret = await getSecretValue('TEST_SECRET');

      expect(secret).toEqual('123ABC');
      expect(secretsManager.send).toHaveBeenCalledTimes(3);
    });

    test('throws error on other exceptions', async () => {
      secretsManager.send.mockRejectedValue(new Error('getSecretValue error'));
      await expect(getSecretValue('TEST_SECRET')).rejects.toThrow('getSecretValue error');
    });
  });
});
