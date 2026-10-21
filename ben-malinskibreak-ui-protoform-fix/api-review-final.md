# Inline review

Intent: provide the pinned official Base UI catalog and APIs at existing Protoform imports, retaining additive convenience APIs. One PR; no protocol/backend changes.

Reviewed producer -> adapter -> copied consumer seams: official pinned source/digests and declarations; render/state/native-event props; generic Select/Combobox/Slider values; cancelable Base UI details and controlled/uncontrolled state; source-copy imports/dependencies/licenses. Registry output rebuilt by shadcn, not hand-edited. Exact source inputs and canonical signature comparison are archived.

Concrete issues repaired with public RED/GREEN regressions: missing exports, state callbacks, narrowed selection/details, native/motion event collision, native refs, canceled disclosures, mixed checkbox state, controlled slider focus, non-native Switch keyboard behavior, Calendar locale, ChartStyle multi/late targets and caller color precedence, caller button attributes, and mobile AlertAction overlap. Main runner migration preserved, not replaced or weakened.

Policy review also repaired primitive context value ownership, native ToggleGroup button rendering, and Input size resolution without adding manual memoization or waivers. Existing context provider abstraction reused; Collapsible shares a primitive boolean. Native type/button/ref semantics retained.

product: justified — requested by form/component consumers; installed bundle, live examples and consumer compilation expose the capabilities.

lie-detector: truthful — all final gates pass — claims scoped to 63 primitives / 388 exports at the pinned revision, not every future upstream API or byte-identical styling. Compiler assertions prove acceptance, not every interaction. Static trace is presentation, not instrumentation. Optional Shiki, AI Elements, other primitive stacks and app blocks excluded explicitly. No speed claim.

Residual risk: shared source-copy components affect many consumers. ToggleGroup's otherwise-ambiguous uncontrolled legacy API needs an explicit type; numeric Slider follows the official numeric callback rather than the old array normalization. Both migration notes ship in SHADCN_COMPONENTS.md. Independent human endorsement is not claimed. Revert the single commit and rebuild the bundle.

Final chart review found and repaired a public CSS-cascade mismatch: DOM-written variables overrode caller colors. A RED browser test reproduced it. Controlled CSSOM declarations now preserve native inline precedence, late/retargeted nodes and owned-property cleanup; computed colors and theme-valued colors are tested at the public seam, not coupled to inline implementation storage. No caller-provided stylesheet markup is interpolated.

Closure: final443ec16 rebased onto23958c7. All current-head CI/security/mac exhaustive gates pass; fresh TSRS types, invalid-contract RED,138 visuals,10 acceptance and manual media pass. Zero feedback; no remaining concrete diff-introduced defect found. Native readiness is clean; the generic helper reports only the documented nonrequired Scorecard skip. No human endorsement or merge claimed.
