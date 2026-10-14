import { toHaveNoViolations } from "jest-axe";
import * as matchers from "jest-extended";

expect.extend(toHaveNoViolations);
expect.extend(matchers);

jest.mock("server/services/redis");
