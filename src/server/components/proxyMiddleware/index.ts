import { Express } from "express";
 import proxy from "express-http-proxy";
 import { FORM_RUNNER_URL, isProd } from "server/config";

 /**
  * Proxy middleware for the form runner
  * @param app Express app
  * Important: this middleware must be added before body and cookie parsers middlewares
  */
 export function configureFormRunnerProxyMiddleware(server: Express): void {
  if (isProd) {
    server.set("trust proxy", ["loopback", "linklocal", "uniquelocal"]);
  } else {
    server.set("trust proxy", false);
  }


  server.use(
    `/application/*`,
    proxy(FORM_RUNNER_URL, {
      proxyReqPathResolver: function (req) {
        return req.originalUrl.replace("/application", "");
      },
      userResDecorator: function (_, proxyResData, userReq) {
        if (userReq.baseUrl.includes("assets/")) {
          return proxyResData;
        }
        return proxyResData
          .toString("utf8")
          .replace(
            /(href|src|value)=('|")\/([^'"]+)/g,
            `$1=$2/application/$3`
          )
      },
      userResHeaderDecorator(headers, _userReq, userRes) {
        if (userRes.statusCode === 302) {
          return {
            ...headers,
            location: `/application${headers.location}`,
          };
        }

        return headers;
      },
    
    })
  );
 }
 