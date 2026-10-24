import { orderReviewRule } from '../../examples/quickjs/order-review';
import { createQuickJsFormRequest } from '../../registry/base-nova/protoform/lib/quickjs/bindings';
import { evaluateQuickJsInWorker } from '../../registry/base-nova/protoform/lib/quickjs/client';
import { createQuickJsController } from '../../registry/base-nova/protoform/lib/quickjs/controller';
import { quickJsFieldConfig } from '../../registry/base-nova/protoform/lib/quickjs/presentation';

const quickJs = {
  createQuickJsController,
  createQuickJsFormRequest,
  evaluateQuickJsInWorker,
  orderReviewRule,
  quickJsFieldConfig,
};

declare global {
  interface Window {
    __protoformQuickJs: typeof quickJs;
  }
}

window.__protoformQuickJs = quickJs;
