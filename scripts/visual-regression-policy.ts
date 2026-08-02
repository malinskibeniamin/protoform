export function shouldRunVisualRegression(platform: NodeJS.Platform): boolean {
  return platform === "darwin";
}
