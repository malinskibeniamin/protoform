# Split compiled manual-form and AutoForm surfaces

Protoform publishes `@protoform/core` without AutoForm, `@protoform/auto-form` as the headless renderer, and `@protoform/react` as the React Hook Form umbrella that depends on both. This keeps manual-only installs small while giving applications that use both form styles one versioned update boundary; a single package with subpath exports was rejected because it would retain the AutoForm dependency in core-only installs.
