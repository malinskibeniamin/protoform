import type { ClassValue } from 'clsx';
import { cn } from '@/registry/base-nova/protoform/lib/utils';

export function stateClassName<State>(
  classes: ClassValue,
  className: string | ((state: State) => string | undefined) | undefined
) {
  return (state: State) => cn(classes, typeof className === 'function' ? className(state) : className);
}
