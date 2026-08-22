"use client";

import { createRouterTransport, type Transport } from "@connectrpc/connect";
import { TransportProvider } from "@connectrpc/connect-query";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

import { LibraryService } from "@/registry/base-nova/protoform/demo/runtime/gen/protoform/conformance/v1/aip_pb";

import { BookstoreWorkspace } from "./bookstore-workspace";
import { createLibraryService } from "./library-service";

export const client = "only";

interface BookstoreDemoProps {
  transport?: Transport;
  visitorId?: string;
}

const VISITOR_KEY = "protoform-bookstore-visitor";

function newVisitorId(): string {
  return `demo-${globalThis.crypto.randomUUID().toLowerCase()}`;
}

function initialVisitorId(provided?: string): string {
  if (provided) {
    return provided;
  }
  if (typeof sessionStorage === "undefined") {
    return newVisitorId();
  }
  const stored = sessionStorage.getItem(VISITOR_KEY);
  if (stored) {
    return stored;
  }
  const created = newVisitorId();
  sessionStorage.setItem(VISITOR_KEY, created);
  return created;
}

export function BookstoreDemo({ transport: providedTransport, visitorId: providedVisitorId }: BookstoreDemoProps) {
  const [queryClient] = useState(() => new QueryClient());
  const [transport] = useState(
    () => providedTransport ?? createRouterTransport((router) => router.service(LibraryService, createLibraryService()))
  );
  const [visitorId, setVisitorId] = useState(() => initialVisitorId(providedVisitorId));

  function resetLibrary() {
    const next = newVisitorId();
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.setItem(VISITOR_KEY, next);
    }
    queryClient.clear();
    setVisitorId(next);
  }

  return (
    <TransportProvider transport={transport}>
      <QueryClientProvider client={queryClient}>
        <BookstoreWorkspace onReset={resetLibrary} parent={`publishers/${visitorId}`} />
      </QueryClientProvider>
    </TransportProvider>
  );
}

export default BookstoreDemo;
