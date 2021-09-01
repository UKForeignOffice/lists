import { toHaveNoViolations } from "jest-axe";
import "jest-extended";

expect.extend(toHaveNoViolations);
