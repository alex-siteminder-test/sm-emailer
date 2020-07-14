import fetch from "node-fetch";

import EmailTransport, { Result } from "./email-transport";
import { EmailDetails } from "../model";
import logger from "../logger";

interface Config {
  apiKey: string;
}

export default class SendGridEmailTransport implements EmailTransport {
  constructor(private readonly config: Config) {
    if (!config.apiKey || config.apiKey.trim() === "") {
      throw new Error(
        `Attempted to initialize sendgrid with undefined or blank API key`
      );
    }
  }

  async send(input: EmailDetails): Promise<Result> {
    logger.debug("Attempting to send via Sendgrid: %o", input);

    const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      body: JSON.stringify({
        personalizations: [
          {
            to: input.to,
            cc: input.cc,
            bcc: input.bcc,
            subject: input.subject,
          },
        ],
        from: input.from,
        content: [{ type: "text/plain", value: input.content }],
      }),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.config.apiKey}`,
      },
    });

    if (res.ok) {
      logger.debug("Successfully sent via Sendgrid: %o", input);
      return { status: "ok" };
    } else {
      const resJson: {
        errors?: { message: string }[];
      } = await res.json().catch((e) => ({}));

      logger.error(
        "Failed to send message %o via sendgrid with response code %s and response %o",
        input,
        res.status,
        resJson
      );

      return {
        status: "error",
        errorMessage: `Failed to communicate with Sendgrid. Errors were: ${resJson.errors
          ?.map((error) => '"' + error.message + '"')
          .join(", ")}`,
      };
    }
  }
}
