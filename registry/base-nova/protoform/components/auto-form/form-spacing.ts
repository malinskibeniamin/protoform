export const formSpacing = {
  arrayItemSeparator: 'pt-4 border-t border-border/60',
  collectionRow: 'space-y-4',
  field: 'space-y-6',
  form: 'space-y-8',
  labelStack: 'space-y-2',
  oneofStack: 'space-y-4',
  sectionDivider: 'pb-4 border-b border-border/60',
  sectionHeader: 'space-y-1',
} as const;

export type FormSpacingToken = keyof typeof formSpacing;
