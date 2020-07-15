import {} from "mocha";
import { expect } from "chai";
import nock from "nock";

import logger from "../../logger";
import SendGridEmailTransport, {
  SENDGRID_API_URL,
} from "../sendgrid-email-transport";
import EmailTransport, { Result } from "../email-transport";
import { STANDARD_PARAM } from "../../test/constants";

const API_KEY = "this-is-an-api-key";

describe("SendGrid Email Transport", () => {
  const sendgridTransport: EmailTransport = new SendGridEmailTransport({
    apiKey: API_KEY,
  });

  let sendgridApiScope: nock.Scope;
  let originalLogLevel: string;

  beforeEach(() => {
    sendgridApiScope = nock(SENDGRID_API_URL);
    originalLogLevel = logger.level;
    logger.level = "silent";
  });

  afterEach(() => {
    sendgridApiScope.done();
    logger.level = originalLogLevel;
  });

  it("should pass the email details to sendgrid with a correct json object", async () => {
    sendgridApiScope
      .matchHeader("authorization", `Bearer ${API_KEY}`)
      .post(/.*/, (body: any) => {
        expect(body.personalizations[0].to[0]).to.deep.equal(
          STANDARD_PARAM.to[0]
        );
        expect(body.personalizations[0].to[1]).to.deep.equal(
          STANDARD_PARAM.to[1]
        );
        expect(body.personalizations[0].cc[0]).to.deep.equal(
          STANDARD_PARAM.cc[0]
        );
        expect(body.personalizations[0].cc[1]).to.deep.equal(
          STANDARD_PARAM.cc[1]
        );
        expect(body.personalizations[0].bcc[0]).to.deep.equal(
          STANDARD_PARAM.bcc[0]
        );
        expect(body.personalizations[0].bcc[1]).to.deep.equal(
          STANDARD_PARAM.bcc[1]
        );
        expect(body.personalizations[0].subject).to.deep.equal(
          STANDARD_PARAM.subject
        );
        expect(body.from).to.deep.equal(STANDARD_PARAM.from);
        expect(body.content[0].value).to.equal(STANDARD_PARAM.content);
        expect(body.content[0].type).to.equal("text/plain");

        return true;
      })
      .reply(202);

    const result = await sendgridTransport.send(STANDARD_PARAM);

    expect(result.status).to.equal("ok");
  });

  it("should return a failure response in the event of a sendgrid failure", async () => {
    sendgridApiScope.post(/.*/).reply(400, {
      errors: [
        {
          message: "Error message 1",
          field: null,
          help: null,
        },
        {
          message: "Error message 2",
          field: null,
          help: null,
        },
      ],
    });

    const result: Result = await sendgridTransport.send(STANDARD_PARAM);

    expect(result.status).to.equal("error");
    expect(result.errorMessage).to.contain("Error message 1");
    expect(result.errorMessage).to.contain("Error message 2");
  });

  // TODO: It'd probably be good to make sure that errors are getting _logged_ as well
});
