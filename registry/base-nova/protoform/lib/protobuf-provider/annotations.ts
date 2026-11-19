import type { DescMessage } from '@bufbuild/protobuf';

export interface ProtoAnnotations {
  fields?: Record<string, string>;
  messages?: Record<string, string>;
  oneofs?: Record<string, string>;
}

const protoAnnotationsRegistry = new WeakMap<DescMessage, ProtoAnnotations>();

export function registerProtoAnnotations(desc: DescMessage, annotations: ProtoAnnotations) {
  protoAnnotationsRegistry.set(desc, annotations);
  return annotations;
}

export function getRegisteredProtoAnnotations(desc: DescMessage) {
  return protoAnnotationsRegistry.get(desc);
}
