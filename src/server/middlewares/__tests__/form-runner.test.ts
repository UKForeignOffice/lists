import proxy from "express-http-proxy";
import { configureFormRunnerProxy } from "../form-runner";
import * as feedbackHelpers from "server/components/feedback/helpers";

jest.mock("express-http-proxy", () => ({
  __esModule: true,
  default: jest.fn().mockReturnValueOnce("proxy"),
}));

describe("FormRunner middleware", () => {
  let server: any;

  beforeEach(() => {
    server = {
      use: jest.fn(),
    };

    configureFormRunnerProxy(server);
  });

  test("it initializes proxy middleware correctly", () => {
    expect(server.use).toHaveBeenCalledWith("/application/*", "proxy");
  });

  describe("proxyReqPathResolver", () => {
    test("proxyReqPathResolver adjusts path correctly", () => {
      const req = { originalUrl: "/application/form/123" };

      const { proxyReqPathResolver } = (proxy as any).mock.calls[0][1];

      expect(proxyReqPathResolver(req)).toEqual("/form/123");
    });
  });

  describe("userResDecorator", () => {
    let proxyRes: any;
    let proxyResData: any;
    let userReq: any;
    
    beforeEach(() => {
      proxyRes = {};

      proxyResData = {
        toString: jest.fn(),
      };

      userReq = {
        originalUrl: "",
        baseUrl: "",
      };
    });

    test("it won't affect assets/* routes", () => {
      const { userResDecorator } = (proxy as any).mock.calls[0][1];
      userReq.baseUrl = "/assets/js/main.js";

      const result = userResDecorator(proxyRes, proxyResData, userReq);

      expect(proxyResData.toString).not.toHaveBeenCalled();
      expect(result).toBe(proxyResData);
    });

    test("it appends form-runner base route to all href and src properties", () => {
      const { userResDecorator } = (proxy as any).mock.calls[0][1];
      proxyResData.toString.mockReturnValueOnce(`
        <link rel="shortcut href="/assets/images/favicon.ico">
        <img src='/assets/img/logo.png' />
        <link rel="shortcut href="/assets/js/main.js">
        <script src="/assets/js/main.js"></script>
      `);

      const result = userResDecorator(proxyRes, proxyResData, userReq);
      
      expect(result).toBe(`
        <link rel="shortcut href="/application/assets/images/favicon.ico">
        <img src='/application/assets/img/logo.png' />
        <link rel="shortcut href="/application/assets/js/main.js">
        <script src="/application/assets/js/main.js"></script>
      `);
    });

    test("cookies path is correctly pointing outside form-runner base route", () => {
      const { userResDecorator } = (proxy as any).mock.calls[0][1];
      proxyResData.toString.mockReturnValueOnce(`
        <a href="/help/cookies/">Cookies</a>
        <a href="/help/cookies/">Cookies</a>
      `);

      const result = userResDecorator(proxyRes, proxyResData, userReq);
      
      expect(result).toBe(`
        <a href="/help/cookies/">Cookies</a>
        <a href="/help/cookies/">Cookies</a>
      `);
    });

    test("action property is added to all form elements", () => {
      userReq.originalUrl = "/application/form/123";
      const { userResDecorator } = (proxy as any).mock.calls[0][1];
      proxyResData.toString.mockReturnValueOnce(`
        <form id="123" class="form">
          <button></button>
        </form>
        <link rel="shortcut href="/assets/images/favicon.ico">
        <img src='/assets/img/logo.png' />
        <link rel="shortcut href="/assets/js/main.js">
        <script src="/assets/js/main.js"></script>
        <form id="123" class="form">
          <button></button>
        </form>
      `);

      const result = userResDecorator(proxyRes, proxyResData, userReq);
      
      expect(result).toBe(`
        <form action="/application/form/123" id="123" class="form">
          <button></button>
        </form>
        <link rel="shortcut href="/application/assets/images/favicon.ico">
        <img src='/application/assets/img/logo.png' />
        <link rel="shortcut href="/application/assets/js/main.js">
        <script src="/application/assets/js/main.js"></script>
        <form action="/application/form/123" id="123" class="form">
          <button></button>
        </form>
      `);
    });

    test("feedback success page content is correct", () => {
      jest.spyOn(feedbackHelpers, "getFeedbackSuccessContent").mockReturnValueOnce("<p>Success</p>");
      userReq.baseUrl = "/application/feedback/status";
      const { userResDecorator } = (proxy as any).mock.calls[0][1];
      proxyResData.toString.mockReturnValueOnce(`
        <link rel="shortcut href="/assets/images/favicon.ico">
        <img src='/assets/img/logo.png' />
        <link rel="shortcut href="/assets/js/main.js">
        <script src="/assets/js/main.js"></script>
        <body>
          <div>...</div>
          <main class="123" id="123"></main>
          <div>...</div>
        </body>
      `);

      const result = userResDecorator(proxyRes, proxyResData, userReq);

      expect(result).toBe(`
        <link rel="shortcut href="/application/assets/images/favicon.ico">
        <img src='/application/assets/img/logo.png' />
        <link rel="shortcut href="/application/assets/js/main.js">
        <script src="/application/assets/js/main.js"></script>
        <body>
          <div>...</div>
          <main class="123" id="123"><p>Success</p></main>
          <div>...</div>
        </body>
      `);
    });
  });

  describe("userResHeaderDecorator", () => {
    let headers: any;
    let userRes: any;

    beforeEach(() => {
      headers = { location: "/form-name" };
      userRes = { statusCode: 302 };
    });

    test("it adjusts header location when 302 redirect", () => {
      const { userResHeaderDecorator } = (proxy as any).mock.calls[0][1];
      const resultHeaders = userResHeaderDecorator(headers, undefined, userRes);

      expect(resultHeaders).toEqual({
        ...headers,
        location: "/application/form-name",
      });
    });
  });
});
