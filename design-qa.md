# Booking popup and link arrows QA

## References and scope

User references: PTq2v8 (1640 × 874) shows the booking arrow missing its green hover; wgv0RK (4100 × 2346) shows an on-site Cal.com popup; XXFI6h (2436 × 1352) and EzxwKz (1080 × 712) show the engagement list and desired right-hand external arrows. Originals are under `.context/attachments/`.

The existing booking arrow geometry is reused as a CSS mask so its stroke inherits the same #00E935 as the link on hover and keyboard focus. Active engagement rows have right-aligned arrows; disabled entries remain without link indicators. Cal.com's official embed opens the supplied `cadara/intro` event in a light popup over the page.

## Visual evidence

Chrome captures: `.context/booking-green-arrow.png`, `.context/booking-green-arrow-light.png`, `.context/engagement-arrows-desktop.png`, `.context/engagement-arrows-390.png`, `.context/engagement-arrows-320.png`, `.context/booking-popup-desktop.png`, and `.context/booking-popup-mobile.png`.

`.context/booking-arrow-comparison.png` combines the supplied hover detail and rendered footer. The source is an enlarged detail; this checks the stroke color rather than identical capture density. `.context/booking-popup-comparison.png` compares the full source, normalized to 2050 × 1173 CSS pixels, with a Chrome capture at that viewport. `.context/booking-popup-detail-comparison.png` pairs the popup panels. The supplied example uses a different event; the implementation intentionally displays the real Cadara event's title, duration, description, and availability.

Typography, existing page spacing, images, and copy are preserved. Calendar layout, fonts, close control, backdrop, and responsive behavior come from Cal.com's native embed. The engagement arrows retain the site's icon geometry and muted idle contrast. On 320px screens, compact tag padding and type prevent the added arrow from pushing the list outside its column.

## Findings and verification

The first narrow-screen check found a min-content grid overflow. A minmax(0, 1fr) column and compact badges below 380px resolve it. No actionable P0/P1/P2 findings remain.

Production build and all 16 tests pass. Automated Chrome checks verify green text and arrow in both themes, aligned active engagement arrows, no disabled-entry arrows, the real calendar opening without navigation or a new tab, close button and Escape behavior, focus restoration and keyboard reopening, 390px and 320px layouts without horizontal overflow, and no JavaScript errors. Tests inspect the calendar only and do not book an appointment.

API references: https://cal.com/embed and https://github.com/calcom/cal.com/tree/main/packages/embeds/embed-core.

final result: passed
