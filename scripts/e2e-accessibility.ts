import { computeAccessibleDescription } from 'dom-accessibility-api';

Reflect.set(window, '__protoformAccessibleDescription', computeAccessibleDescription);
