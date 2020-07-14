import {} from "mocha";
import express from "express";
import { expect } from "chai";
import nock from "nock";

import MailgunEmailTransport, {
  MAILGUN_BASE_URI,
} from "../mailgun-email-transport";
import EmailTransport, { Result } from "../email-transport";
import { EmailDetails, EmailPerson } from "../../model";
import { STANDARD_PARAM } from "../../test/constants";

const DOMAIN = "test-mailgun";
const API_KEY = "this-is-an-api-key";

describe("Mailgun Email Transport", () => {
  const mailgunTransport = new MailgunEmailTransport({
    domain: DOMAIN,
    apiKey: API_KEY,
  });

  let mailgunApiScope: nock.Scope;

  beforeEach(() => {
    mailgunApiScope = nock(MAILGUN_BASE_URI);
  });

  afterEach(() => {
    mailgunApiScope.done();
  });

  it("should pass the email details to mailgun using the correct form parameters", () => {
    mailgunApiScope
      .post(`/${DOMAIN}/messages`, (body: string) => {
        shouldContainEmailPerson(body, "from", STANDARD_PARAM.from);
        shouldContainEmailPerson(body, "to", STANDARD_PARAM.to[0]);
        shouldContainEmailPerson(body, "to", STANDARD_PARAM.to[1]);
        shouldContainEmailPerson(body, "cc", STANDARD_PARAM.cc[0]);
        shouldContainEmailPerson(body, "cc", STANDARD_PARAM.cc[1]);
        shouldContainEmailPerson(body, "bcc", STANDARD_PARAM.bcc[0]);
        shouldContainEmailPerson(body, "bcc", STANDARD_PARAM.bcc[1]);

        return true;
      })
      .reply(200, {
        message: "Queued. Thank you.",
        id: "<20111114174239.25659.5817@samples.mailgun.org>",
      });

    mailgunTransport.send(STANDARD_PARAM);
  });
});

function shouldContainEmailPerson(
  body: string,
  name: string,
  emailPerson: EmailPerson
) {
  shouldContainValue(body, name, `${emailPerson.name} <${emailPerson.email}>`);
}

function shouldContainValue(body: string, name: string, value: string) {
  expect(body).to.contain(`name="${name}"\r\n\r\n${value}`);
}
