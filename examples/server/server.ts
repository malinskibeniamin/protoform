import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import type { AddressInfo } from "node:net";

import type { ConnectRouter } from "@connectrpc/connect";
import { connectNodeAdapter } from "@connectrpc/connect-node";
import { createValidateInterceptor } from "@connectrpc/validate";

import { LibraryService } from "../../conformance/gen/protoform/conformance/v1/aip_pb.js";
import { FormExamplesService } from "../gen/protoform/examples/v1/forms_pb.js";
import { formExamplesService, libraryService } from "./service.js";

function routes(router: ConnectRouter) {
  router.service(FormExamplesService, formExamplesService);
  router.service(LibraryService, libraryService);
}

function setCorsHeaders(request: IncomingMessage, response: ServerResponse) {
  const { origin } = request.headers;
  response.setHeader("Vary", "Origin");
  if (origin) {
    response.setHeader("Access-Control-Allow-Origin", origin);
  }
}

function handlePreflight(request: IncomingMessage, response: ServerResponse) {
  const { origin } = request.headers;
  const requestedMethod = request.headers["access-control-request-method"];
  if (!(origin && requestedMethod)) {
    response.writeHead(400, { "Content-Type": "text/plain" });
    response.end("Invalid Preflight Request");
    return;
  }

  response.setHeader("Vary", "Origin, Access-Control-Request-Headers");
  response.setHeader("Access-Control-Allow-Methods", "GET,HEAD,POST");
  const requestedHeaders = request.headers["access-control-request-headers"];
  if (requestedHeaders) {
    response.setHeader("Access-Control-Allow-Headers", requestedHeaders);
  }
  response.writeHead(204, { "Content-Length": "0" }).end();
}

function formatAddress(address: AddressInfo) {
  const host = address.family === "IPv6" ? `[${address.address}]` : address.address;
  return `http://${host}:${address.port}`;
}

export function buildExampleServer() {
  const connectHandler = connectNodeAdapter({
    interceptors: [createValidateInterceptor()],
    routes,
  });
  const server = createServer((request, response) => {
    setCorsHeaders(request, response);

    if (request.method === "OPTIONS") {
      handlePreflight(request, response);
      return;
    }

    if (request.method === "GET" && request.url === "/health") {
      response.setHeader("Content-Type", "application/json; charset=utf-8");
      response.end(JSON.stringify({ status: "ok" }));
      return;
    }

    connectHandler(request, response);
  });

  return {
    close: () =>
      new Promise<void>((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);
            return;
          }
          resolve();
        });
      }),
    listen: ({ host, port }: { host: string; port: number }) =>
      new Promise<string>((resolve, reject) => {
        const handleError = (error: Error) => reject(error);
        server.once("error", handleError);
        server.listen(port, host, () => {
          server.off("error", handleError);
          const address = server.address();
          if (!address || typeof address === "string") {
            reject(new Error("Example server did not bind to a TCP address."));
            return;
          }
          resolve(formatAddress(address));
        });
      }),
  };
}

async function startExampleServer() {
  const server = buildExampleServer();
  await server.listen({ host: "127.0.0.1", port: 55_012 });
}

if (import.meta.main) {
  startExampleServer().catch((_error: unknown) => {
    process.exitCode = 1;
  });
}
