import { getComplaintForm, postComplaintForm } from "server/components/lists/controllers/complaintsController";

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
      const errors = [{ href: "#email", key: "email", text: "Enter your email address is required" }];
      const req = { flash: jest.fn().mockReturnValue([JSON.stringify(errors)]) };
      const res = { render: jest.fn() };

      getComplaintForm(req, res);

      expect(req.flash).toHaveBeenCalledWith("errors");
      expect(res.render).toHaveBeenCalledWith("help/complaints", {
        csrfToken: expect.any(String),
        fieldTitles: expect.any(Object),
        countriesList: expect.any(Array),
        errors: { email: "Enter your email address is required" },
        errorList: errors,
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
      const expectedErrors = [
        { text: "Enter your email address is required", href: "#email", key: "email" },
        {
          text: "What service type are you contacting us about? is required",
          href: "#serviceType",
          key: "serviceType",
        },
      ];

      await postComplaintForm(req, res, jest.fn());

      expect(req.flash).toHaveBeenCalledWith("errors", JSON.stringify(expectedErrors));
      expect(res.redirect).toHaveBeenCalledWith("/help/complaints");
    });
  });
});
