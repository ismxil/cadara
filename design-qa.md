# Project carousel proportion and hover QA

Source visual truth: `.context/attachments/lB0jrm/centered-carousel-desktop.png` (2056 × 1171px). Annotations request card edges aligned to the text column, vertical gaps matching the column side padding, slightly taller cards, and an image hover effect. Colored markup is explanatory and is not part of the interface.

Implementation: `.context/refined-carousel-desktop.png` and `.context/refined-carousel-overview.png` (2056 × 1171px at deviceScaleFactor 1), `.context/refined-carousel-hover.png`, `.context/refined-carousel-light.png`, and `.context/refined-carousel-mobile.png` (390px viewport). Cadana is centered in the desktop captures; the detail capture uses the same 266px page scroll as the prior reference.

## Comparison evidence

`.context/refined-carousel-comparison.png` combines the source and implementation at their matching native pixel dimensions. `.context/refined-carousel-detail.png` combines focused 720px-wide column crops to inspect card alignment and spacing. The source's shorter height and narrower card are intentionally changed according to the annotations.

## Required fidelity surfaces

- Typography: existing client, summary, services, and action hierarchy retained in Suisse Intl. Wider cards reduce wrapping naturally.
- Layout: desktop width is 660.4px, matching the headline/content column. Minimum desktop card height increases from 300px to 340px. Top/bottom padding is 28.8px on desktop and 20px on mobile, matching the column's side padding. Browser measurements verify both card edges match the heading across 320–2056px viewports.
- Colors: active card remains fully opaque; neighbors remain at 0.3 opacity. Existing project colors, theme borders, and hidden scrollbar are preserved.
- Images: active imagery zooms 4% within a clipped image frame on hover and keyboard focus. Reduced motion disables the zoom and transition; touch devices do not receive a sticky hover treatment. Updated responsive sizes match the larger image panels. Mobile images finish flush with the card bottom.
- Content: published project copy, services, order, and destinations are unchanged.

## Findings and iteration history

The prior 622px width and 16px gaps did not match the annotated column. Updated width, height, and theme-independent padding, then verified alignment geometrically and visually. Mobile review exposed a blank strip below shorter cards because implicit grid tracks shared extra height; setting an explicit image row corrected it. Post-fix screenshots and browser checks pass.

No actionable P0/P1/P2 findings remain.

## Verification

Production build and all 16 tests pass. Chrome checks verify column-matched card edges and padding at 320, 390, 540, 721, 1024, 1440, and 2056px; 340px desktop height; hover scale; reduced-motion suppression; mobile image alignment; centered selection and dim neighbors; mouse/touch dragging; elastic edge pulls and spring-back; wheel edge feedback; keyboard navigation; both themes; and no page overflow or JavaScript errors.

## Follow-up polish

None required.

final result: passed
