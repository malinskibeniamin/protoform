import { create } from "@bufbuild/protobuf";
import { expect, test } from "@rstest/core";
import {
  CollectionMatrixSchema,
  PresenceMatrixSchema,
} from "../../../../../conformance/gen/protoform/conformance/v1/conformance_pb";
import type { ParsedSchema } from "../core/field-model";
import { protoToFormValues } from "../protobuf-provider/hook-runtime";
import { parseProtoSchema } from "../protobuf-provider/provider";
import { createQuickJsFormRequest } from "./bindings";
import { evaluateQuickJs } from "./evaluator";

const rule = {
  id: "company",
  source: 'form => ({fields:{company:{visible:form.kind === "business" && !("secret" in form)}}})',
  version: "1",
};
const schema: ParsedSchema = {
  fields: [
    { key: "kind", required: true, type: "string" },
    { key: "company", required: false, type: "string" },
    { key: "secret", required: false, type: "string", hints: { sensitive: true } },
  ],
};

test("binds schema fields independently of values and exposes only selected inputs", async () => {
  const request = createQuickJsFormRequest({
    rule,
    schema,
    valueFields: ["kind", "company"],
    values: { kind: "business", company: undefined, secret: "host-only" },
  });
  expect(request.fields).toEqual(["kind", "company", "secret"]);
  expect(request.values).toEqual({ kind: "business" });
  expect(await evaluateQuickJs({ ...request, source: request.rule.source })).toEqual({ company: { visible: true } });
});

test("passes normalized protobuf collections, enum numbers, bytes, and lossless integers to a rule", async () => {
  const message = create(CollectionMatrixSchema, {
    blobs: [new Uint8Array([1, 2, 3])],
    children: [{ name: "Ada" }],
    flags: [false, true],
    identifiers: [9007199254740993n],
    int64Keys: { "9007199254740993": "primary" },
    statuses: [1, 2],
  });
  const request = createQuickJsFormRequest({
    rule: {
      ...rule,
      source: `form => ({fields:{children:{visible:
        form.flags[1] && form.statuses[0] === 1 && form.blobs[0] === "AQID" &&
        form.identifiers[0] === "9007199254740993" && form.children[0].name === "Ada" &&
        form.int64Keys[0].key === "9007199254740993" && form.int64Keys[0].value === "primary"
      }}})`,
    },
    schema: parseProtoSchema(CollectionMatrixSchema),
    valueFields: ["blobs", "children", "flags", "identifiers", "int64Keys", "statuses"],
    values: protoToFormValues(CollectionMatrixSchema, message),
  });
  expect(request.values).toEqual({
    blobs: ["AQID"],
    children: [{ name: "Ada" }],
    flags: [false, true],
    identifiers: ["9007199254740993"],
    int64Keys: [{ key: "9007199254740993", value: "primary" }],
    statuses: [1, 2],
  });
  expect(await evaluateQuickJs({ ...request, source: request.rule.source })).toEqual({ children: { visible: true } });
});

test("preserves explicit false, omits unset object members, and carries oneof selection in form shape", async () => {
  const request = createQuickJsFormRequest({
    rule: {
      ...rule,
      source: `form => ({fields:{child:{visible:
        !("child" in form) && form.optionalEnabled === false &&
        form.selection.case === "approved" && form.selection.value === false
      }}})`,
    },
    schema: parseProtoSchema(PresenceMatrixSchema),
    valueFields: ["child", "optionalEnabled", "selection"],
    values: protoToFormValues(
      PresenceMatrixSchema,
      create(PresenceMatrixSchema, {
        optionalEnabled: false,
        selection: { case: "approved", value: false },
      })
    ),
  });
  expect(request.values).toEqual({ optionalEnabled: false, selection: { case: "approved", value: false } });
  expect(await evaluateQuickJs({ ...request, source: request.rule.source })).toEqual({ child: { visible: true } });
  const unset = createQuickJsFormRequest({
    rule,
    schema: parseProtoSchema(PresenceMatrixSchema),
    valueFields: ["optionalEnabled", "selection"],
    values: protoToFormValues(PresenceMatrixSchema, create(PresenceMatrixSchema)),
  });
  expect(unset.values).toEqual({ selection: {} });
});

test("binds only safe field metadata as the rule's second argument", async () => {
  const request = createQuickJsFormRequest({
    rule: {
      ...rule,
      source: `(form, fields) => ({fields:{company:{visible:
        fields.kind.type === "string" && fields.kind.required === true &&
        fields.company.required === false && Object.keys(fields.secret).sort().join() === "required,type"
      }}})`,
    },
    schema: {
      fields: schema.fields.map((field) => ({
        ...field,
        fieldConfig: { customData: { privateDescriptor: "host-only" } },
      })),
    },
    valueFields: [],
    values: {},
  });
  expect(await evaluateQuickJs({ ...request, source: request.rule.source })).toEqual({ company: { visible: true } });
});

test.each([["kind", "kind"], ["invented"]].map((valueFields) => ({ valueFields })))(
  "rejects invalid value selections %j",
  ({ valueFields }) => {
    expect(() => createQuickJsFormRequest({ rule, schema, valueFields, values: {} })).toThrow();
  }
);

test("does not execute an accessor while projecting selected form values", () => {
  let called = false;
  const values = {
    get kind() {
      called = true;
      return "business";
    },
  };
  expect(() => createQuickJsFormRequest({ rule, schema, valueFields: ["kind"], values })).toThrow();
  expect(called).toBe(false);
});
