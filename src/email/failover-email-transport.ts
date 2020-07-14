import EmailTransport from "./email-transport";
import { EmailDetails } from "../model";

export default class FailoverEmailTransport implements EmailTransport {
  send(input: EmailDetails): Promise<any> {
    throw new Error("Method not implemented.");
  }
}
