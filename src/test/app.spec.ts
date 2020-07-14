import {} from "mocha";
import { expect } from "chai";
import sinon from "sinon";
import supertest from "supertest";
import express from "express";

import app from "../app";

describe("first test", () => {
  it("should return hello world", () => {
    return supertest(app).get("/").expect(200, "Hello world");
  });
});
