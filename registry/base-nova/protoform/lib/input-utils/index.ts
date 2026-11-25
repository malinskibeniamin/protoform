import { type RefObject, useCallback, useEffect, useRef, useState } from 'react';

export interface KeyValueDiffResult {
  created: Record<string, string>;
  removed: string[];
  updated: Record<string, string>;
}

export function findDuplicateIndices<T>(items: T[], getKey: (item: T) => string): Set<number> {
  const seen = new Map<string, number[]>();
  const duplicates = new Set<number>();

  for (const [index, item] of items.entries()) {
    const key = getKey(item);
    if (!key) {
      continue;
    }

    const existing = seen.get(key);
    if (existing) {
      existing.push(index);
      for (const i of existing) {
        duplicates.add(i);
      }
    } else {
      seen.set(key, [index]);
    }
  }

  return duplicates;
}

export function getKeyValueDiff(
  initial: { key: string; value: string }[],
  current: { key: string; value: string }[]
): KeyValueDiffResult {
  const initialMap = new Map<string, string>();
  for (const { key, value } of initial) {
    if (key) {
      initialMap.set(key, value);
    }
  }

  const currentMap = new Map<string, string>();
  for (const { key, value } of current) {
    if (key) {
      currentMap.set(key, value);
    }
  }

  const created: Record<string, string> = {};
  const updated: Record<string, string> = {};
  const removed: string[] = [];

  for (const [key, value] of currentMap) {
    if (!initialMap.has(key)) {
      created[key] = value;
    } else if (initialMap.get(key) !== value) {
      updated[key] = value;
    }
  }

  for (const key of initialMap.keys()) {
    if (!currentMap.has(key)) {
      removed.push(key);
    }
  }

  return { created, removed, updated };
}

export function useInputListFocus(containerRef: RefObject<HTMLElement | null>) {
  const pendingRef = useRef<'add' | { type: 'remove'; index: number } | null>(null);

  const onAdd = useCallback(() => {
    pendingRef.current = 'add';
  }, []);

  const onRemove = useCallback((deletedIndex: number) => {
    pendingRef.current = { index: deletedIndex, type: 'remove' };
  }, []);

  useEffect(() => {
    const event = pendingRef.current;
    if (event === null || containerRef.current === null) {
      return;
    }
    pendingRef.current = null;

    const rows = containerRef.current.querySelectorAll<HTMLElement>('[data-row]');

    if (event === 'add') {
      const lastRow = rows.item(rows.length - 1);
      const input = lastRow?.querySelector<HTMLElement>('input, [role="combobox"]');
      input?.focus();
    } else {
      const targetIndex = Math.min(event.index, rows.length - 1);
      if (targetIndex >= 0) {
        const row = rows[targetIndex];
        const input = row?.querySelector<HTMLElement>('input, [role="combobox"]');
        input?.focus();
      } else {
        const addButton = containerRef.current.querySelector<HTMLElement>('[data-slot="add-button"]');
        addButton?.focus();
      }
    }
  });

  return { onAdd, onRemove };
}

export function useMemoizedArray<T>(items: T[], isEqual: (a: T, b: T) => boolean = Object.is): T[] {
  'use no memo';

  const prevRef = useRef(items);
  const prev = prevRef.current;
  let stableItems = prev;

  if (prev !== items) {
    let changed = prev.length !== items.length;
    const result: T[] = [];

    for (const [i, item] of items.entries()) {
      const previousItem = prev[i];
      if (i < prev.length && previousItem !== undefined && isEqual(previousItem, item)) {
        result.push(previousItem);
      } else {
        result.push(item);
        changed = true;
      }
    }

    stableItems = changed ? result : prev;
  }

  useEffect(
    function commitMemoizedArray() {
      prevRef.current = stableItems;
    },
    [stableItems]
  );
  return stableItems;
}

export function useUndoRemoval(timeout = 5000) {
  const [pending, setPending] = useState<Set<string>>(() => new Set());
  const timersRef = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  const markForRemoval = useCallback(
    (id: string, onConfirm: () => void) => {
      setPending((prev) => new Set([...prev, id]));

      const existing = timersRef.current.get(id);
      if (existing !== undefined) {
        clearTimeout(existing);
      }

      const timer = setTimeout(() => {
        timersRef.current.delete(id);
        setPending((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        onConfirm();
      }, timeout);

      timersRef.current.set(id, timer);
    },
    [timeout]
  );

  const undoRemoval = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer !== undefined) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setPending((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const isPending = useCallback((id: string) => pending.has(id), [pending]);

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      for (const timer of timers.values()) {
        clearTimeout(timer);
      }
    };
  }, []);

  return { isPending, markForRemoval, pending, undoRemoval };
}
