import EmailTransport from "../email/email-transport";
import { EmailDetails } from "../model";
import { Result } from "../email/email-transport";

/**
 * Implementation of the transport for testing that just failed if called -
 * this is needed to make ts-mokito work.
 */
export default class FakeTransport implements EmailTransport {
  send(_input: EmailDetails): Promise<Result> {
    throw Error("Deliberately not implemented!");
  }
}
