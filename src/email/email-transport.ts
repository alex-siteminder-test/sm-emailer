import { EmailDetails } from "../model";

export interface Result {
  status: "error" | "ok";
  errorMessage?: string;
}

export default interface EmailTransport {
  send(input: EmailDetails): Promise<Result>;
}
