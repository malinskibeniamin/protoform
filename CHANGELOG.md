# Changelog

All notable Protoform changes are documented here. Protoform uses semantic versioning for tagged
source snapshots.

## 1.0.0 - Unreleased

### Added

- Fail-closed dependency audit and installed-consumer browser checks in CI and release gates.
- Real AutoForm browser budgets for 50, 200, and 500 controls, including typing, submit validation, and step transitions.

- Stable shadcn source registry for protobuf descriptor-driven React forms.
- Protobuf-ES v2, Protovalidate, CEL, Standard Schema, and Google AIP integration.
- React Hook Form and TanStack Form hooks and AutoForm adapters.
- Consumer-owned shadcn-compatible component maps for AutoForm renderers.
- Component data providers (`{ component }`) that render option results through `children`.
- Data provider results can supply an `emptyState` that select and multi-select dropdowns show when there are no options.
- A replaceable `OneofWrapper` UI component; AutoForm supplies the available variants, selection, and variant rendering.
- Formik and Final Form validation adapters.
- Source-copy `protoc-gen-protoform` generator.
- Conformance, accessibility, browser, performance, security, and consumer-installation evidence.
- Complete bookstore RPC example, static documentation site, and source registry.

### Changed

- AutoForm core, its runtime provider, object sections, and string inputs compile under React Compiler without `"use no memo"`.
- The bookstore demo shows field errors with React Hook Form's built-in `ErrorMessage` bound to `control`, so it no longer installs `@hookform/error-message`.
- The experimental React Hook Form v8 items install `8.0.0-beta.4`.
- Installed source uses single quotes, ES5 trailing commas, and 120-column lines, and carries no comments or license headers.

### Fixed

- Nested, repeated, map-value, and active-oneof conversion validation rejects duplicate map keys and overflowing integers before coercion.
- React Hook Form v7/v8 native defaults and async defaults normalize well-known types; reset adopts the new message’s unknown fields.
- Timestamp defaults retain seconds and nanoseconds on untouched round trips.
- Providers receive a fresh cancellation signal after StrictMode effect replay.
- Provider-backed multi-selects accumulate pages and forward search; partial or filtered results no longer clear unconfirmed selections.
- React Hook Form preserves same-field validation messages; select and multi-select controls announce linked errors.
- Quality and release workflows explicitly install Go and every browser they exercise.
- Installation documentation links to an existing preview commit, not an unpublished release tag.

- Replacing a data provider, or registering one after the first render, no longer breaks React hook order.
- A failing multi-select provider no longer clears or flags saved selections; it disables the control and reports the failure.
- Server field violations on repeated-field items (`items[0].name` or `items.0.name`) map to the item field instead of falling back to a form-level error.
- The provider-backed select puts its control test id on the input (`inputTestId`), like the combobox field, so it exists before the dropdown opens.
- `formComponents` also accepts a string-keyed component map, so wrappers can merge their own defaults with caller overrides without casting.
- The license item installs only Protoform's MIT license (`LICENSES/protoform-MIT.txt`). It no longer copies third-party license texts or the repository's `THIRD_PARTY_NOTICES.md` into the app.
- A submit from outside the form (a `form` attribute button or `requestSubmit()`) while a submission is running is ignored instead of calling `onSubmit` again and hiding the first submission's error.
- The default oneof variant select registers with the form engine, so an error on the oneof moves focus to it and marks it `aria-invalid`.
- The `protoform` install uses the consumer's `utils` alias for `cn` instead of shipping its own `lib/utils` and `lib/input-utils`, and no longer adds `clsx`, `tailwind-merge`, or `zod`.

### Compatibility

- React 19.2 or later within major version 19.
- Protobuf-ES 2.13 or later within major version 2.
- Protovalidate 1.2 or later within major version 1.
- React Hook Form 7.81 or TanStack Form 1.33, according to the installed adapter. The bookstore demo needs React Hook Form 7.88 or later.

Release date is set when the verified `v1.0.0` tag is created.
