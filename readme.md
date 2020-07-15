# What more could we do?

- Property-based testing for validation... a bit extreme
- Backed-off retrying in errors - a bit weird on a synchronous service though
- Keep track of the email in the source systems, have another API to look it up without having knowledge of what sent it
- Have the order of email services configurable
- Make sure the failover transport works with more combinations

# Out of Scope

- More niche email options - Reply to, attachments
- Better validation failed messages
- HTTP logging

# Assumptions

- Content/Subject not supplied = failure
- Subject line should be under 78 characters
- Max senders (to/cc/bcc) = 50
- Max content size = 1mb
- Transport messages are safe to pass through
- Emails safe to log

# What else

- Got lucky in that I can reuse the input of the HTTP call as the input for the interface

# To explain

- Should the call to email transport return an exception for an error?
- What happens if the email fails later?

# Env vars

- PORT
  process.env.MAILGUN_DOMAIN,
  key: process.env.MAILGUN_API_KEY,
  SENDGRID_API_KEY
  LOG_LEVEL
