import { BadRequestSchema } from "@buf/googleapis_googleapis.bufbuild_es/google/rpc/error_details_pb.js";
import { Code, ConnectError, type ServiceImpl } from "@connectrpc/connect";

import type {
  FormExamplesService,
  SubmitBasicFormRequest,
  SubmitComplexFormRequest,
} from "../gen/protoform/examples/v1/forms_pb.js";

export {
  createLibraryService,
  type LibraryServiceOptions,
  libraryService,
} from "../../registry/base-nova/protoform/demo/bookstore/library-service.js";

function fieldError(field: string, description: string): ConnectError {
  return new ConnectError("Review the highlighted fields.", Code.InvalidArgument, undefined, [
    {
      desc: BadRequestSchema,
      value: { fieldViolations: [{ description, field }] },
    },
  ]);
}

function profileId(displayName: string): string {
  const slug = displayName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, "-")
    .replace(/^-|-$/gu, "");
  return `profiles/${slug}`;
}

function submitBasicForm(request: SubmitBasicFormRequest) {
  if (request.email.endsWith("@blocked.example")) {
    throw fieldError("email", "Use an email address from an approved domain.");
  }

  return {
    displayName: request.displayName,
    profileId: profileId(request.displayName),
  };
}

function submitComplexForm(request: SubmitComplexFormRequest) {
  if (request.projectId === "taken-project") {
    throw fieldError("project_id", "Choose a different project id.");
  }

  return {
    environmentId: `environments/${request.projectId}`,
    status: request.dryRun ? "VALIDATED" : "QUEUED",
  };
}

export const formExamplesService = {
  submitBasicForm,
  submitComplexForm,
} satisfies ServiceImpl<typeof FormExamplesService>;
