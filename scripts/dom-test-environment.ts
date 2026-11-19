export const happyDom = {
  name: 'happy-dom',
  options: { settings: { disableCSSFileLoading: true, disableIframePageLoading: true } },
} as const;

const exampleNetworkTests = [
  'examples/basic/basic-form.test.tsx',
  'examples/complex/complex-form.test.tsx',
  'examples/tanstack/tanstack-form.test.tsx',
  'examples/form-libraries/formik-form.test.tsx',
  'examples/form-libraries/final-form.test.tsx',
];

const animatedDomTests = [
  'examples/kitchen-sink/kitchen-sink-form.test.tsx',
  'examples/presets/preset-lab.test.tsx',
  'registry/base-nova/protoform/components/auto-form/field-wrapper.test.tsx',
  'registry/base-nova/protoform/components/auto-form/index.accessible-errors.test.tsx',
  'registry/base-nova/protoform/components/auto-form/index.root-header.test.tsx',
  'registry/base-nova/protoform/components/auto-form/index.test.tsx',
];

export const jsdomIntegrationTests = [
  ...exampleNetworkTests,
  ...animatedDomTests,
  'registry/base-nova/protoform/components/auto-form/index.submission.test.tsx',
  'registry/base-nova/protoform/hooks/use-proto-form/index.form-component.test.tsx',
];
