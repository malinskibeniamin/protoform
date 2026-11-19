import type { AutoFormMode } from '../types';

export function normalizeModes(modes: AutoFormMode[] | undefined) {
  const resolved = (modes && modes.length > 0 ? modes : ['advanced']).filter(
    (mode): mode is AutoFormMode => mode === 'simple' || mode === 'advanced' || mode === 'json'
  );
  const availableModes: AutoFormMode[] = resolved.length > 0 ? [...new Set(resolved)] : ['advanced'];
  return availableModes;
}

export function resolveInitialMode(availableModes: AutoFormMode[], defaultMode?: AutoFormMode) {
  if (defaultMode && availableModes.includes(defaultMode)) {
    return defaultMode;
  }

  if (availableModes.includes('advanced')) {
    return 'advanced';
  }

  return availableModes[0] ?? 'advanced';
}
