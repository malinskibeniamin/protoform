import type { ReactNode, Ref } from "react";

interface PresetWorkspaceShellProps {
  children: ReactNode;
  fullscreenMode: "fallback" | "native" | "none";
  isFallbackFullscreen: boolean;
  isFullscreen: boolean;
  workspaceRef: Ref<HTMLElement>;
}

const workspaceClassName =
  "group/workspace overflow-hidden rounded-2xl border bg-background shadow-sm data-[fullscreen-mode=fallback]:fixed data-[fullscreen-mode=fallback]:inset-0 data-[fullscreen-mode=fallback]:z-50 data-[fullscreen=true]:h-[100dvh] data-[fullscreen=true]:w-full data-[fullscreen=true]:overflow-y-auto data-[fullscreen=true]:rounded-none data-[fullscreen=true]:border-0 md:data-[fullscreen=true]:grid md:data-[fullscreen=true]:grid-rows-[auto_minmax(0,1fr)_auto] md:data-[fullscreen=true]:overflow-hidden";

export function PresetWorkspaceShell({
  children,
  fullscreenMode,
  isFallbackFullscreen,
  isFullscreen,
  workspaceRef,
}: PresetWorkspaceShellProps) {
  if (isFallbackFullscreen) {
    return (
      <section
        aria-labelledby="preset-workspace-heading"
        aria-modal="true"
        className={workspaceClassName}
        data-fullscreen={isFullscreen}
        data-fullscreen-mode={fullscreenMode}
        data-testid="preset-workspace"
        ref={workspaceRef}
        role="dialog"
      >
        {children}
      </section>
    );
  }

  return (
    <section
      aria-labelledby="preset-workspace-heading"
      className={workspaceClassName}
      data-fullscreen={isFullscreen}
      data-fullscreen-mode={fullscreenMode}
      data-testid="preset-workspace"
      ref={workspaceRef}
    >
      {children}
    </section>
  );
}
