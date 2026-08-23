"use client";

import { TransportProvider } from "@connectrpc/connect-query";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { createFormExamplesTransport } from "../browser-transport.js";
import { ServerErrorFormMutation } from "./server-error-form-mutation.js";

export const client = "only";

export default function ServerErrorFormExample({ baseUrl }: { baseUrl?: string }) {
  const [queryClient] = React.useState(() => new QueryClient());
  const [transport] = React.useState(() => createFormExamplesTransport(baseUrl));

  return (
    <TransportProvider transport={transport}>
      <QueryClientProvider client={queryClient}>
        <ServerErrorFormMutation />
      </QueryClientProvider>
    </TransportProvider>
  );
}
