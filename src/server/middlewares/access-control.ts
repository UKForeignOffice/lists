import type { Express, RequestHandler } from "express";

enum PathType {
  Application = "application",
  Service = "service",
}

export const accessControl: RequestHandler = (req, res, next) => {
  const paths = [
    {
      name: "covid-test-providers",
      redirectTo: "https://www.gov.uk/foreign-travel-advice",
      type: PathType.Application,
    },
    {
      name: "covidTestProviders",
      redirectTo: "https://www.gov.uk/foreign-travel-advice",
      type: PathType.Service,
    },
  ];

  const find = paths.find((path) =>
    path.type === PathType.Application
      ? req.path.startsWith(`/application/${path.name}`)
      : req.query.serviceType === path.name
  );

  if (find !== undefined) {
    res.redirect(find.redirectTo);
  } else {
    next();
  }
};

export const configureAccessControl = (server: Express): void => {
  server.use((req, res, next) => {
    accessControl(req, res, next);
  });
};
