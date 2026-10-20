# Bundled shadcn components

The bundle covers all 66 entries in the pinned official Base UI catalog. Compiler contracts check all 388 exports from its 63 primitive modules against independently generated upstream declarations, while allowing Protoform extensions. Styling and existing theme defaults are not byte-identical to shadcn; Radix, React Aria and AI Elements are separate APIs.

Code Block and Trace are included in `@protoform/protoform-shadcn` under `components/ui/code-block` and `components/ui/trace`. They are read-only presentation primitives; the JSON editor continues to use CodeMirror. No trace collection, network request or AI dependency is added.

## Source and license

Adapted from shadcn/ui (MIT), retrieved 2026-10-21 with the installed shadcn CLI 4.22.1:

```sh
bunx --no-install shadcn view code-block trace
```

Upstream repository revision: [ba1503c64472b82256d9de95e2e62c5901a38e8b](https://github.com/shadcn-ui/ui/tree/ba1503c64472b82256d9de95e2e62c5901a38e8b/apps/v4/registry/bases/base/ui). The CLI resolves the base-nova style configured in components.json. Immutable input digests (SHA-256, exact file content returned by the registry):

- code-block.tsx: `226b3c2e6114a8e1adaf5d594276ce0bcc92da80a6c85dfdc20478eccfbf7657`
- trace.tsx: `caf842955e70affef04f8082f54d90e027e1f267d2eb3ba8b69290ed7a6ac924`

The upstream MIT notice is installed alongside this file as shadcn-MIT.txt. Preserve it when copying these components.

## Local adaptations

- Existing Button, Collapsible content, Base UI trigger and cn imports; Lucide icons instead of the registry generator's icon placeholders.
- Named effects, ordinal line identities and repository formatting. Code content uses the existing Base UI Scroll Area dependency with a named scroll region around pre/code; only overflowing viewports enter the keyboard tab order. Explicit horizontal arrow-key scrolling covers WebKit as well as Chromium and Firefox, without intercepting modified keys, nested controls or caller-cancelled events.
- Copy failures are visible and retryable; cancelled clicks do not copy; feedback resets when the source changes; copy defaults to type=button.
- Trace output reuses the existing Collapsible Motion animation rather than layering a second height transition. Trace running state uses Tailwind pulse with reduced-motion support. Shadcn's separate shimmer and scroll-fade utilities are not required or included.
- Code Block supports plain text, numbered/wrapped content, caller-provided React tokens and diff/highlighted lines. The optional upstream Shiki hook is not bundled: no extra highlighter dependency or runtime fetch for plain output.

For updates, retrieve a pinned upstream revision or verify downloaded file bytes against the digests above, review the complete source diff and these adaptations, then run component tests, registry:build, registry:smoke and registry:consumer-smoke. Do not silently refresh from a moving upstream.

## Full Base UI catalog coverage

Coverage is pinned to the same upstream revision above: 63 primitive components plus three composition guides (Typography, Date Picker, Data Table), all 66 entries in the official catalog on 2026-10-21. Typography is served by the existing Protoform typography module; Date Picker and Data Table examples install under components/ui/examples. registry/shadcn-catalog.json records the immutable upstream primitive blob IDs and installed paths. Legacy Sonner, AI Elements, application blocks and Radix/React Aria variants are outside this Base UI catalog scope.

The same imports accept the pinned official component props and exports, with the compatibility details below for overlapping Protoform convenience APIs. Existing theme defaults remain. The 34 additional components use the official base-nova source with local imports, Lucide icons, React Compiler-compatible state, named lifecycle callbacks, native semantic markup, safe default action button types and the existing scoped portal provider. Carousel editing keys remain native; custom chart formatters receive the complete typed tooltip payload. Sidebar cookie persistence uses js-cookie instead of direct document.cookie access. Optional charts and questionnaire/message-scroller runtime dependencies are imported only by their owning modules; examples lazy-load the heavier groups.

New runtime/consumer dependencies: @shadcn/react 0.3.1, @tanstack/react-table 9.3.1 (Data Table guide), embla-carousel-react 8.6.0, input-otp 1.5.0, js-cookie 3.0.8, react-is 19.3.1 (Recharts peer), react-resizable-panels 4.14.8, recharts 3.8.0. @types/js-cookie 3.0.6 is installed for copied TypeScript compilation. They are additional installation/maintenance cost, not a performance improvement. Their package licenses remain in the installed packages; the upstream source-copy MIT notice continues to ship unchanged.

### Catalog adaptation details

- Upstream style-generator markers are replaced with standard Tailwind utilities and local theme tokens. Menubar and submenu compositions inherit Dropdown Menu styling instead of duplicating it. Shapes, tinted bubble colors and motion timings follow Protoform’s existing scales, with reduced-motion support. No new lint exemptions are used.
- Chart colors are scoped CSS custom properties on matching data-chart elements, synchronized before paint without injecting stylesheet markup. Existing caller inline colors take precedence; later caller changes and mounted/retargeted nodes are tracked. Only still-owned properties are removed on configuration changes or unmount. Light/dark colors use light-dark with local color-scheme classes. Formatter payload and zero-label regressions have real-browser tests.
- The external resizable-panels Separator is locally bound as ResizeHandlePrimitive to distinguish it from Protoform’s unrelated Separator design-system component. MultiSelect’s existing conditional primitive is similarly named OptionPrimitive. These are identity-preserving aliases, not design-system exceptions.
- Pagination uses the existing buttonVariants on its native links; it does not rely on an asChild-to-render rewrite that breaks the installed Protoform Button API. Item separators are presentation list children when inside ItemGroup.

### Additional immutable registry input digests

Exact UTF-8 file bytes returned by shadcn view, before the local adaptations above:

| Component        | SHA-256                                                            |
| ---------------- | ------------------------------------------------------------------ |
| accordion        | `ad36d3b4996e7ca212175c5f9e0f5b19f8dc737572a0ca1a685ebd4193ed8351` |
| alert-dialog     | `c84bd1caf46c3e7bb2d2e5b654aa87b2bcdc6bacc2a985cb30d6ccd8dce4e1fe` |
| aspect-ratio     | `6df19df6b983c450361081b695dbf3541a6fe4a9d2ec148766991e4eb0bf6473` |
| attachment       | `a9f6d071c1e70bda93ed42d690e52bc1fecbf27d3afcf05e3096dbdc42f08a24` |
| avatar           | `bff76087ea9af25c6aa5a5306088dc66e62204a126752c38561736acff00717f` |
| breadcrumb       | `ff4288a3629605b172ba5222a51215e16b9b3ada29aafc47ca0fa27963f391b0` |
| bubble           | `cef49b9490c90d90451037247adedb8671eae234d388f8c30c7b2eac37356983` |
| button-group     | `caa93aa4cfa2f60d40f6160e23b2e44a7ea3e4c5938b6dc6e0ed891b4bf0aa06` |
| carousel         | `64df310fc76336a5b1307bb736d5457fa3767393d4c5ff884851ccee568c8b6c` |
| chart            | `1869f68f2eb0108071681c78f3827280fb38212ce7b145139d7ed5d65823ec40` |
| context-menu     | `5be9c316de7e552c1a80e8d3ac8b1a94f9e6692b884632c47a14e9e8e5db0b22` |
| direction        | `661ff5b9c0dc26edde1226bfedc0ab50976d84f8bae42ca83a38dc3b478fd4d4` |
| drawer           | `bf78b90781d6000c16d299f938875767356a250799909f56f0a783b172489f00` |
| dropdown-menu    | `ba92acc16e141ad77880f8c4a27f9854b8024075130df6f04b6b0bf9cfa9d3f2` |
| empty            | `5cac88b6f80f40cf4aa5e4c3d5a6810f43e132a24032d1c55a7aecdae446cf15` |
| hover-card       | `dbac09bf55d501e4f22e52dffe298f009b8cce8f1539902b3104a5c029163d0c` |
| input-otp        | `800f2398fc404a1fa529d7af8c7647e22553205c482a15bc0c26775f145a6465` |
| item             | `53baca07a17899f0746a99c56881be323b6fc2f263491cd0b4b3c9d2bf3acdd0` |
| kbd              | `d17724eb15923ea4f0432cd1cf22538addb14a386f4f9326661efcce7f97e33b` |
| marker           | `6b0a6a0f510ac210bbc71808e2efa9195947db91e9962685e9674f5e802e30ed` |
| menubar          | `6fae0773219629adf30c3ae5e8f68adc3ea8890f1c909f9e60bce5a0831b5a35` |
| message          | `64e9ae0f9d1e268b0ed7b738a53d374d273fe1e7e2dd7b35ad7417e50a9bbe6c` |
| message-scroller | `aacf4a03cb083bf009758e88faaacb4d8e407506a22aa0841dcc83f6f2b47133` |
| native-select    | `17552c2df3b8f5ee44675979c3c29a02f48454e9204f2a02b64f4b7f28bdfc2c` |
| navigation-menu  | `c5a00b4a8247724a86f93ccc6e128954b6dfdc721b000ab3eecce36bfca15f84` |
| pagination       | `704e344b37ef890df419b5c226dca59d00605e59bde705f5e4aa2bdedef3dbcc` |
| progress         | `2c104695a495968e9ee426039e291abc4fb2ff32f36b5faa4e8b450c2a4cc14c` |
| questionnaire    | `a55c087c6f6c0c7669cca4009f155ef90f1434ec4f5c60e5f0b6ffe024d4a219` |
| resizable        | `c45c4e1a32aefb83d60406366e2368b9d8a6e772406f8b964154e7202d6304f7` |
| scroll-area      | `829549f352f1e56dfe887446bcc3d1707c0ced739a9efcb75f0af364cd88c581` |
| sheet            | `7db65922fb40d9a1204527620b7469040259758595ae871bd7274305398c03de` |
| sidebar          | `d08ce0624ed0a9a5ecb35698dadd11fe12ca87dd7dc78e02e7c5d9b7b5485a70` |
| skeleton         | `4c2af7fa9c645358a0fb188779deab6f0b981733b62befc25e18aaebea1350dc` |
| table            | `749b0501e97591f8d7c9ef81366d636e4b47857a15a28e6cf3b87841232e74bf` |
| use-mobile       | `ad0936f84f1df79d3697bfbff9c18f8ad58431c1cbaf2359c6a853b0fcc9f28b` |

## API compatibility and extensions

The source-only registry/shadcn-api-contracts fixtures pin official base-nova input digests and declarations. registry/shadcn-api-contract.test.ts checks 385 callable exports, ChartConfig, CarouselApi and the toast manager during source/test typechecks. The installed-consumer smoke compiles actual installed source and representative compositions. These compiler assertions are distinct from the interaction and browser regressions; they do not claim every possible interaction sequence has been exhaustively tested.

- Button and Badge accept render composition and all official variant names. Button accepts nativeButton, focusableWhenDisabled and Base UI state callbacks. Protoform asChild/as, loading, icons, grouping and extra variants remain. Legacy asChild links retain native link semantics; shadcn render composition follows Base UI semantics. Explicit default size/variant aliases are available without changing Protoform's existing omitted-prop defaults.
- Combobox supports the complete compositional surface, including chips, collection, empty state, trigger/value and useComboboxAnchor. The existing options/onChange convenience API remains; items/children selects the official generic Root API. Select supports typed string, numeric, object and multiple values, rather than rejecting non-strings.
- Base UI change callbacks retain their event details and cancellation. Root native DOM event names are not interpreted as Motion lifecycle/drag callbacks. Existing transition and Motion-only options remain on visual children; use render with a Motion element when the rendered root itself needs Motion-specific callbacks.
- ToggleGroup uses shadcn's array-valued contract when no Protoform discriminator is supplied. Explicit type="single"/"multiple", or a string value/defaultValue, selects the existing convenience contract. Uncontrolled legacy groups that omit both a value and type must specify type="single". Official multiple selection and standalone ToggleGroupItem are supported.
- Slider preserves array-valued callers and infers their callback arrays. Numeric value/defaultValue uses the official numeric callback and a single thumb. For the former numeric-to-array normalization, supply an array value instead.
- CodeBlockContent exposes a native pre element/ref through the Base UI Scroll Area render API, retaining a named keyboard-scrollable viewport. AlertAction, PopoverHeader/Title/Description, tabsListVariants and the line TabsList variant are included. Native input size, Calendar locale, positioner offsets, render/state props and native element refs are preserved. Custom Switch renders retain keyboard operation; controlled Slider thumbs keep their focus across repeated keyboard changes.
- ChartStyle applies scoped custom properties with caller inline precedence, multiple/late/retargeted targets, and ownership-aware cleanup. A bounded data-chart/style observer synchronizes targets and is disconnected on unmount. No caller-provided stylesheet markup is injected or evaluated.

The docs' shadcn-api example demonstrates official composition alongside the existing Protoform convenience APIs. The optional separate Shiki hook, utility packages, application blocks and AI/transport adapters are not part of the 63 primitive-module export contract; Code Block continues to accept caller-provided highlighted React nodes without adding a highlighter dependency.
