import {} from "mocha";
import { expect } from "chai";
import nock from "nock";

import logger from "../../logger";
import MailgunEmailTransport, {
  MAILGUN_BASE_URI,
} from "../mailgun-email-transport";
import EmailTransport, { Result } from "../email-transport";
import { EmailPerson } from "../../model";
import { STANDARD_PARAM } from "../../test/constants";

const DOMAIN = "test-mailgun";
const API_KEY = "this-is-an-api-key";
const EXPECTED_HEADER = "Basic YXBpOnRoaXMtaXMtYW4tYXBpLWtleQ=="; // base64 of api:this-is-an-api-key

describe("Mailgun Email Transport", () => {
  const mailgunTransport: EmailTransport = new MailgunEmailTransport({
    domain: DOMAIN,
    apiKey: API_KEY,
  });

  let mailgunApiScope: nock.Scope;
  let originalLogLevel: string;

  beforeEach(() => {
    mailgunApiScope = nock(MAILGUN_BASE_URI);
    originalLogLevel = logger.level;
    logger.level = "silent";
  });

  afterEach(() => {
    mailgunApiScope.done();
    logger.level = originalLogLevel;
  });

  it("should pass the email details to mailgun using the correct form parameters", async () => {
    mailgunApiScope
      .matchHeader("authorization", EXPECTED_HEADER)
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

    const result = await mailgunTransport.send(STANDARD_PARAM);

    expect(result.status).to.equal("ok");
  });

  it("should return a failure response in the event of a mailgun failure", async () => {
    mailgunApiScope
      .matchHeader("Authorization", EXPECTED_HEADER)
      .post(`/${DOMAIN}/messages`)
      .reply(400, {
        message: "This is a failure message",
        id: "<20111114174239.25659.5817@samples.mailgun.org>",
      });

    const result: Result = await mailgunTransport.send(STANDARD_PARAM);

    expect(result.status).to.equal("error");
    expect(result.errorMessage).to.equal("This is a failure message");
  });

  // TODO: It'd probably be good to make sure that errors are getting _logged_ as well
});

function shouldContainEmailPerson(
  body: string,
  name: string,
  emailPerson: EmailPerson
) {
  shouldContainValue(body, name, `${emailPerson.name} <${emailPerson.email}>`);
}

/**
 * Looks at a formdata body to see whether the provided value is there under
 * the provided name.
 */
function shouldContainValue(body: string, name: string, value: string) {
  expect(body).to.contain(`name="${name}"\r\n\r\n${value}`);
}
