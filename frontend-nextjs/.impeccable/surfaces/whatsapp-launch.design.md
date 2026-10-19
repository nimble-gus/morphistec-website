# Design System: WhatsApp launch recovery extension

## Overview

Scope: public `/w/[code]`, an operational continuation utility inheriting the incumbent Oktae system. This surface record supplements `DESIGN.md`; it does not regenerate `.impeccable/design.json`, change global tokens, or redefine the public marketing system. The shipped direction is `.impeccable/surfaces/whatsapp-launch.md`.

## Colors

Pale canvas, ink, muted supporting text, indigo action emphasis, and amber wordmark punctuation reuse the incumbent palette. Thin gray rules separate the recipient and recovery section. A warm notice distinguishes unavailable references without implying successful handoff. Its local color values are not promoted to global tokens.

## Typography

One inherited Poppins family. The semibold heading uses (27–34px) with line-height (1.2); body uses (16px/1.6); recipient number uses (15px) and tabular numerals. Recovery text and controls use (14px), opening guidance (13px), and the footer (12px). There is no added display face or eyebrow.

## Layout

A single centered column, maximum width (440px), sits directly on the canvas with responsive vertical padding and (24px) side padding. At widths at or below (360px), side padding becomes (18px) and the recipient-copy row stacks. The recovery textarea fills its column and wraps its prepared message. The interface uses normal document flow and remains vertically scrollable when recovery opens.

## Elevation & Depth

Flat surface with thin separators and bordered recovery controls; no resting shadow. The primary background transitions over (0.16s ease), disabled by reduced-motion preference. Keyboard focus uses a visible outline (3px) with offset (4px).

## Shapes

Primary and copy controls share modest corners (7px); the selectable textarea uses (6px). The primary anchor has minimum height (54px); recovery buttons, summary, and Web alternative use minimum height (44px).

## Components

### Recipient and native-opening anchor

Brand and fixed recipient (`+502 3117 4640`) remain visible. A labeled indigo anchor opens the native `whatsapp://send` URL. For a valid reference, mobile user-agent detection makes one automatic opening attempt per URL, guarded by a ref; explicit clicking remains available. There is no timed app-store redirect. Clicking updates the visible fallback guidance rather than claiming app success.

### Recovery disclosure

Native details/summary reveals external-browser instructions, copy-number control, a visibly labeled read-only selectable message, copy-message control, copy result status, and a WhatsApp Web anchor. Clipboard rejection gives manual-selection guidance. Lucide outline icons accompany text. The generic message contains the reference only when valid; no prospect identity, prices, or project details are displayed.

### Invalid or unavailable reference

The server checks reference validity and expiry. A warm status notice explains either an unavailable reference or retrieval failure. Both retain explicit direct-contact recovery with a generic message and no automatic launch. The footer states that the user decides when to send.

## Do's and Don'ts

- **Do** preserve the visible recipient, explicit opening anchor, selectable message, copy-failure guidance, and Web alternative.
- **Do** distinguish attempted opening, copied feedback, and actual sending in visible language.
- **Don't** treat a browser screenshot or copy-feedback label as proof of physical iPhone opening or clipboard payload correctness; those remain independently unverified.

Evidence: `src/app/w/[code]/page.tsx`, `open-whatsapp.tsx`, `whatsapp-launch.css`, and `src/lib/crm/sales-protocol.ts`; captures `mobile.png`, `desktop.png`, `mobile-recovery.png`, and `mobile-invalid.png` in the task's `outputs/whatsapp-launch` directory. Finish review disposition: ship; no physical-device verification is implied.

Not canonized: QA development overlays, local utility measurements as global tokens, or any new visual-world prohibition. No craft-floor defect is promoted into a system rule.
