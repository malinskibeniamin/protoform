import type { ComboboxOption } from '.';
import { resolveLabel } from './combobox-utils';

export type ComboboxState = Readonly<{
  open: boolean;
  inputValue: string;
  highlightedValue: string;
  activeDescendantId: string | undefined;
  userHasTyped: boolean;
}>;

export type ComboboxAction =
  | { readonly type: 'OPEN' }
  | { readonly type: 'CLOSE' }
  | { readonly type: 'ARROW_OPEN' }
  | { readonly type: 'INPUT_CLICK' }
  | { readonly type: 'TYPE'; readonly value: string; readonly firstMatch: string }
  | { readonly type: 'SELECT'; readonly label: string }
  | { readonly type: 'TOGGLE_OFF' }
  | { readonly type: 'CLEAR' }
  | { readonly type: 'CREATE_SUBMIT'; readonly inputValue: string }
  | { readonly type: 'NAVIGATE'; readonly nextHighlight: string }
  | { readonly type: 'ENTER_REVERT'; readonly controlledLabel: string }
  | { readonly type: 'ENTER_CLEAR' }
  | { readonly type: 'ESCAPE_CLEAR' }
  | { readonly type: 'BLUR_CLEAR' }
  | { readonly type: 'BLUR_REVERT'; readonly controlledLabel: string }
  | { readonly type: 'SYNC_CONTROLLED'; readonly controlledLabel: string }
  | { readonly type: 'SET_ACTIVE_DESCENDANT'; readonly id: string | undefined };

const assertNever = (action: never): never => {
  throw new Error(`Unhandled combobox action: ${(action as ComboboxAction).type}`);
};

export const comboboxReducer = (state: ComboboxState, action: ComboboxAction): ComboboxState => {
  switch (action.type) {
    case 'OPEN':
      return { ...state, highlightedValue: '', open: true, userHasTyped: false };
    case 'CLOSE':
      return { ...state, activeDescendantId: undefined, highlightedValue: '', open: false };
    case 'ARROW_OPEN':
      return { ...state, open: true };
    case 'INPUT_CLICK':
      return { ...state, inputValue: '', open: true, userHasTyped: false };
    case 'TYPE':
      return {
        ...state,
        highlightedValue: action.firstMatch,
        inputValue: action.value,
        open: true,
        userHasTyped: true,
      };
    case 'SELECT':
      return { ...state, inputValue: action.label, open: false };
    case 'TOGGLE_OFF':
      return { ...state, inputValue: '', open: false };
    case 'CLEAR':
      return { ...state, inputValue: '' };
    case 'CREATE_SUBMIT':
      return { ...state, inputValue: action.inputValue, open: false };
    case 'NAVIGATE':
      return { ...state, highlightedValue: action.nextHighlight };
    case 'ENTER_REVERT':
      return { ...state, inputValue: action.controlledLabel, open: false };
    case 'ENTER_CLEAR':
      return { ...state, inputValue: '', open: false };
    case 'ESCAPE_CLEAR':
      return { ...state, inputValue: '' };
    case 'BLUR_CLEAR':
      return { ...state, inputValue: '', userHasTyped: false };
    case 'BLUR_REVERT':
      return { ...state, inputValue: action.controlledLabel, userHasTyped: false };
    case 'SYNC_CONTROLLED':
      if (state.inputValue === action.controlledLabel) {
        return state;
      }
      return { ...state, inputValue: action.controlledLabel };
    case 'SET_ACTIVE_DESCENDANT':
      return { ...state, activeDescendantId: action.id };
    default:
      return assertNever(action);
  }
};

export const createInitialState = (
  options: readonly ComboboxOption[],
  controlledValue: string,
  defaultOpen: boolean
): ComboboxState => ({
  activeDescendantId: undefined,
  highlightedValue: '',
  inputValue: resolveLabel(options, controlledValue),
  open: defaultOpen,
  userHasTyped: false,
});
