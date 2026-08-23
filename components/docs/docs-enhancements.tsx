"use client";

import { Toaster } from "@/registry/base-nova/protoform/components/toast";

import { DiagramMaximizer } from "./diagram-maximizer";
import { ScrollableCodeBlocks } from "./scrollable-code-blocks";

export function DocsEnhancements() {
  return (
    <>
      <DiagramMaximizer />
      <ScrollableCodeBlocks />
      <Toaster />
    </>
  );
}
