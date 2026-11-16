import { computeAccessibleDescription } from 'dom-accessibility-api';

Reflect.set(globalThis.window, '__protoformAccessibleDescription', computeAccessibleDescription);
