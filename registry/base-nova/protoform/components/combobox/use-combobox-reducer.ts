import type { ComboboxOption } from ".";
import { resolveLabel } from "./combobox-utils";

// ── State ─────────────────────────────────────────────────────────────
// Readonly at every level — the reducer MUST return a new object.
export type ComboboxState = Readonly<{
  open: boolean;
  inputValue: string;
  highlightedValue: string;
  activeDescendantId: string | undefined;
  userHasTyped: boolean;
}>;

// ── Actions (discriminated union) ─────────────────────────────────────
// Each variant carries only the payload it needs. TypeScript narrows
// the type inside each switch case, so `action.value` is only available
// on variants that declare it.
export type ComboboxAction =
  // Popover lifecycle
  | { readonly type: "OPEN" }
  | { readonly type: "CLOSE" }
  | { readonly type: "ARROW_OPEN" }

  // User input
  | { readonly type: "INPUT_CLICK" }
  | { readonly type: "TYPE"; readonly value: string; readonly firstMatch: string }

  // Selection
  | { readonly type: "SELECT"; readonly label: string }
  | { readonly type: "TOGGLE_OFF" }
  | { readonly type: "CLEAR" }
  | { readonly type: "CREATE_SUBMIT"; readonly inputValue: string }

  // Keyboard navigation
  | { readonly type: "NAVIGATE"; readonly nextHighlight: string }

  // Enter key variants (each has distinct state transition)
  | { readonly type: "ENTER_REVERT"; readonly controlledLabel: string }
  | { readonly type: "ENTER_CLEAR" }

  // Escape
  | { readonly type: "ESCAPE_CLEAR" }

  // Blur
  | { readonly type: "BLUR_CLEAR" }
  | { readonly type: "BLUR_REVERT"; readonly controlledLabel: string }

  // External sync
  | { readonly type: "SYNC_CONTROLLED"; readonly controlledLabel: string }

  // cmdk bridge
  | { readonly type: "SET_ACTIVE_DESCENDANT"; readonly id: string | undefined };

// ── Exhaustive check helper ───────────────────────────────────────────
// If a new action variant is added to the union but not handled in the
// switch, TypeScript will error: "Argument of type '...' is not
// assignable to parameter of type 'never'."
const assertNever = (action: never): never => {
  throw new Error(`Unhandled combobox action: ${(action as ComboboxAction).type}`);
};

// ── Reducer (pure function — no React imports, no side effects) ───────
export const comboboxReducer = (state: ComboboxState, action: ComboboxAction): ComboboxState => {
  switch (action.type) {
    case "OPEN":
      return { ...state, highlightedValue: "", open: true, userHasTyped: false };
    case "CLOSE":
      return { ...state, activeDescendantId: undefined, highlightedValue: "", open: false };
    case "ARROW_OPEN":
      return { ...state, open: true };
    case "INPUT_CLICK":
      return { ...state, inputValue: "", open: true, userHasTyped: false };
    case "TYPE":
      return {
        ...state,
        highlightedValue: action.firstMatch,
        inputValue: action.value,
        open: true,
        userHasTyped: true,
      };
    case "SELECT":
      return { ...state, inputValue: action.label, open: false };
    case "TOGGLE_OFF":
      return { ...state, inputValue: "", open: false };
    case "CLEAR":
      return { ...state, inputValue: "" };
    case "CREATE_SUBMIT":
      return { ...state, inputValue: action.inputValue, open: false };
    case "NAVIGATE":
      return { ...state, highlightedValue: action.nextHighlight };
    case "ENTER_REVERT":
      return { ...state, inputValue: action.controlledLabel, open: false };
    case "ENTER_CLEAR":
      return { ...state, inputValue: "", open: false };
    case "ESCAPE_CLEAR":
      return { ...state, inputValue: "" };
    case "BLUR_CLEAR":
      return { ...state, inputValue: "", userHasTyped: false };
    case "BLUR_REVERT":
      return { ...state, inputValue: action.controlledLabel, userHasTyped: false };
    case "SYNC_CONTROLLED":
      if (state.inputValue === action.controlledLabel) {
        return state;
      }
      return { ...state, inputValue: action.controlledLabel };
    case "SET_ACTIVE_DESCENDANT":
      return { ...state, activeDescendantId: action.id };
    default:
      return assertNever(action);
  }
};

// ── Initial state factory ─────────────────────────────────────────────
export const createInitialState = (
  options: readonly ComboboxOption[],
  controlledValue: string,
  defaultOpen: boolean
): ComboboxState => ({
  activeDescendantId: undefined,
  highlightedValue: "",
  inputValue: resolveLabel(options, controlledValue),
  open: defaultOpen,
  userHasTyped: false,
});
