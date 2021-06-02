import { toHaveNoViolations } from "jest-axe";

expect.extend(toHaveNoViolations);
jest.mock("redis", () => jest.requireActual("redis-mock"));
