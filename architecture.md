# Architecture

## Architectural Choices

I tried to keep things as simple as I could - a single-endpoint REST API which accepts a JSON payload containing parameters, essentially a simplified version of the Sendgrid API. I used mostly solid libraries that I already had experience with and I know work - express.js, node-fetch, joi.

I had the choice of either making the failover happen at the point of sending the email or trying to maintain some kind of liveness check on each service by repeatedly polling it. I went with the former because it's a lot simpler, and for an inherently asynchronous operation like sending an email, the extra overhead of waiting a few seconds for the initial HTTP call to fail isn't (in my opinion) a big deal.

I used the strategy pattern for email transports - Sendgrid, Mailgun and the class that handles failing over between them are all implementations of the same interface. I did this because it's a neat way to swap implementations in and out, and also made testing very simple - e.g. for testing the API I could simply write tests against a mocked version of this interface, and only worry about the actual implementation of calling Mailgun or Sendgrid in the tests for their individual implementations.

I decided to make the call to `send` in these transports return a value that could be an error or a success, rather than a success or throwing an exception. I did this because the fact that we're building a failover system leads me to believe that failure is fairly likely, and exceptions should only be thrown in exceptional cases.

## Constraints

- The logic around what email transports are used, and the order in which they're called, is specified in the code rather than configuration. If this was going to go live this was my next step, but without any domain knowledge around how likely we'd be to change this around, I decided to leave it as a future improvement.
- A big constraint is that email is asynchronous, and email sending can fail _after_ being accepted by Mailgun or Sendgrid. The longer-term solution to this would be to return an id for the email and allow it to be checked on later (presumably by keeping a database that maps from our ids to sendgrid or mailgun's ids, and having an API that facilitates the lookup). Obviously this would make the architecture a _lot_ more complicated so I left it as a future story!
- The server has to be up all the time - there's no scale-to-zero like with a serverless solution. I thought about going serverless but thought this was a more relevant demonstration, given that siteminder uses express.
- If this turns out to be popular, there's a chance we'll run into `429` from Mailgun or Sendgrid because we're calling them too often - in that case rather than simply failover on each call, we'd need something more akin to a load balancer that kept track of requests coming in vs the amount that we're allowed to make, and balanced between them.

## Resiliency to Data Loss

The solution is stateless, so there's not a lot of data to lose. Data is stored by Sendgrid or Mailgun, but we don't have a lot of control over how they do it, and we're not making any use of their recording capabilities via this API yet.

The solution does of course have logging - in order to ensure the logs aren't lost, in production I'd recommend the use of some kind of log retention/search platform, either a SaaS or an open source solution like the ELK stack.

## Possible Auditing Solutions

The solution uses Pino for logs and has some basic logging for debugging already - if more logging needs to be added, I'd recommend expanding that. What and when we should be logging should be driven by the context and requirements of the system - are we logging for security? performance optimisation? a cool feature that allows users to track what they've sent? For security we probably want to be logging at the HTTP level, keeping track of IP addresses, user agents, the kind of metadata that tells us who is accessing the server. For performance we probably want a lot of individual log points at a TRACE level, giving details of when individual functions etc. are entered/exited. However, It'd probably be better to just use a profiler for this. For a user feature we might want to keep track of data like who emails have been sent to, how long they are etc - but this is probably better recorded in a database than in a log.
