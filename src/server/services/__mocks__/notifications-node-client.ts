const sendEmail = jest.fn().mockResolvedValue({ statusText: "Created" });

export const NotifyClient = jest.fn().mockReturnValue({
  sendEmail,
});
