# Help icon sizing

Before: b75c0af. After: accompanying source change.
Production docs at /docs/server-error-form/, Chromium, 1280×900, device scale factor 1.

The button's icon-xs descendant rule forced the explicitly sized CircleHelp SVG
from 16×16 to 12×12. The default now excludes SVGs with an explicit size utility,
matching Button's existing base sizing contract. Unsized icons remain 12×12,
and the help button remains 24×24.

Both full-form captures were visually reviewed. The current form-after.png in
../shadcn-lint/ is also refreshed, rather than leaving the reported artifact stale.
