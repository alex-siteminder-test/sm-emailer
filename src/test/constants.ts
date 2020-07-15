/** Parameter for input into the /send endpoint that has a value for every field */
export const STANDARD_PARAM = {
  to: [
    { name: "Alex1", email: "alex.gilleran+1@gmail.com" },
    { name: "Alex2", email: "alex.gilleran+2@gmail.com" },
  ],
  cc: [
    { name: "Alex3", email: "alex.gilleran+3@gmail.com" },
    { name: "Alex4", email: "alex.gilleran+4@gmail.com" },
  ],
  bcc: [
    { name: "Alex5", email: "alex.gilleran+5@gmail.com" },
    { name: "Alex6", email: "alex.gilleran+6@gmail.com" },
  ],
  from: { name: "Alex0", email: "alex@alexgilleran.com" },
  subject: "Hello subject",
  content: "Hello content",
};
