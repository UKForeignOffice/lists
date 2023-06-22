import {
  getComplaintForm,
  postComplaintForm,
  fieldTitles,
} from "server/components/lists/controllers/complaintsController";
import { countriesList } from "server/services/metadata";

describe("Contact Us", () => {
  describe("getComplaintForm", () => {
    it("should render the contact us page without errors if there are no flash errors", () => {
      const req = { flash: jest.fn().mockReturnValue([]) };
      const res = { render: jest.fn() };

      getComplaintForm(req, res);

      expect(req.flash).toHaveBeenCalledWith("errors");
      expect(res.render).toHaveBeenCalledWith("help/complaints", {
        csrfToken: expect.any(String),
        fieldTitles: expect.any(Object),
        countriesList: expect.any(Array),
      });
    });

    it("should render the contact us page with errors if there are flash errors", () => {
      const errors = {
        details: [
          {
            message: "Enter your email address is required",
            path: ["email"],
            type: "string.empty",
            context: { label: "Enter your email address", value: "", key: "email" },
          },
        ],
      };
      const req = { flash: jest.fn().mockReturnValue([JSON.stringify(errors)]) };
      const res = { render: jest.fn() };

      getComplaintForm(req, res);

      expect(req.flash).toHaveBeenCalledWith("errors");
      expect(res.render).toHaveBeenCalledWith("help/complaints", {
        csrfToken: "",
        fieldTitles,
        countriesList,
        errors: { email: { text: "Enter your email address is required", href: "#email" } },
        errorList: [{ text: "Enter your email address is required", href: "#email" }],
      });
    });
  });

  describe("postComplaintForm", () => {
    it("should redirect to complaints-confirm if form fields are valid", async () => {
      const req = {
        body: {
          country: "France",
          detail: "Some details",
          email: "test@example.com",
          name: "John Doe",
          providerCompanyName: "Company ABC",
          providerName: "Service Provider",
          serviceType: "lawyers",
        },
      };
      const res = { redirect: jest.fn() };

      await postComplaintForm(req, res, jest.fn());

      expect(res.redirect).toHaveBeenCalledWith("/help/complaints-confirm");
    });

    it("should redirect to contact-us if form fields are invalid", async () => {
      const req = {
        body: {
          country: "USA",
          detail: "Some details",
          email: "",
          name: "John Doe",
          providerCompanyName: "Company ABC",
          providerName: "Service Provider",
          serviceType: "",
        },
        flash: jest.fn(),
      };
      const res = { redirect: jest.fn() };

      await postComplaintForm(req, res, jest.fn());

      const expectedErrorData = {
        _original: {
          country: "USA",
          detail: "Some details",
          email: "",
          name: "John Doe",
          providerCompanyName: "Company ABC",
          providerName: "Service Provider",
          serviceType: "",
        },
        details: [
          {
            message: "Enter your email address is required",
            path: ["email"],
            type: "string.empty",
            context: { label: "Enter your email address", value: "", key: "email" },
          },
          {
            message: "Which service are you contacting us about? is required",
            path: ["serviceType"],
            type: "string.empty",
            context: { label: "Which service are you contacting us about?", value: "", key: "serviceType" },
          },
        ],
      };

      expect(req.flash).toHaveBeenCalledWith("errors", JSON.stringify(expectedErrorData));
      expect(res.redirect).toHaveBeenCalledWith("/help/complaints");
    });
  });
});
