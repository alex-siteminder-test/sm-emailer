import express from "express";
import bodyParser from "body-parser";

import { emailDetailsSchema, EmailDetails } from "./model";
import EmailTransport from "./email/email-transport";
import logger from "./logger";

/** Send an error back to the user as a consistently typed JSON payload */
const sendFailure = (
  res: express.Response,
  statusCode: number,
  message: string,
  underlyingErrorMessage?: string
) => {
  res.status(statusCode).send({
    status: "Failure",
    message,
    underlyingErrorMessage,
  });
};

/**
 * Builds an express application with the passed email transport.
 */
export default function buildApp(emailTransport: EmailTransport) {
  const app = express();
  app.use(bodyParser.json());

  app.post("/send", async (req, res) => {
    try {
      const validationResult = emailDetailsSchema.validate<EmailDetails>(
        req.body
      );

      if (validationResult.error) {
        sendFailure(res, 400, validationResult.error.message);
      } else {
        const parsedInput = validationResult.value;

        const result = await emailTransport.send(parsedInput);

        if (result.status === "ok") {
          res.status(200).send({ status: "Success" });
        } else {
          sendFailure(
            res,
            500,
            "The email transport failed to send the email message",
            result.errorMessage
          );
        }
      }
    } catch (e) {
      logger.error(e);
      sendFailure(res, 500, "Unknown error");
    }
  });

  return app;
}
