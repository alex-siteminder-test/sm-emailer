import {} from "mocha";
import { expect } from "chai";
import EmailTransport from "../email-transport";
import { STANDARD_PARAM } from "../../test/constants";
import FailoverEmailTransport from "../failover-email-transport";
import FakeTransport from "../../test/fake-transport";
import { mock, when, instance, deepEqual, verify, anything } from "ts-mockito";

describe("Failover Email Transport", () => {
  describe("with two transports", () => {
    let fakeTransport1: FakeTransport;
    let fakeTransport2: FakeTransport;
    let failoverTransport: EmailTransport;

    beforeEach(() => {
      fakeTransport1 = mock(FakeTransport);
      fakeTransport2 = mock(FakeTransport);
      failoverTransport = new FailoverEmailTransport([
        instance(fakeTransport1),
        instance(fakeTransport2),
      ]);
    });

    it("should call the first email transport and then stop if the first transport is successful", async () => {
      when(fakeTransport1.send(deepEqual(STANDARD_PARAM))).thenReturn(
        Promise.resolve({ status: "ok" })
      );

      const result = await failoverTransport.send(STANDARD_PARAM);

      expect(result.status).to.equal("ok");

      verify(fakeTransport1.send(anything())).once();
      verify(fakeTransport2.send(anything())).never();
    });

    it("should call the first email transport, then the second, then stop, if the first is a failure and the second is successful", async () => {
      when(fakeTransport1.send(deepEqual(STANDARD_PARAM))).thenReturn(
        Promise.resolve({ status: "error", errorMessage: "message1" })
      );
      when(fakeTransport2.send(deepEqual(STANDARD_PARAM))).thenReturn(
        Promise.resolve({ status: "ok" })
      );

      const result = await failoverTransport.send(STANDARD_PARAM);

      expect(result.status).to.equal("ok");
      expect(result.errorMessage).to.be.undefined;

      verify(fakeTransport1.send(anything())).once();
      verify(fakeTransport2.send(anything())).once();
    });

    it("should return a failure with all error messages if all transports are failures", async () => {
      when(fakeTransport1.send(deepEqual(STANDARD_PARAM))).thenReturn(
        Promise.resolve({ status: "error", errorMessage: "message1" })
      );
      when(fakeTransport2.send(deepEqual(STANDARD_PARAM))).thenReturn(
        Promise.resolve({ status: "error", errorMessage: "message2" })
      );

      const result = await failoverTransport.send(STANDARD_PARAM);

      expect(result.status).to.equal("error");
      expect(result.errorMessage).to.equal("message1, message2");

      verify(fakeTransport1.send(anything())).once();
      verify(fakeTransport2.send(anything())).once();
    });
  });

  // TODO: Tests for N (1, 3, arbitrary?) transports. Just testing 2 for now because that's what the brief was.
});
