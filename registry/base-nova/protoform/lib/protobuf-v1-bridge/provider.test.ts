import {
  LongType,
  type Message,
  proto2,
  proto3,
  ScalarType,
} from "@bufbuild/protobuf";
import { describe, expect, it } from "vitest";
import { createProtobufV1Provider } from "./index.js";

type BasicForm = Message<BasicForm> & {
  enabled: boolean;
  projectId: string;
  replicas: number;
};

const BasicForm = proto3.makeMessageType<BasicForm>(
  "protoform.bridge.BasicForm",
  [
    { kind: "scalar", name: "project_id", no: 1, T: ScalarType.STRING },
    { kind: "scalar", name: "replicas", no: 2, T: ScalarType.INT32 },
    { kind: "scalar", name: "enabled", no: 3, T: ScalarType.BOOL },
  ]
);

const LegacyState = proto2.makeEnum("protoform.bridge.LegacyState", [
  { name: "LEGACY_STATE_UNKNOWN", no: 0 },
  { name: "LEGACY_STATE_READY", no: 1 },
]);

type LegacyForm = Message<LegacyForm> & {
  displayName: string;
  retries?: number;
  state?: number;
};

const LegacyForm = proto2.makeMessageType<LegacyForm>(
  "protoform.bridge.LegacyForm",
  [
    {
      kind: "scalar",
      name: "display_name",
      no: 1,
      req: true,
      T: ScalarType.STRING,
    },
    {
      default: 1,
      kind: "enum",
      name: "state",
      no: 2,
      opt: true,
      T: proto2.getEnumType(LegacyState),
    },
    {
      default: 3,
      kind: "scalar",
      name: "retries",
      no: 3,
      opt: true,
      T: ScalarType.INT32,
    },
  ]
);

type Address = Message<Address> & {
  city: string;
};

const Address = proto3.makeMessageType<Address>("protoform.bridge.Address", [
  { kind: "scalar", name: "city", no: 1, T: ScalarType.STRING },
]);

type ComplexForm = Message<ComplexForm> & {
  addresses: Address[];
  contact:
    | { case: "email"; value: string }
    | { case: "phone"; value: string }
    | { case: undefined; value?: undefined };
  labels: string[];
  metadata: Record<string, string>;
  payload: Uint8Array;
  profile?: Address;
  sequence: bigint;
};

const ComplexForm = proto3.makeMessageType<ComplexForm>(
  "protoform.bridge.ComplexForm",
  [
    {
      kind: "scalar",
      name: "labels",
      no: 1,
      repeated: true,
      T: ScalarType.STRING,
    },
    { kind: "message", name: "addresses", no: 2, repeated: true, T: Address },
    {
      K: ScalarType.STRING,
      kind: "map",
      name: "metadata",
      no: 3,
      V: { kind: "scalar", T: ScalarType.STRING },
    },
    { kind: "message", name: "profile", no: 4, T: Address },
    {
      kind: "scalar",
      name: "email",
      no: 5,
      oneof: "contact",
      T: ScalarType.STRING,
    },
    {
      kind: "scalar",
      name: "phone",
      no: 6,
      oneof: "contact",
      T: ScalarType.STRING,
    },
    { kind: "scalar", name: "payload", no: 7, T: ScalarType.BYTES },
    {
      kind: "scalar",
      L: LongType.BIGINT,
      name: "sequence",
      no: 8,
      T: ScalarType.INT64,
    },
  ]
);

describe("createProtobufV1Provider", () => {
  it("adapts a Protobuf-ES v1 proto3 message to the Protoform provider contract", () => {
    const provider = createProtobufV1Provider(BasicForm);

    expect(provider.parseSchema()).toEqual({
      fields: [
        expect.objectContaining({
          key: "projectId",
          required: false,
          type: "string",
        }),
        expect.objectContaining({
          key: "replicas",
          required: false,
          type: "number",
        }),
        expect.objectContaining({
          key: "enabled",
          required: false,
          type: "boolean",
        }),
      ],
    });
    expect(provider.getDefaultValues()).toEqual({
      enabled: false,
      projectId: "",
      replicas: 0,
    });

    const result = provider.validateSchema({
      enabled: true,
      projectId: "sample",
      replicas: 3,
    });
    expect(result).toEqual({
      data: expect.objectContaining({
        enabled: true,
        projectId: "sample",
        replicas: 3,
      }),
      success: true,
    });
    if (result.success) {
      expect(result.data).toBeInstanceOf(BasicForm);
    }
  });

  it("preserves proto2 required fields, optional presence, enums, and declared defaults", () => {
    const provider = createProtobufV1Provider(LegacyForm);

    expect(provider.parseSchema()).toEqual({
      fields: [
        expect.objectContaining({
          default: "",
          key: "displayName",
          required: true,
          type: "string",
        }),
        expect.objectContaining({
          default: 1,
          key: "state",
          options: [
            ["0", "Unknown"],
            ["1", "Ready"],
          ],
          required: false,
          type: "select",
        }),
        expect.objectContaining({
          default: 3,
          key: "retries",
          required: false,
          type: "number",
        }),
      ],
    });
    expect(provider.getDefaultValues()).toEqual({
      displayName: "",
      retries: undefined,
      state: undefined,
    });

    const result = provider.validateSchema({ displayName: "Legacy project" });
    expect(result).toEqual({
      data: expect.objectContaining({ displayName: "Legacy project" }),
      success: true,
    });
    if (result.success) {
      expect(Object.hasOwn(result.data, "state")).toBe(false);
      expect(Object.hasOwn(result.data, "retries")).toBe(false);
    }
  });

  it("converts nested messages, repeated fields, maps, oneofs, bytes, and 64-bit integers", () => {
    const provider = createProtobufV1Provider(ComplexForm);

    expect(provider.parseSchema()).toEqual({
      fields: [
        expect.objectContaining({
          key: "labels",
          schema: [expect.objectContaining({ key: "value", type: "string" })],
          type: "array",
        }),
        expect.objectContaining({
          key: "addresses",
          schema: [
            expect.objectContaining({
              key: "value",
              schema: [
                expect.objectContaining({ key: "city", type: "string" }),
              ],
              type: "object",
            }),
          ],
          type: "array",
        }),
        expect.objectContaining({
          key: "metadata",
          schema: [
            expect.objectContaining({ key: "key", type: "string" }),
            expect.objectContaining({ key: "value", type: "string" }),
          ],
          type: "map",
        }),
        expect.objectContaining({
          key: "profile",
          schema: [expect.objectContaining({ key: "city", type: "string" })],
          type: "object",
        }),
        expect.objectContaining({
          key: "contact",
          schema: [
            expect.objectContaining({ key: "email", type: "string" }),
            expect.objectContaining({ key: "phone", type: "string" }),
          ],
          type: "oneof",
        }),
        expect.objectContaining({ key: "payload", type: "bytes" }),
        expect.objectContaining({ key: "sequence", type: "int64" }),
      ],
    });
    expect(provider.getDefaultValues()).toEqual({
      addresses: [],
      contact: { case: undefined },
      labels: [],
      metadata: [],
      payload: "",
      profile: undefined,
      sequence: "0",
    });

    const result = provider.validateSchema({
      addresses: [{ city: "Warsaw" }],
      contact: { case: "email", value: "team@example.com" },
      labels: ["stable"],
      metadata: [{ key: "environment", value: "production" }],
      payload: "AQID",
      profile: { city: "Porto" },
      sequence: "9007199254740993",
    });

    expect(result).toEqual({ data: expect.any(ComplexForm), success: true });
    if (result.success) {
      expect(result.data.addresses[0]).toEqual(
        expect.objectContaining({ city: "Warsaw" })
      );
      expect(result.data.contact).toEqual({
        case: "email",
        value: "team@example.com",
      });
      expect(result.data.metadata).toEqual({ environment: "production" });
      expect(result.data.payload).toEqual(new Uint8Array([1, 2, 3]));
      expect(result.data.profile).toEqual(
        expect.objectContaining({ city: "Porto" })
      );
      expect(result.data.sequence).toBe(9_007_199_254_740_993n);
    }
  });

  it("returns every required-field and conversion error instead of constructing a partial message", () => {
    const legacyResult = createProtobufV1Provider(LegacyForm).validateSchema(
      {}
    );
    expect(legacyResult).toEqual({
      errors: [{ message: "This field is required.", path: ["displayName"] }],
      success: false,
    });

    const complexResult = createProtobufV1Provider(ComplexForm).validateSchema({
      payload: "%not-base64%",
      sequence: "not-an-integer",
    });
    expect(complexResult).toEqual({
      errors: [
        { message: "Enter valid base64 data.", path: ["payload"] },
        { message: "Enter a valid 64-bit integer.", path: ["sequence"] },
      ],
      success: false,
    });
  });
});
