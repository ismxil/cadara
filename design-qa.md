# Centered project carousel QA

Source visual truth: `.context/attachments/qPooph/CleanShot 2026-10-31 at 7.36.41 PM@2x.png` (4112 × 2342 pixels, normalized to 2056 × 1171 CSS px). The annotation requests center snapping, dim neighbors, elastic movement, and gaps between covers and the row borders. Its red markup is explanatory, not product content.

Implementation: `.context/centered-carousel-desktop.png` (2056 × 1171 px, deviceScaleFactor 1), `.context/centered-carousel-overview.png`, `.context/centered-carousel-light.png`, and `.context/centered-carousel-mobile.png` (390px viewport). Desktop shows Cadana active with both neighboring projects visible; the screenshot is scrolled 266px to match the source's visible page region.

## Comparison evidence

`.context/centered-carousel-comparison.png` places the normalized source beside the rendered implementation at the same viewport. `.context/centered-carousel-row-comparison.png` aligns the source and implementation row crops at 2056px width. The added 16px vertical padding intentionally increases the row's height by 32px. Cadana is centered on the viewport rather than preserving the source screenshot's slightly offset position.

## Required fidelity surfaces

- Typography: existing Suisse Intl project label, summary, services, and action hierarchy retained.
- Layout: the active card snaps to the exact horizontal center; first/last padding permits every card to center. Top and bottom borders each have a 16px clear gap from the covers. Cards remain 622px on desktop and stack content/images on narrow screens.
- Colors: active card is fully opaque; every other card has 0.3 opacity. The scrollbar stays hidden. Brand colors, theme backgrounds, and borders are preserved.
- Images: existing responsive CMS imagery and crops retained; no fabricated or placeholder artwork.
- Copy: published client names, summaries, services, order, and project destinations preserved.

## Findings and iteration history

1. Previous row had start snapping, uniformly bright cards, and borders touching covers. Replaced with center snapping, nearest-card active state, dim neighbors, elastic edge pull, and 16px block padding.
2. First touch check exposed an implicit pointer-capture transfer from the child to the rail. Its bubbling capture-loss event prematurely ended swipes. Restricted capture-loss handling to the rail itself; real CDP touch gestures then passed.
3. Kept pointer-driven focus from repositioning the row at the beginning of a drag, and based elastic bounds on the final card's center target. Post-fix mouse, touch, keyboard, and edge checks pass.

No actionable P0/P1/P2 visual or interaction findings remain.

## Verification

Production build and all 16 tests pass. Chrome checks confirm a single active centered card, dim neighbors, 16px gaps, hidden scrollbar, mouse dragging without accidental project navigation, elastic pulls and spring-back at both ends, horizontal wheel edge feedback, mobile touch swiping, arrow/Home/End navigation, resizing from 320px to 2056px without overflow, both themes, and reduced-motion behavior. Existing project-navigation and wordmark-color checks also pass. No JavaScript errors observed.

## Follow-up polish

None required for this change.

final result: passed
