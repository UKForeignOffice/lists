import { toHaveNoViolations } from "jest-axe";
import "jest-extended";

expect.extend(toHaveNoViolations);

jest.mock("server/services/redis");
