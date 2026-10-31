# Full-width project row QA

Source visual truth: `.context/attachments/z2ZdRM/CleanShot 2026-10-31 at 7.13.07 PM@2x.png` (4112 × 2336 px, normalized to 2056 × 1168 CSS px). Scrollbar-removal reference: `.context/attachments/FnVaHm/CleanShot 2026-10-31 at 7.16.39 PM@2x.png`. Live inspiration: https://www.mintlify.com/?utm_source=tailwindcss, captured in Chrome as `.context/mintlify-reference.png`.

Implementation: `.context/wide-project-layout.png` and `.context/wide-project-light.png` at 2056 × 1168 px, deviceScaleFactor 1; `.context/wide-project-mobile.png` at a 390px viewport. Work view, dark and light themes.

## Comparison evidence

`.context/wide-project-comparison.png` places the normalized user mockup beside the implementation at the same viewport size. `.context/wide-row-comparison.png` combines the reference row and implementation row at the same 2056px width, aligning the component rather than the capture's 7px vertical offset.

The row now extends across the viewport rather than being clipped by the 720px content column. Its first card begins 40px after the headline's left edge, matching the supplied mockup. Subsequent cards continue to the viewport edge; top and bottom borders span the row. The source mockup's grey placeholder neighbors are intentionally replaced by the real published project cards, and the existing project order is preserved.

## Required fidelity surfaces

- Typography: existing split-card label, summary, services, and action hierarchy retained in Suisse Intl.
- Spacing/layout: 622px desktop cards, 12px gaps, full-width strip, small corner radius, matched left inset, and stacked mobile cards. No page-level horizontal overflow at 320, 390, 540, 721, 1024, 1440, or 2056px.
- Colors/tokens: existing brand-colored cards and theme-aware background/borders retained. Both scrollbar-width and the WebKit scrollbar pseudo-element hide the scrollbar in Chrome.
- Images: existing responsive CMS project imagery retained without fabricated or placeholder artwork.
- Content: existing published client copy, services, destinations, and order retained. The mockup shows Gomoney as an example; the first published project remains Lemfi.

## Findings and iteration history

The previous implementation was confined to the centered column and exposed a horizontal scrollbar: fixed with a viewport-width section, hidden-scrollbar styles, and an independent card width.

Initial expanded-row capture used headline-aligned padding. Compared with the user's mockup, the intended first-card inset was 40px farther right. Updated the desktop inset and kept a 21px inset on narrow screens. Post-fix evidence is recorded above; no actionable P0/P1/P2 findings remain.

## Verification

Production build and all 16 tests pass. Chrome checks verify full-width geometry, intended desktop inset, hidden scrollbar via standard and WebKit CSS rules, keyboard navigation, preserved project navigation, both themes, mobile stacking, and absence of page overflow. Existing card/control checks also pass. No JavaScript errors observed.

## Follow-up polish

None required. Mintlify's unrelated site decoration and customer metrics remain outside this adaptation.

final result: passed
