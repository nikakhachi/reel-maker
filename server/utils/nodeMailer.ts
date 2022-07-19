import { SendMailOptions, createTransport } from "nodemailer";
import logger from "./logger";

const transporter = createTransport({
  service: "Zoho",
  auth: {
    user: "reelmaker.info@zohomail.com",
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const sendEmail = async ({ to, subject, text, html }: SendMailOptions) =>
  new Promise((res, rej) => {
    logger.info(`Sending email to ${to}`);
    const mailOptions: SendMailOptions = {
      from: "reelmaker.info@zohomail.com",
      to,
      subject: subject,
      text,
      html,
    };
    transporter.sendMail(mailOptions, (err, data) => {
      if (err) return rej(err);
      res(data);
    });
  });
