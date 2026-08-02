import { spawn } from "node:child_process";
import { createServer, request as requestUpstream } from "node:http";
import process from "node:process";

import { buildExampleServer } from "../examples/server/server.js";
import { unexpectedChildExitCode } from "./production-lifecycle.js";
import {
  createPublicProxyHeaderResolver,
  resolveProxyTarget,
} from "./production-routing.js";

const DOCS_PORT = 55_111;
const API_PORT = 55_112;
const PUBLIC_PORT = Number(process.env.PORT ?? 8080);
const HOST = process.env.HOST ?? "0.0.0.0";
const { PUBLIC_ORIGIN } = process.env;
const UPSTREAM_TIMEOUT_MS = 15_000;
const resolveForwardedHeaders = createPublicProxyHeaderResolver(PUBLIC_ORIGIN);

if (!Number.isInteger(PUBLIC_PORT) || PUBLIC_PORT < 1 || PUBLIC_PORT > 65_535) {
  throw new Error("PORT must be an integer from 1 through 65535.");
}

const api = await buildExampleServer();
await api.listen({ host: "127.0.0.1", port: API_PORT });

let stopping = false;
const docs = spawn(process.execPath, ["./dist/server/entry.mjs"], {
  env: {
    ...process.env,
    HOST: "127.0.0.1",
    PORT: String(DOCS_PORT),
  },
  stdio: "inherit",
});

docs.once("error", (error) => {
  console.error("Failed to start the docs server.", error);
  process.exitCode = 1;
  stop().catch(handleStopError);
});

docs.once("exit", (code, signal) => {
  const failureCode = unexpectedChildExitCode(stopping, code, signal);
  if (failureCode === null) {
    return;
  }
  console.error(
    signal
      ? `Docs server exited from signal ${signal}.`
      : `Docs server exited with code ${code ?? "unknown"}.`
  );
  process.exitCode = failureCode;
  stop().catch(handleStopError);
});

const gateway = createServer((incoming, outgoing) => {
  const target = resolveProxyTarget(incoming.url ?? "/", DOCS_PORT, API_PORT);
  const forwarded = resolveForwardedHeaders(
    incoming.headers.host ?? `${HOST}:${PUBLIC_PORT}`
  );
  const upstream = requestUpstream(
    {
      headers: {
        ...incoming.headers,
        host: `127.0.0.1:${target.port}`,
        "x-forwarded-host": forwarded.forwardedHost,
        "x-forwarded-proto": forwarded.forwardedProto,
      },
      hostname: "127.0.0.1",
      method: incoming.method,
      path: target.pathname,
      port: target.port,
      timeout: UPSTREAM_TIMEOUT_MS,
    },
    (response) => {
      outgoing.writeHead(response.statusCode ?? 502, response.headers);
      response.pipe(outgoing);
    }
  );
  upstream.on("error", (error) => {
    console.error("Production upstream request failed.", error);
    if (!outgoing.headersSent) {
      outgoing.writeHead(502, { "content-type": "text/plain; charset=utf-8" });
    }
    outgoing.end("Upstream unavailable.");
  });
  upstream.on("timeout", () => {
    upstream.destroy(new Error("Production upstream request timed out."));
  });
  incoming.once("aborted", () => upstream.destroy());
  incoming.pipe(upstream);
});

gateway.headersTimeout = 20_000;
gateway.keepAliveTimeout = 5000;
gateway.requestTimeout = 30_000;
gateway.on("clientError", (_error, socket) => {
  if (socket.writable) {
    socket.end("HTTP/1.1 400 Bad Request\r\nConnection: close\r\n\r\n");
  }
});
gateway.once("error", (error) => {
  console.error("Production gateway failed.", error);
  process.exitCode = 1;
  stop().catch(handleStopError);
});

gateway.listen(PUBLIC_PORT, HOST, () => {
  console.info(`Protoform listening at http://${HOST}:${PUBLIC_PORT}`);
});

async function stop() {
  if (stopping) {
    return;
  }
  stopping = true;
  docs.kill("SIGTERM");
  await Promise.all([closeGateway(), api.close()]);
}

function closeGateway(): Promise<void> {
  return new Promise((resolve, reject) => {
    gateway.close((error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
}

function handleStopError(error: unknown): void {
  console.error("Failed to stop production services.", error);
  process.exitCode = 1;
}

function handleSignal(): void {
  stop().catch(handleStopError);
}

process.once("SIGINT", handleSignal);
process.once("SIGTERM", handleSignal);
