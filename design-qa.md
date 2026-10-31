# Bottom-edge project resize QA

## Visual references

- `.context/attachments/pCSo4A/CleanShot 2026-10-31 at 9.26.41 PM@2x.png` (4112 × 1236 pixels, normalized from 2× density to 2056 × 618 CSS px) identifies the existing bottom divider as the resize edge.
- `.context/attachments/5UljBV/image.png` (1440 × 1000 pixels) supplies the portfolio's outlined grip and drag-tooltip interaction. The implementation follows the requested bottom position and Cadara green hover state.

## Rendered evidence

Chrome desktop viewport: 1440 × 1000, deviceScaleFactor 1. `.context/project-resize-hover.png` shows the hover line and grip; `.context/project-resize-expanded.png` shows cards expanded from 340px to 500px. `.context/project-resize-states.png` combines both states at the same normalized 720px width for full-view comparison. Mobile: `.context/project-resize-mobile.png`, viewport 390 × 844.

Focused comparison: `.context/project-resize-line-comparison.png` combines the normalized source divider band and the rendered hover divider band at the same 2056px CSS width. The reference is a cropped lower-page view; the focused comparison aligns the divider rather than claiming an identical whole-page scroll position.

## Required fidelity surfaces

- Typography: existing card typography is unchanged. Drag tooltip uses the site's Suisse Intl at 12px/16px.
- Layout: only the bottom divider is a resize target. Its small horizontal grip stays centered. Default card heights, widths, gap values, center snapping, and inactive opacity are unchanged. Dragging increases height by the vertical pointer delta; mobile cover images grow with the cards.
- Colors: hover, focus, and active drag use #00E935. The top border keeps its original theme color. The idle divider remains subtle in both themes.
- Images: existing CMS assets are preserved. Responsive image sizes are recalculated for the actual enlarged cover crop so higher-resolution candidates load when necessary.
- Copy: project copy and destinations are unchanged. The tooltip reads “Drag to resize”; the adjustable separator exposes its current height and keyboard instructions to assistive technology.

## Findings and iteration history

The first focus capture inherited the site's generic outline around the entire full-width hit area, creating multiple green horizontal lines. Replaced this with a focus indicator around the small grip, leaving one full-width bottom line. Updated captures verify the correction.

Initial enlargement used source candidates sized for the original cover. Updated responsive sizes to account for the larger crop and rechecked expanded imagery after decoding.

No actionable P0/P1/P2 visual or interaction findings remain.

## Verification

Production build and all 16 tests pass. Chrome checks verify:

- Bottom-line mouse drag grows 340px cards to 500px while width, centering, dimming, gap values, and page scroll remain steady.
- The top border is unchanged; the resize line is green in dark and light themes.
- Keyboard Up/Down and shifted steps, min/max limits, Home/End, and Escape cancellation; accessible range values update correctly.
- Real CDP touch dragging enlarges mobile cards and cover images by the pointer delta, with a 45px hit area and no horizontal carousel movement or page overflow.
- Enlarged covers request larger image candidates; existing carousel drag, spring-back, touch swiping, navigation, hover, and reduced-motion checks continue to pass.
- No JavaScript errors observed.

## Follow-up polish

None required for this change.

final result: passed
