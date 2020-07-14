import Joi from "joi";

const NAME_REGEX = /[^;^,]*/;

/** A recipient or sender of an email */
export type EmailPerson = { email: string; name?: string };

export const emailPersonSchema = Joi.object().keys({
  email: Joi.string().email().required(),
  name: Joi.string().regex(NAME_REGEX),
});

/** Generic input for an email message */
export type EmailDetails = {
  to: EmailPerson[];
  from: EmailPerson;
  cc: EmailPerson[];
  bcc: EmailPerson[];
  subject: string;
  /**
   * The content of the email - note that this will currently _always_ be sent
   * as plain text
   */
  content: string;
};

export const emailDetailsSchema = Joi.object()
  .keys({
    to: Joi.array().required().min(1).max(50).items(emailPersonSchema),
    from: emailPersonSchema.required(),
    cc: Joi.array().max(50).items(emailPersonSchema),
    bcc: Joi.array().max(50).items(emailPersonSchema),
    // We could just default subject and content to blank, but leaving them out
    // is very likely to be a mistake
    // Max 78 characters because this is what the RFC states the subject line
    // SHOULD be under: http://www.faqs.org/rfcs/rfc2822.html
    subject: Joi.string().required().max(78),
    // 1mb max for content
    content: Joi.string().required().max(1048576),
  })
  .required();
