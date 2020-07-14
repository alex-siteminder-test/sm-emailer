import buildApp from "./app";
import logger from "./logger";
import SendGridEmailTransport from "./email/sendgrid-email-transport";

// import FailoverEmailTransport from "./email/failover-email-transport";
// import MailgunEmailTransport from "./email/mailgun-email-transport";

// const emailTransport = new FailoverEmailTransport(); TODO
// const emailTransport = new MailgunEmailTransport({
//   domain: process.env.MAILGUN_DOMAIN,
//   key: process.env.MAILGUN_API_KEY,
// });
const emailTransport = new SendGridEmailTransport({
  apiKey: process.env.SENDGRID_API_KEY,
});

const app = buildApp(emailTransport);

const PORT = process.env.port || 3000;

const server = app.listen(PORT, () => {
  logger.info("App is running on port %d", PORT);
});

export default server;
