import { EmailDetails } from "../model";

export type Result =
  | { status: "ok" }
  | {
      status: "error";
      errorMessage: string;
    };

export default interface EmailTransport {
  send(input: EmailDetails): Promise<Result>;
}
