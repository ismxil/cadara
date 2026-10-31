# Project card and wordmark control QA

Source visual truth: `.context/attachments/a8nXUY/CleanShot 2026-10-31 at 6.58.23 PM@2x.png` (4112 × 1204 pixels). Control color reference: `.context/attachments/qL8Wcw/CleanShot 2026-10-31 at 7.02.25 PM@2x.png`, with the user's explicit replacements #A5C174 and #00E935.

Implementation: `.context/project-cards-desktop.png`, `.context/project-cards-light.png` (661 × 300 pixels), `.context/project-cards-mobile.png` (348 × 584 pixels), and `.context/wordmark-olive-active.png` (1440 × 357 pixels). Chrome viewport: 1440 × 1000 desktop and 390 × 844 mobile, deviceScaleFactor 1. Work view selected; dark and light themes tested.

## Comparison evidence

Full row comparison: `.context/cards-full-comparison.png`. Reference and implementation rows are displayed together at 1024 pixels wide for composition inspection. Their containing page widths differ intentionally: the reference is a wide marketing site, while the implementation retains Cadara's existing compact homepage column.

Focused card comparison: `.context/card-comparison.png`. The reference's first complete card is cropped using the source image's approximately 2× density and normalized to a 622 × 278 region. The implementation's first card is 622 × 300. Both are combined in the same image for comparison. This focused comparison is the size-normalized fidelity check; the full row comparison demonstrates the split structure and next-card preview.

## Required fidelity surfaces

- Typography: retains Cadara's Suisse Intl. Uppercase client label, prominent summary, smaller service text, and compact CTA reproduce the source hierarchy. Real CMS summaries replace the reference's unrelated company copy.
- Spacing/layout: approximately equal text/image halves, small corner radius, consistent internal padding, bottom-aligned action, and next-card preview. The card is slightly taller to accommodate existing summaries. Mobile stacks the text and image without clipping or page overflow.
- Colors: use project brand colors with legible text. Handles and guides are #A5C174; the dragged handle fill and its line use #00E935. These user-specified colors replace the reference blue.
- Images: existing published CMS project images are used, with responsive sources and their intended crop. No fabricated logos, illustrations, or metrics. The source's venue photo is intentionally replaced by each project's existing image.
- Copy: real client names, summaries, and services. View project leads to the existing project viewer. Services replace the reference's numerical metrics because no equivalent published metrics exist.

## Findings and iteration history

No actionable visual P0/P1/P2 findings remain. First browser interaction pass found that focusing the partially visible next card did not consistently scroll it fully into view. Fixed with focus-driven scrolling and left/right arrow navigation. The subsequent Chrome run confirmed scrolling, focus navigation, and opening the intended project; the post-fix visual evidence is listed above.

## Verification

- Production build passes; all 16 tests pass, including escaping, published card navigation, service copy, and coming-soon behavior.
- Chrome: split cards, horizontally scrollable row, keyboard focus navigation, project viewer destination, light/dark themes, stacked mobile layout, no page overflow.
- Wordmark: idle handle fill and curve stroke are #A5C174; dragging makes the selected point #00E935.
- No page JavaScript errors observed.

## Follow-up polish

None required for this change. The source site's background dot decoration and unrelated numerical statistics are outside this card adaptation.

final result: passed
