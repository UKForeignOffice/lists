import { AuthenticatedUser } from "./authenticated-user";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface User extends AuthenticatedUser {}
    interface Request {
      user?: User;
    }
  }
}
