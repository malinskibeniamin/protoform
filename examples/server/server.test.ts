import {
  Code,
  ConnectError,
  createClient,
  createRouterTransport,
} from "@connectrpc/connect";
import { createConnectTransport } from "@connectrpc/connect-node";
import { callUnaryMethod } from "@connectrpc/connect-query";
import { createValidateInterceptor } from "@connectrpc/validate";
import { afterEach, describe, expect, it } from "vitest";

import { LibraryService } from "../../conformance/gen/protoform/conformance/v1/aip_pb.js";
import { FormExamplesService } from "../gen/protoform/examples/v1/forms_pb.js";
import { buildExampleServer } from "./server.js";
import { formExamplesService } from "./service.js";

let closeServer: (() => Promise<void>) | undefined;

afterEach(async () => {
  await closeServer?.();
  closeServer = undefined;
});

describe("form example Connect server", () => {
  it("serves health checks and reflects browser origins", async () => {
    const server = buildExampleServer();
    const address = await server.listen({ host: "127.0.0.1", port: 0 });
    closeServer = () => server.close();

    const response = await fetch(`${address}/health`, {
      headers: { Origin: "https://protoform.pages.dev" },
    });

    await expect(response.json()).resolves.toEqual({ status: "ok" });
    expect(response.headers.get("access-control-allow-origin")).toBe(
      "https://protoform.pages.dev"
    );

    const preflight = await fetch(`${address}/health`, {
      headers: {
        "Access-Control-Request-Headers": "Content-Type, X-Protoform-Test",
        "Access-Control-Request-Method": "POST",
        Origin: "https://protoform.pages.dev",
      },
      method: "OPTIONS",
    });
    expect(preflight.status).toBe(204);
    expect(preflight.headers.get("access-control-allow-methods")).toBe(
      "GET,HEAD,POST"
    );
    expect(preflight.headers.get("access-control-allow-headers")).toBe(
      "Content-Type, X-Protoform-Test"
    );

    const invalidPreflight = await fetch(`${address}/health`, {
      headers: { Origin: "https://protoform.pages.dev" },
      method: "OPTIONS",
    });
    expect(invalidPreflight.status).toBe(400);
  });

  it("runs the generated route and validation interceptor in process", async () => {
    const transport = createRouterTransport(
      (router) => router.service(FormExamplesService, formExamplesService),
      { router: { interceptors: [createValidateInterceptor()] } }
    );

    const response = await callUnaryMethod(
      transport,
      FormExamplesService.method.submitBasicForm,
      { displayName: "Ada Lovelace", email: "ada@example.com" }
    );
    expect(response.profileId).toBe("profiles/ada-lovelace");

    await expect(
      callUnaryMethod(transport, FormExamplesService.method.submitBasicForm, {
        displayName: "",
        email: "not-an-email",
      })
    ).rejects.toMatchObject({ code: Code.InvalidArgument });
  });

  it("serves generated clients and rejects invalid protobuf requests", async () => {
    const server = await buildExampleServer();
    const address = await server.listen({ host: "127.0.0.1", port: 0 });
    closeServer = () => server.close();
    const client = createClient(
      FormExamplesService,
      createConnectTransport({ baseUrl: address, httpVersion: "1.1" })
    );

    const response = await client.submitBasicForm({
      displayName: "Ada Lovelace",
      email: "ada@example.com",
    });
    expect(response.profileId).toBe("profiles/ada-lovelace");

    await expect(
      client.submitBasicForm({ displayName: "", email: "not-an-email" })
    ).rejects.toBeInstanceOf(ConnectError);
  });

  it("serves the LibraryService CRUD API and enforces the ISBN-13 CEL rule", async () => {
    const server = await buildExampleServer();
    const address = await server.listen({ host: "127.0.0.1", port: 0 });
    closeServer = () => server.close();
    const client = createClient(
      LibraryService,
      createConnectTransport({ baseUrl: address, httpVersion: "1.1" })
    );

    const response = await client.createBook({
      book: {
        displayName: "The Protoform Guide",
        isbn: "9783161484100",
      },
      bookId: "protoform-guide",
      parent: "publishers/acme",
    });

    expect(response.name).toBe("publishers/acme/books/protoform-guide");
    expect(response.displayName).toBe("The Protoform Guide");

    await expect(
      client.createBook({
        book: {
          displayName: "Invalid ISBN",
          isbn: "9783161484101",
        },
        bookId: "invalid-isbn",
        parent: "publishers/acme",
      })
    ).rejects.toMatchObject({ code: Code.InvalidArgument });

    const listed = await client.listBooks({ parent: "publishers/acme" });
    expect(listed.books.map((book) => book.name)).toContain(response.name);
    await expect(
      client.getBook({ name: response.name })
    ).resolves.toMatchObject({ isbn: "9783161484100" });
  });
});
