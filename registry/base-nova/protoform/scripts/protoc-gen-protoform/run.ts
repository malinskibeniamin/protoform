// Executable entry point: reads a CodeGeneratorRequest from stdin and
// writes a CodeGeneratorResponse to stdout. Used by the bin wrapper and
// by repo-internal buf templates running the plugin from source via bun.
import { runNodeJs } from "@bufbuild/protoplugin";
import { protocGenProtoform } from "./plugin.js";

runNodeJs(protocGenProtoform);
