import pino from "pino";

/** Default singleton logger instance */
export default pino({
  level: process.env.LOG_LEVEL || "info",
  // TODO: For a production deployment we might want to turn off pretty-printing so the logs
  // come out as JSON, but this will do for now.
  prettyPrint: {
    levelFirst: true,
  },
});
