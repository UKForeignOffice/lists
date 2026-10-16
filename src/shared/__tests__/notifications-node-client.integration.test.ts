import axios, { AxiosError, AxiosHeaders, type AxiosAdapter } from "axios";
import { NotifyClient } from "notifications-node-client";

jest.unmock("notifications-node-client");

const fakeApiKey = "00000000-0000-0000-0000-000000000000-11111111-1111-1111-1111-111111111111";
const testApiBaseUrl = "http://127.0.0.1:9";

describe("notifications-node-client sendEmail transport contract", () => {
  test("posts the expected email payload and returns the Axios response shape", async () => {
    const templateId = "test-template-id";
    const emailAddress = "recipient@example.test";
    const personalisation = { name: "Test recipient" };
    const reference = "list-item-123";
    const responseData = {
      id: "notification-123",
      template: { id: templateId },
    };
    let requestConfig: Parameters<AxiosAdapter>[0] | undefined;

    const adapter: AxiosAdapter = async (config) => {
      requestConfig = config;

      return {
        data: responseData,
        status: 201,
        statusText: "Created",
        headers: new AxiosHeaders(),
        config,
      };
    };

    const client = new NotifyClient(testApiBaseUrl, fakeApiKey);
    client.setClient(axios.create({ adapter }));

    const response = await client.sendEmail(templateId, emailAddress, {
      personalisation,
      reference,
    });

    if (!requestConfig?.url || typeof requestConfig.data !== "string") {
      throw new Error("Notify did not send an email request with a URL and JSON payload");
    }

    expect(requestConfig.method).toBe("post");
    expect(new URL(requestConfig.url).pathname).toBe("/v2/notifications/email");
    expect(JSON.parse(requestConfig.data)).toEqual({
      template_id: templateId,
      email_address: emailAddress,
      personalisation,
      reference,
    });

    expect(response.statusText).toBe("Created");
    expect(response.data).toEqual(responseData);
  });

  test("preserves Notify API error data on a rejected Axios response", async () => {
    const errorData = {
      status_code: 400,
      errors: [{ error: "ValidationError", message: "Email address is invalid" }],
    };
    const adapter: AxiosAdapter = async (config) => {
      const response = {
        data: errorData,
        status: 400,
        statusText: "Bad Request",
        headers: new AxiosHeaders(),
        config,
      };

      throw new AxiosError("Request failed with status code 400", "ERR_BAD_REQUEST", config, undefined, response);
    };

    const client = new NotifyClient(testApiBaseUrl, fakeApiKey);
    client.setClient(axios.create({ adapter }));

    await expect(client.sendEmail("test-template-id", "recipient@example.test")).rejects.toMatchObject({
      response: {
        data: errorData,
      },
    });
  });
});
