const location = {
  config: {
    credentials: {},
  },
  listPlaceIndexes: jest.fn().mockReturnValue({
    promise: jest.fn().mockResolvedValue({
      Entries: [
        {
          CreateTime: "2021-03-22T16:25:58.695Z",
          DataSource: "Esri",
          Description: "MOCK_INDEX_DESCRIPTION",
          IndexName: "MOCK_INDEX_NAME",
          UpdateTime: "2021-03-22T16:25:58.695Z",
        },
      ],
    }),
  }),
  createPlaceIndex: jest.fn().mockReturnValue({
    promise: jest.fn().mockResolvedValue(true),
  }),
  searchPlaceIndexForText: jest.fn().mockReturnValue({
    promise: jest.fn().mockResolvedValue({
      Results: [
        {
          Place: {
            Country: "THA",
            Geometry: {
              Point: [100.50483000000008, 13.753360000000043],
            },
            Label: "Bangkok, Phra Nakhon, Bangkok, THA",
            Region: "Bangkok",
            SubRegion: "Phra Nakhon",
          },
        },
      ],
      Summary: {
        DataSource: "Esri",
        MaxResults: 1,
        ResultBBox: [100.50483000000008, 13.753360000000043, 100.50483000000008, 13.753360000000043],
        Text: "Bangkok, thailand",
      },
    }),
  }),
};

const secretsManager = {
  config: {
    credentials: {},
  },
  createSecret: jest.fn().mockReturnValue({
    promise: jest.fn().mockResolvedValue({}),
  }),
  putSecretValue: jest.fn().mockReturnValue({
    promise: jest.fn().mockResolvedValue({}),
  }),
  getSecretValue: jest.fn().mockReturnValue({
    promise: jest.fn().mockResolvedValue({
      SecretString: "123ABC",
    }),
  }),
};

export const Location = jest.fn().mockReturnValue(location);
export const SecretsManager = jest.fn().mockReturnValue(secretsManager);
