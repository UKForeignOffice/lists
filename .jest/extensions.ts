import { toHaveNoViolations } from "jest-axe";
import "jest-extended";

expect.extend(toHaveNoViolations);

jest.mock("redis", () => jest.requireActual("redis-mock"));
jest.mock("server/services/redis");