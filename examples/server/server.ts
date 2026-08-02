import type { ConnectRouter } from "@connectrpc/connect";
import { fastifyConnectPlugin } from "@connectrpc/connect-fastify";
import { createValidateInterceptor } from "@connectrpc/validate";
import cors from "@fastify/cors";
import { fastify } from "fastify";

import { LibraryService } from "../../conformance/gen/protoform/conformance/v1/aip_pb.js";
import { FormExamplesService } from "../gen/protoform/examples/v1/forms_pb.js";
import { formExamplesService, libraryService } from "./service.js";

function routes(router: ConnectRouter) {
  router.service(FormExamplesService, formExamplesService);
  router.service(LibraryService, libraryService);
}

export async function buildExampleServer() {
  const server = fastify({ logger: false });
  await server.register(cors, { origin: true });
  await server.register(fastifyConnectPlugin, {
    interceptors: [createValidateInterceptor()],
    routes,
  });
  server.get("/health", async () => ({ status: "ok" }));
  return server;
}

async function startExampleServer() {
  const server = await buildExampleServer();
  const address = await server.listen({ host: "127.0.0.1", port: 55_012 });
  console.info(`Form example server listening at ${address}`);
}

if (import.meta.main) {
  startExampleServer().catch((error: unknown) => {
    console.error(
      error instanceof Error
        ? error.message
        : "Failed to start the form example server."
    );
    process.exitCode = 1;
  });
}
