import { configureErrorHandlers, HttpException } from "../error-handlers";

describe("Error handlers middleware", () => {
  let server: any;
  let req: any;
  let res: any;

  beforeEach(() => {
    server = {
      use: jest.fn(),
    };

    req = {
      accepts: jest.fn(() => "json"),
    };

    res = {
      status: jest.fn(),
      json: jest.fn(),
      render: jest.fn(),
      send: jest.fn(),
      type: jest.fn().mockReturnThis(),
    };
  });

  test("it configures error handler", () => {
    configureErrorHandlers(server);
    expect(server.use).toHaveBeenCalledTimes(2);
  });

  describe("404 error handler", () => {
    let handle404: any;

    beforeEach(() => {
      configureErrorHandlers(server);
      handle404 = server.use.mock.calls[0][0];
    });

    test("response status is 400", () => {
      handle404(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    test("it renders errors/404.njk when request expects HTML", () => {
      req.accepts.mockReturnValue("html");
      handle404(req, res);
      expect(res.render).toHaveBeenCalledWith("errors/404");
    });

    test("it responds with json when request expects JSON", () => {
      req.accepts.mockReturnValue("json");
      handle404(req, res);
      expect(res.json).toHaveBeenCalledWith({
        error: "The resource you where looking for is not available.",
      });
    });

    test("it responds with text when request does not accepts either HTMl nor JSON", () => {
      req.accepts.mockReturnValue("something else");
      handle404(req, res);
      expect(res.send).toHaveBeenCalledWith(
        "The resource you where looking for is not available."
      );
    });
  });

  describe("500 error handler", () => {
    let handle500: any;
    let error: any;

    beforeEach(() => {
      configureErrorHandlers(server);
      handle500 = server.use.mock.calls[1][0];
      error = new HttpException(500, "500", "Error has occurred");
    });

    test("response status is 500", () => {
      handle500(error, req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });

    test("it renders errors/generic-error.njk when request expects HTML", () => {
      req.accepts.mockReturnValue("html");
      handle500(error, req, res);
      expect(res.render).toHaveBeenCalledWith("errors/generic-error", {message: "Error has occurred", status: 500});
    });

    test("it responds with json when request expects JSON", () => {
      req.accepts.mockReturnValue("json");
      handle500(error, req, res);
      expect(res.json).toHaveBeenCalledWith({
        error: "This request could not be processed - Error has occurred",
      });
    });

    test("it responds with text when request does not accepts either HTMl nor JSON", () => {
      req.accepts.mockReturnValue("something else");
      handle500(error, req, res);
      expect(res.send).toHaveBeenCalledWith(
        "This request could not be processed - Error has occurred"
      );
    });
  });

  describe("403 error handler", () => {
    let handle403: any;
    let error: any;

    beforeEach(() => {
      configureErrorHandlers(server);
      handle403 = server.use.mock.calls[1][0];
      error = new HttpException(403, "EBADCSRFTOKEN", "Error has occurred");
    });

    test("response status is 403", () => {
      handle403(error, req, res);
      expect(res.status).toHaveBeenCalledWith(403);
    });

    test("it renders errors/generic-error when request expects HTML", () => {
      req.accepts.mockReturnValue("html");
      handle403(error, req, res);
      expect(res.render).toHaveBeenCalledWith("errors/generic-error", {message: "Error has occurred", status: 403});
    });

    test("it responds with json when request expects JSON", () => {
      req.accepts.mockReturnValue("json");
      handle403(error, req, res);
      expect(res.json).toHaveBeenCalledWith({
        error: "This request could not be processed - Error has occurred",
      });
    });

    test("it responds with text when request does not accepts either HTMl nor JSON", () => {
      req.accepts.mockReturnValue("something else");
      handle403(error, req, res);
      expect(res.send).toHaveBeenCalledWith(
        "This request could not be processed - Error has occurred"
      );
    });
  });
});
