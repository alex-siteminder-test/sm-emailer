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

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  logger.info("App is running on port %d", port);
});

export default server;
