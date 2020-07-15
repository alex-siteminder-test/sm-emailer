import { EmailDetails } from "../model";

export interface Result {
  status: "error" | "ok";
  errorMessage?: string;
}

/**
 * Sends an email, using some kind of external system
 */
export default interface EmailTransport {
  /**
   * Sends an email and returns a promise with the result when the email is
   * send or has failed. Won't throw an exception upon email failure.
   *
   * @param input The EmailDetails to send
   */
  send(input: EmailDetails): Promise<Result>;
}
