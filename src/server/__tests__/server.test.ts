import * as helmet from "server/middlewares/helmet";
import * as logger from "server/middlewares/logger";
import * as compression from "server/middlewares/compression";
import * as staticServer from "server/middlewares/static";
import * as errorHandlers from "server/middlewares/error-handlers";
import * as cookieParser from "server/middlewares/cookie-parser";
import * as bodyParser from "server/middlewares/body-parser";
import * as views from "server/middlewares/views";

import * as auth from "server/components/auth/helpers";
import * as cookies from "server/components/cookies/helpers";
import * as development from "server/components/development/helpers";
import * as feedback from "server/components/feedback/helpers";
import * as healthCheck from "server/components/healthCheck/helpers";
import * as lists from "server/components/lists/helpers";
import * as sitemap from "server/components/sitemap/helpers";

import { getServer } from "../server";

describe("Server:", () => {
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

    test("configureErrorHandlers", async () => {
      const spy = jest.spyOn(errorHandlers, "configureErrorHandlers");
      const server = await getServer();
      expect(spy).toHaveBeenCalledWith(server);
    });

    test("initAuth", async () => {
      const spy = jest.spyOn(auth, "initAuth");
      const server = await getServer();
      expect(spy).toHaveBeenCalledWith(server);
    });

    test("initCookies", async () => {
      const spy = jest.spyOn(cookies, "initCookies");
      const server = await getServer();
      expect(spy).toHaveBeenCalledWith(server);
    });

    // test("initDashboard", async () => {
    //   const spy = jest.spyOn(dashboard, "initDashboard");
    //   const server = await getServer();
    //   expect(spy).toHaveBeenCalledWith(server);
    // });

    test("initDevelopment", async () => {
      const spy = jest.spyOn(development, "initDevelopment");
      const server = await getServer();
      expect(spy).toHaveBeenCalledWith(server);
    });

    test("initFeedback", async () => {
      const spy = jest.spyOn(feedback, "initFeedback");
      const server = await getServer();
      expect(spy).toHaveBeenCalledWith(server);
    });

    test("initHealthCheck", async () => {
      const spy = jest.spyOn(healthCheck, "initHealthCheck");
      const server = await getServer();
      expect(spy).toHaveBeenCalledWith(server);
    });

    test("initLists", async () => {
      const spy = jest.spyOn(lists, "initLists");
      const server = await getServer();
      expect(spy).toHaveBeenCalledWith(server);
    });

    test("initSitemap", async () => {
      const spy = jest.spyOn(sitemap, "initSitemap");
      const server = await getServer();
      expect(spy).toHaveBeenCalledWith(server);
    });
  });
});
