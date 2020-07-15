import EmailTransport, { Result } from "./email-transport";
import { EmailDetails } from "../model";

/**
 * Email transport that handles accepts one or more other email transports and
 * retries using another transport where the first one fails.
 */
export default class FailoverEmailTransport implements EmailTransport {
  /**
   * Build a new failover email transport
   *
   * @param transports An array of transports, in the order that they should be
   *    tried.
   */
  constructor(private readonly transports: EmailTransport[]) {}

  async send(input: EmailDetails): Promise<Result> {
    const errorMessages: string[] = [];

    for (let transport of this.transports) {
      const result = await transport.send(input);

      if (result.status === "ok") {
        return result;
      } else {
        errorMessages.push(result.errorMessage);
      }
    }

    return {
      status: "error",
      errorMessage: errorMessages.join(", "),
    };
  }
}
