const sendEmail = jest.fn().mockResolvedValue({ id: "Created" });

export const NotifyClient = jest.fn().mockReturnValue({
  sendEmail,
});
