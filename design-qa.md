# Desktop proportional card scaling QA

## Latest divider contrast correction

Reference: `.context/attachments/4ZC2MF/CleanShot 2026-10-31 at 10.04.40 PM@2x.png` (2380 × 1452 pixels). The native bottom border and idle resize overlay were both painting the same translucent stroke, doubling its contrast. The overlay is now transparent at rest and only paints the opaque green hover/focus/drag state.

Chrome at 1440 × 1000 CSS px and deviceScaleFactor 2 verifies integrated rendered pixel contrast of 52 for each of the top, bottom, and side strokes in both themes. This directly confirms one equal-opacity stroke rather than relying on matching CSS color declarations. Green hover and mobile divider removal also pass. Evidence: `.context/divider-contrast-dark.png`, `.context/divider-contrast-light.png`, and `.context/divider-contrast-detail.png`. Production build passes; the rest of the component is unchanged.

## Visual references and evidence

Primary source: `.context/attachments/40jCPz/CleanShot 2026-10-31 at 9.46.08 PM@2x.png`. Source pixels: 934 × 514. The enlarged detail shows the unwanted outer grip stroke and Drag to resize label. The user additionally requires proportional whole-card scaling on desktop and no resize control or divider strokes on mobile.

Rendered Chrome captures use a 1440 × 1000 desktop viewport at deviceScaleFactor 1: `.context/proportional-resize-handle.png`, `.context/proportional-resize-expanded.png`, and `.context/proportional-resize-light.png`. Mobile: `.context/proportional-resize-mobile.png`, viewport 390 × 844. A separate 1024px touch viewport verifies that wide touch devices also have no resize UI or dividers.

Focused comparison: `.context/proportional-resize-handle-comparison.png` combines the source detail, normalized to 468px wide, with a 156 × 87 CSS-pixel implementation crop enlarged 3×. The source's browser zoom is unspecified; this comparison evaluates stroke count and label removal rather than asserting an identical capture density.

Full-card comparison: `.context/proportional-resize-card-comparison.png` combines actual 100% and 150% card crops at the same CSS pixel density (660 × 340 and 990 × 510, rounded only for screenshot crops). This makes the proportional typography, button, image, and layout changes directly visible.

## Required fidelity surfaces

- Typography: the card's original layout is scaled uniformly, preserving line breaks. At 150%, text bounds scale 1.5× in both dimensions; buttons and padding grow by the same ratio.
- Layout: card width and height scale together. The enlarged active card stays centered. Neighbor dimming and row gaps are retained. Scale is clamped to available viewport width, up to 200%, and resets on mobile.
- Colors: one thin 1px grip remains, with no extra focus ring. Hover, focus, and active resizing use #00E935. The drag label is removed from the DOM.
- Images: cover bounds scale by the same factor as the full card, preserving the original crop. Responsive source sizes use the visible transformed dimensions so imagery remains sharp.
- Copy: project content and navigation are unchanged. The accessible separator reports percentage size; no visible drag tooltip or button remains.
- Mobile: normal text and card/image sizes, no desktop transform, no divider strokes, and no visible/focusable resize control. The carousel's existing touch navigation remains available.

## Findings and iteration history

The prior implementation enlarged height alone, displayed a label, and added a heavy focus ring. Replaced height-only sizing with a fixed original card layout inside a scaled wrapper and a correspondingly sized outer carousel item. Removed the label and outer ring, and restricted the interaction to desktop.

The first keyboard check found that accessible percentage values updated one observer frame after the visual size. Updated them synchronously when scale changes; the repeated check passes.

No actionable P0/P1/P2 findings remain.

## Verification

Production build and all 16 tests pass. Chrome verifies exact 1.5× scaling of card, image, text, and button bounds; single grip and no label; green feedback in both themes; percent range values; min/max and keyboard controls; Escape cancellation; viewport clamping; preserved centered selection while resizing later cards; reset across responsive changes; no mobile divider/control, image gaps, or page overflow; and no JavaScript errors. Existing carousel mouse/touch dragging, edge spring-back, hover, gaps, and reduced-motion checks also pass.

## Follow-up polish

None required.

final result: passed
