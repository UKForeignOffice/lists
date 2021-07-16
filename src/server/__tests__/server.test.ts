import { assign } from "lodash";
import * as helmet from "server/middlewares/helmet";
import * as logger from "server/middlewares/logger";
import * as compression from "server/middlewares/compression";
import * as staticServer from "server/middlewares/static";
import * as errorHandlers from "server/middlewares/error-handlers";
import * as formRunner from "server/middlewares/form-runner";
import * as cookieParser from "server/middlewares/cookie-parser";
import * as bodyParser from "server/middlewares/body-parser";
import * as views from "server/middlewares/views";
import * as auth from "server/auth/helpers";
import * as router from "server/routes";

import * as serverConfig from "server/config/server-config";
import { getServer } from "../server";

describe("Server:", () => {
  describe("trust proxy", () => {
    test("it is correctly configured in production", async () => {
      assign(serverConfig, { isProd: true });
      jest.resetModules();

      const server = await getServer();

      expect(server.locals.settings["trust proxy"]).toEqual([
        "loopback",
        "linklocal",
        "uniquelocal",
      ]);
    });

    test("it is not configured outside production", async () => {
      assign(serverConfig, { isProd: false });
      jest.resetModules();

      const server = await getServer();

      expect(server.locals.settings["trust proxy"]).toEqual(false);
    });
  });

  describe("getServer", () => {
    test("configureHelmet", async () => {
      const spy = jest.spyOn(helmet, "configureHelmet");
      const server = await getServer();
      expect(spy).toHaveBeenCalledWith(server);
    });

    test("configureLogger", async () => {
      const spy = jest.spyOn(logger, "configureLogger");
      const server = await getServer();
      expect(spy).toHaveBeenCalledWith(server);
    });

    test("configureCompression", async () => {
      const spy = jest.spyOn(compression, "configureCompression");
      const server = await getServer();
      expect(spy).toHaveBeenCalledWith(server);
    });

    test("configureStaticServer", async () => {
      const spy = jest.spyOn(staticServer, "configureStaticServer");
      const server = await getServer();
      expect(spy).toHaveBeenCalledWith(server);
    });

    test("configureFormRunnerProxy", async () => {
      const spy = jest.spyOn(formRunner, "configureFormRunnerProxy");
      const server = await getServer();
      expect(spy).toHaveBeenCalledWith(server);
    });

    test("configureFormRunnerProxy is called before body and cookie parsers", async () => {
      const spyFormRunner = jest.spyOn(formRunner, "configureFormRunnerProxy");
      const spyCookieParser: any = jest.spyOn(
        cookieParser,
        "configureCookieParser"
      );
      const spyBodyParser: any = jest.spyOn(bodyParser, "configureBodyParser");

      await getServer();

      expect(spyFormRunner).toHaveBeenCalledBefore(spyCookieParser);
      expect(spyFormRunner).toHaveBeenCalledBefore(spyBodyParser);
    });

    test("configureCookieParser", async () => {
      const spy = jest.spyOn(cookieParser, "configureCookieParser");
      const server = await getServer();
      expect(spy).toHaveBeenCalledWith(server);
    });

    test("configureBodyParser", async () => {
      const spy = jest.spyOn(bodyParser, "configureBodyParser");
      const server = await getServer();
      expect(spy).toHaveBeenCalledWith(server);
    });

    test("configureViews", async () => {
      const spy = jest.spyOn(views, "configureViews");
      const server = await getServer();
      expect(spy).toHaveBeenCalledWith(server);
    });

    test("configureAuth", async () => {
      const spy = jest.spyOn(auth, "configureAuth");
      const server = await getServer();
      expect(spy).toHaveBeenCalledWith(server);
    });

    test("configureRouter", async () => {
      const spy = jest.spyOn(router, "configureRouter");
      const server = await getServer();
      expect(spy).toHaveBeenCalledWith(server);
    });

    test("configureFormRunnerProxy", async () => {
      const spy = jest.spyOn(errorHandlers, "configureErrorHandlers");
      const server = await getServer();
      expect(spy).toHaveBeenCalledWith(server);
    });
  });
});
