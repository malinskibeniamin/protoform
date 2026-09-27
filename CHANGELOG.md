# Changelog

All notable Protoform changes are documented here. Protoform uses semantic versioning for tagged
source snapshots.

## 1.0.0 - Unreleased

### Added

- Stable shadcn source registry for protobuf descriptor-driven React forms.
- Protobuf-ES v2, Protovalidate, CEL, Standard Schema, and Google AIP integration.
- React Hook Form and TanStack Form hooks and AutoForm adapters.
- Consumer-owned shadcn-compatible component maps for AutoForm renderers.
- Component data providers (`{ component }`) that render option results through `children`.
- A replaceable `OneofWrapper` UI component; AutoForm supplies the available variants, selection, and variant rendering.
- Formik and Final Form validation adapters.
- Source-copy `protoc-gen-protoform` generator.
- Conformance, accessibility, browser, performance, security, and consumer-installation evidence.
- Complete bookstore RPC example, static documentation site, and source registry.

### Changed

- AutoForm core, its runtime provider, object sections, and string inputs compile under React Compiler without `"use no memo"`.

### Fixed

- Replacing a data provider, or registering one after the first render, no longer breaks React hook order.
- A failing multi-select provider no longer clears or flags saved selections; it disables the control and reports the failure.

### Compatibility

- React 19.2 or later within major version 19.
- Protobuf-ES 2.13 or later within major version 2.
- Protovalidate 1.2 or later within major version 1.
- React Hook Form 7.81 or TanStack Form 1.33, according to the installed adapter.

Release date is set when the verified `v1.0.0` tag is created.
