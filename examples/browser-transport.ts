import { createRouterTransport, type Transport } from "@connectrpc/connect";
import { createConnectTransport } from "@connectrpc/connect-web";

import { FormExamplesService } from "./gen/protoform/examples/v1/forms_pb.js";
import { formExamplesService } from "./server/service.js";

export function createFormExamplesTransport(baseUrl?: string): Transport {
  if (baseUrl) {
    return createConnectTransport({ baseUrl });
  }

  return createRouterTransport((router) =>
    router.service(FormExamplesService, formExamplesService)
  );
}
