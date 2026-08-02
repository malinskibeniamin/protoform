export interface ProxyTarget {
  pathname: string;
  port: number;
}

export interface PublicProxyHeaders {
  forwardedHost: string;
  forwardedProto: "http" | "https";
}

export type PublicProxyHeaderResolver = (
  incomingHost: string
) => PublicProxyHeaders;

export function createPublicProxyHeaderResolver(
  publicOrigin: string | undefined
): PublicProxyHeaderResolver {
  const configuredHeaders = publicOrigin
    ? resolvePublicProxyHeaders(publicOrigin, "")
    : undefined;

  return (incomingHost) =>
    configuredHeaders ?? resolvePublicProxyHeaders(undefined, incomingHost);
}

export function resolvePublicProxyHeaders(
  publicOrigin: string | undefined,
  incomingHost: string
): PublicProxyHeaders {
  if (!publicOrigin) {
    return { forwardedHost: incomingHost, forwardedProto: "http" };
  }

  let origin: URL;
  try {
    origin = new URL(publicOrigin);
  } catch (error) {
    throw new Error("PUBLIC_ORIGIN must be a valid absolute URL.", {
      cause: error,
    });
  }
  if (origin.protocol !== "http:" && origin.protocol !== "https:") {
    throw new Error("PUBLIC_ORIGIN must use http or https.");
  }
  if (
    origin.username ||
    origin.password ||
    origin.pathname !== "/" ||
    origin.search ||
    origin.hash
  ) {
    throw new Error("PUBLIC_ORIGIN must contain only scheme, host, and port.");
  }

  return {
    forwardedHost: origin.host,
    forwardedProto: origin.protocol === "https:" ? "https" : "http",
  };
}

export function resolveProxyTarget(
  url: string,
  docsPort = 55_111,
  apiPort = 55_112
): ProxyTarget {
  if (url === "/api" || url.startsWith("/api/") || url.startsWith("/api?")) {
    const pathname = url.slice(4);
    return {
      pathname: pathname.startsWith("/") ? pathname : `/${pathname}`,
      port: apiPort,
    };
  }
  return { pathname: url, port: docsPort };
}
