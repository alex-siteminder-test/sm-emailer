# Email Sender

This is a simple node API that takes in email and abstracts across Mailgun and Sendgrid - if one fails, it'll use the other one.

## Developing

### Environment Variables

Currently all config is via environment variables:

- PORT: The port to listen for connections on. Default is `3000`
- MAILGUN_DOMAIN: The mailgun domain to use (get from your mailgun account). Failure to supply this will stop the app from starting.
- MAILGUN_API_KEY: The mailgun api key to use (get from your mailgun account). Failure to supply this will stop the app from starting.
- SENDGRID_API_KEY: The sendgrid api key to use (get from your sendgrid account). Failure to supply this will stop the app from starting.
- LOG_LEVEL: The log level to use - available levels are `fatal`, `error`, `warn`, `info`, `debug`, and `trace`. Default is `info`

### To install

Simply clone the code and

```bash
npm install
```

### To run in development

```bash
npm run dev
```

This uses ts-node and nodemon for local development - if you make a change it will recompile and restart.

### To run tests

```bash
npm run test
```

All the tests are self-contained and don't require access to mailgun or sendgrid.

## API

This API currently has only one endpoint:

### Send (POST /send)

Sends an email - in its current configuration the API will first try to send via Sendgrid, then if that fails it'll try Mailgun. If both fail it'll simply return a failure code/message.

#### Parameters

Accepts a JSON body, an example showing all parameters is below:

```json
{
  "to": [
    { "name": "Alex", "email": "alex.gilleran+1@gmail.com" },
    { "name": "Alex", "email": "alex.gilleran+2@gmail.com" }
  ],
  "cc": [
    { "name": "Alex", "email": "alex.gilleran+3@gmail.com" },
    { "name": "Alex", "email": "alex.gilleran+4@gmail.com" }
  ],
  "bcc": [
    { "name": "Alex", "email": "alex.gilleran+5@gmail.com" },
    { "name": "Alex", "email": "alex.gilleran+6@gmail.com" }
  ],
  "from": { "email": "alex2@alexgilleran.com" },
  "subject": "Hello subj",
  "content": "Hello desc"
}
```

## Demo
There's a deployment already on Heroku at https://alex-siteminder-test.herokuapp.com (add `/send` to use the actual API). Note that my sendgrid account only allows sending from "alex@alexgilleran.com", but because sendgrid is the first transport tried, this is a neat way to test the failover (if you send from any other address, it'll come from mailgun). You can tell where it comes from the email metadata, most easy is "via" if you send to a gmail address.

I've also included a Postman file in `postman.json` in the root to make things a bit easier.

## Assumptions That I Made

- If an email has no content or subject, it's assumed to be invalid
- Subject line should be under 78 characters
- Max senders (to/cc/bcc) = 50
- Max content size = 1mb
- Error messages from mailgun/sendgrid are safe to pass back to the user - I'm usually hesitant to directly pass any error message back to the user for fear that it would reveal exploitable implementation details to an attacker, but I think sendgrid/mailgun's messages are very likely to be safe.
- Email contents are safe to log - if this server was being used for automatic system messages then it's fine, if it is supposed to be used for individual's private messages we'd need to be more careful.

## What I didn't get to

- More comprehensive testing for failing over between other combinations of email transports
- More comprehensive testing for input validation
- Better messages for validation failed - right now I'm returning what Joi says, which works fine but it's a bit ugly.