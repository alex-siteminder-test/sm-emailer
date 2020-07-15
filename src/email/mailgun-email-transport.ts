import fetch from "node-fetch";
import FormData from "form-data";

import EmailTransport, { Result } from "./email-transport";
import { EmailDetails, EmailPerson } from "../model";
import logger from "../logger";

export const MAILGUN_BASE_URI = "https://api.mailgun.net/v3";

interface Config {
  domain: string;
  apiKey: string;
}

/**
 * Email transport that directly calls the Mailgun REST API
 */
export default class MailgunEmailTransport implements EmailTransport {
  constructor(private readonly config: Config) {
    /** Throws an exception if the provided configuration isn't provided */
    const failIfBlank = (value: string, name: string) => {
      if (!value || value.trim() === "") {
        throw new Error(
          `Attempted to initialize mailgun with blank or undefined ${name}`
        );
      }
    };

    failIfBlank(config.domain, "domain");
    failIfBlank(config.apiKey, "apiKey");
  }

  private authHeader = `Basic ${Buffer.from(
    `api:${this.config.apiKey}`
  ).toString("base64")}`;

  async send(input: EmailDetails): Promise<Result> {
    logger.debug("Attempting to send via Mailgun: %o", input);

    const formData = new FormData();
    formData.append("from", emailPersonToString(input.from));

    addEmailPeopleToFormData("to", formData, input.to);
    addEmailPeopleToFormData("cc", formData, input.cc);
    addEmailPeopleToFormData("bcc", formData, input.bcc);

    formData.append("subject", input.subject);
    formData.append("text", input.content);

    const res = await fetch(
      `${MAILGUN_BASE_URI}/${this.config.domain}/messages`,
      {
        method: "POST",
        body: formData,
        headers: {
          Authorization: this.authHeader,
        },
      }
    );

    if (res.ok) {
      logger.debug("Successfully sent via Mailgun: %o", input);
      return { status: "ok" };
    } else {
      const resJson: { message?: string } = await res.json().catch((e) => ({}));

      logger.error(
        "Failed to send message %o via mailgun with response code %s and response %o",
        input,
        res.status,
        resJson
      );

      return { status: "error", errorMessage: resJson.message };
    }
  }
}

/**
 * Takes in an array of EmailPerson and uses emailPersonToString to add
 * them to the provided formdata in an acceptable format for Mailgun.
 */
function addEmailPeopleToFormData(
  key: "to" | "cc" | "bcc",
  formData: FormData,
  emailPeople?: EmailPerson[]
): void {
  if (emailPeople) {
    for (let emailPerson of emailPeople) {
      formData.append(key, emailPersonToString(emailPerson));
    }
  }
}

/**
 * Converts an EmailPerson to the email "Name <emailaddress>" format used by
 * mailgun.
 */
function emailPersonToString(emailPerson: EmailPerson): string {
  return emailPerson.name
    ? `${emailPerson.name} <${emailPerson.email}>`
    : `${emailPerson.email}`;
}
