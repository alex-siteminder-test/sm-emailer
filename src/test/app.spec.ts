import {} from "mocha";
import express from "express";
import { mock, when, instance, deepEqual, verify } from "ts-mockito";
import supertest from "supertest";
import { expect } from "chai";

import buildApp from "../app";
import FakeTransport from "./fake-transport";
import { STANDARD_PARAM } from "./constants";

describe("API", () => {
  let mockedTransport: FakeTransport;
  let app: express.Application;

  beforeEach(() => {
    mockedTransport = mock(FakeTransport);
    app = buildApp(instance(mockedTransport));
  });

  describe("interaction with the email transport", () => {
    it("should return 200 for a successful send", async () => {
      when(mockedTransport.send(deepEqual(STANDARD_PARAM))).thenReturn(
        Promise.resolve({ status: "ok" })
      );

      await supertest(app)
        .post("/send")
        .send(STANDARD_PARAM)
        .expect(200, { status: "Success" });

      verify(mockedTransport.send(deepEqual(STANDARD_PARAM))).called();
    });

    it("should return 500 for a transport failure", async () => {
      const errorMessage = "Blah this is an error";

      when(mockedTransport.send(deepEqual(STANDARD_PARAM))).thenReturn(
        Promise.resolve({ status: "error", errorMessage })
      );

      await supertest(app).post("/send").send(STANDARD_PARAM).expect(500, {
        status: "Failure",
        message: "The email transport failed to send the email message",
        underlyingErrorMessage: errorMessage,
      });

      verify(mockedTransport.send(deepEqual(STANDARD_PARAM))).called();
    });
  });

  describe("validation", () => {
    it("should return 400 when no 'to' field specified", async () => {
      const param = {
        ...STANDARD_PARAM,
        to: undefined as string,
      };

      await supertest(app)
        .post("/send")
        .send(param)
        .expect(400)
        .then((res) => {
          expect(res.text).to.contain('to\\" is required');
        });
    });

    it("should return 400 when subject field is too long", async () => {
      const param = {
        ...STANDARD_PARAM,
        subject: "a".repeat(79),
      };

      await supertest(app)
        .post("/send")
        .send(param)
        .expect(400)
        .then((res) => {
          expect(res.text).to.contain(
            '\\"subject\\" length must be less than or equal to 78 characters long'
          );
        });
    });

    // TODO: Other validation tests - I think you get the point here.
  });
});
