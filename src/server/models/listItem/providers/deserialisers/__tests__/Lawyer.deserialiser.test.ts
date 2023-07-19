import { lawyerDeserialiser } from "../Lawyer.deserialiser";

test("Lawyer deserialiser removes duplicated areasOfLaw", () => {
  expect(lawyerDeserialiser({ areasOfLaw: ["eggs", "egg theft", "eggs"] })).toEqual({
    areasOfLaw: ["eggs", "egg theft"],
  });
});
