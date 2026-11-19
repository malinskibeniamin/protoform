import type { DescMessage } from '@bufbuild/protobuf';
import { protoPathToFormPath as mapProtoPathToFormPath } from '@/registry/base-nova/protoform/lib/protobuf-provider/proto-error-path.js';

export function protoPathToFormPath(schema: DescMessage, serverPath: string) {
  const result: string | null = mapProtoPathToFormPath(schema, serverPath);
  return result;
}
