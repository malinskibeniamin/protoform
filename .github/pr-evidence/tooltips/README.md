# Tooltip appearance restoration

Chromium, 1280×900, hydrated production docs, light and dark themes.
"Before" is the intended pre-lint appearance at a38594a, not the regressed ba10962 state.
"After" is the tooltip-restoration source accompanying these images.

Routes: /docs/server-error-form/ (Display Name help) and /docs/production-readiness/ (String fields status).
Each capture includes the open popup and its trigger. All four pairs were visually reviewed.
Regression checks cover the readiness popup's dark surface/white text and the help button's
circular shape/muted color. Twelve checks pass across Chromium, Firefox, and WebKit.
Keyboard dogfood: focus opens help; Escape dismisses; moving focus away and back reopens it.
