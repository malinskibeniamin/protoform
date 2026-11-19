type ScanCommand = 'dev' | 'build' | 'preview' | 'sync';
type InjectClientScript = (stage: 'before-hydration', source: string) => void;

export function configureReactScan(command: ScanCommand, enabled: boolean, injectScript: InjectClientScript) {
  if (command === 'dev' && enabled) {
    injectScript('before-hydration', 'import { scan } from "react-scan"; scan({ enabled: true });');
  }
}
