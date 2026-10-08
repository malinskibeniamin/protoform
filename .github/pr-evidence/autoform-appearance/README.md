# AutoForm appearance and single-variant oneofs

Before: ed29930. After: accompanying source change.
Each side is a fresh consumer that installed `@protoform/protoform`, `@protoform/protoform-shadcn`,
and `@protoform/protoform-shadcn-host` with `shadcn add` from that commit's `public/r`, styled with
`scripts/fixtures/host-theme.css`. Chromium, 1280×900, device scale factor 1, 760 px form.

| Capture | Schema |
| --- | --- |
| `oneof-required-single` | Required `delivery` oneof with one message variant, unset |
| `oneof-optional-single-off` / `-on` | Optional `delivery` oneof with one message variant, unset and set |
| `oneof-multi-selected` | Optional `delivery` oneof with two message variants, `webhook` selected |
| `appearance-custom` | Profile form with `appearance={{ layout: 'stacked', sections: 'indented', arrayItems: 'separated' }}`; `ed29930` ignores the option |

The same profile form without `appearance` is byte-identical before and after, help icon included,
so its capture is not repeated. All captures were visually reviewed.
