import express from "express";
import bodyParser from "body-parser";

import { inputJsonSchema, InputJson } from "./model";
import logger from "./logger";

const app = express();
app.use(bodyParser.json());

app.post("/send", async (req, res) => {
  logger.info("In");
  const validationResult = inputJsonSchema.validate<InputJson>(req.body);

  if (validationResult.error) {
    res.status(400).send({
      message: validationResult.error.message,
    });
  } else {
    const parsedInput = validationResult.value;

    

    // happy path
    res.status(200).send({ message: "Sent" });
  }
});

export default app;
