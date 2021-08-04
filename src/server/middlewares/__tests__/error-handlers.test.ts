import { configureErrorHandlers } from "../error-handlers";

describe("Error handlers middleware", () => {
  let server: any;
  let req: any;
  let res: any;

  beforeEach(() => {
    server = {
      use: jest.fn()
    };

    req = {
      accepts: jest.fn(() => "json")
    };

    res = {
      status: jest.fn(),
      json: jest.fn(),
      render: jest.fn(),
      send: jest.fn(),
      type: jest.fn().mockReturnThis()
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

    test("it renders errors/404.html when request expects HTML", () => {
      req.accepts.mockReturnValue("html");
      handle404(req, res);
      expect(res.render).toHaveBeenCalledWith("errors/404.html");
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
      expect(res.send).toHaveBeenCalledWith("The resource you where looking for is not available.");
    });
  });

  describe("500 error handler", () => {
    let handle500: any;
    let error: any;

    beforeEach(() => {
      configureErrorHandlers(server);
      handle500 = server.use.mock.calls[1][0];
      error = { status: 500 };
    });

    test("response status is 500", () => {
      handle500(error, req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });

    test("it renders errors/500.html when request expects HTML", () => {
      req.accepts.mockReturnValue("html");
      handle500(error, req, res);
      expect(res.render).toHaveBeenCalledWith("errors/500.html");
    });

    test("it responds with json when request expects JSON", () => {
      req.accepts.mockReturnValue("json");
      handle500(error, req, res);
      expect(res.json).toHaveBeenCalledWith({
        error: "Sorry, there is a problem with the service",
      });
    });

    test("it responds with text when request does not accepts either HTMl nor JSON", () => {
      req.accepts.mockReturnValue("something else");
      handle500(error, req, res);
      expect(res.send).toHaveBeenCalledWith("Sorry, there is a problem with the service");
    });
  });
})