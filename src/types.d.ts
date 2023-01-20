declare module "notifications-node-client";

interface Result<Success, ErrorType extends Error = Error> {
  result?: Success;
  error?: ErrorType;
}
