import buildApp from "./app";
import logger from "./logger";

import SendgridEmailTransport from "./email/sendgrid-email-transport";
import FailoverEmailTransport from "./email/failover-email-transport";
import MailgunEmailTransport from "./email/mailgun-email-transport";

const mailgunTransport = new MailgunEmailTransport({
  domain: process.env.MAILGUN_DOMAIN,
  apiKey: process.env.MAILGUN_API_KEY,
});
const sendgridTransport = new SendgridEmailTransport({
  apiKey: process.env.SENDGRID_API_KEY,
});
const emailTransport = new FailoverEmailTransport([
  sendgridTransport,
  mailgunTransport,
]);

const app = buildApp(emailTransport);

const PORT = process.env.port || 3000;

const server = app.listen(PORT, () => {
  logger.info("App is running on port %d", PORT);
});

export default server;
