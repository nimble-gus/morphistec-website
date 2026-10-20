# Design System: Private WhatsApp client administration extension

## Overview

Scope: authenticated `/admin/whatsapp-clients` and the invited owner's `/connect/whatsapp/[token]` continuation. This surface record supplements the incumbent `DESIGN.md` and inherits its “Agenda operativa de Oktae” descriptive north star. It does not replace the CRM system, establish a new identity, or regenerate global frontmatter or `.impeccable/design.json`.

The delivered surface uses compact, labeled operational controls and a directory/detail flow. Staff create and configure businesses, test their agents, and activate deliberately. Owners receive only an expiring authorization link; there is no public registration or owner administration account. The direction is recorded in `.impeccable/surfaces/whatsapp-clients.md`.

## Colors

The incumbent indigo marks primary actions, links, selected section text and underline, and the assistant's message attribution. White panels sit on the pale canvas; ink and muted text distinguish content from explanation; thin gray rules separate records, form groups, facts, and messages. These roles inherit the normative root frontmatter.

State badges pair visible names with quiet neutral, green active, sand paused, or lavender testing fills. These local variants are not additional global color tokens. Selected conversations use the incumbent selected lavender. Error and success feedback inherit the CRM's labeled notice treatments.

**The State Has a Name Rule.** Preserve explicit client, authorization, test, and delivery state labels; a tint or connected number alone does not communicate activation.

## Typography

The extension inherits Poppins throughout: semibold page heading (28px), record/empty-state heading (19px), section heading (15px), body and controls (14px), and labels (12px). Supporting form copy uses body size with a more open line-height (1.65); knowledge and preview text preserve multiline content. Directory supporting text, badges, timestamps, and save feedback use (12px). The extension's narrow-screen page heading reduces to (24px) at its first breakpoint. There is no additional display face or decorative eyebrow.

Numbers in the directory and connection/consumption facts use tabular numerals. Conversation bodies preserve line breaks and wrap long strings; instructional paragraphs generally cap at (70–72ch).

## Layout

The client workspace is a centered column capped at (1240px), with desktop insets (32px 36px 64px). The directory has a toolbar and a horizontally scrollable table, keeping dense nowrap cells inside its panel. A record replaces the directory and retains an explicit “Todos los clientes” return action. Four named sections occupy a horizontally scrollable navigation row; selection is indicated by an underline.

Form groups pair an explanatory column (230px) with the fields, using a (32px) gap. Fields form two columns with an (18px) gap; knowledge fields span both columns. Repeated panel headers and content use (24px) insets. Facts are separated rows with labels left and values right. Conversations pair a list (270px) and flexible detail with a (24px) gap.

At widths at or below (800px), outer insets become (24px 18px 40px), form groups stack with a (20px) gap, and conversations become one column with a scrollable list capped at (220px). At or below (520px), headers, fields, save and invitation rows stack; panel side insets become (18px); facts stack with left-aligned values. The four-section row retains contained horizontal scrolling. These behaviors are observed in source; fresh mobile screenshot validation was unavailable.

The owner continuation is a separate reading column capped at (650px), with insets (60px 24px). It presents business name, registered phone, authorization explanation, consent, and one staged action in normal document flow.

## Elevation & Depth

Flat white work surfaces rely on thin borders and tonal contrast; no resting shadow is introduced. The selected section's inset line is a navigation indicator. Buttons inherit background/box-shadow transitions (0.16s ease); the CRM's reduced-motion rule removes transitions. Keyboard focus inherits the lavender outline (3px) and offset (3px). This extension adds no decorative motion.

## Shapes

Directory and record containers retain the incumbent gently curved container corners (10px). Fields and preview replies use the field curve (6px); buttons inherit the control curve (7px); status badges use compact corners (4px). Internal table rows and message separators remain square. These are applications of the existing shape vocabulary, not new global primitives.

## Components

### Directory and record navigation

A search field filters business name, linked number, and responsible staff. Refresh and open actions use outline SVG icons with accessible names. Loading, no-client, and no-match states use explicit text. A record names the business and state above Agente, WhatsApp, Conversaciones, and Consumo; unsaved configuration blocks leaving Agente for another section and prompts before abandoning the record.

### Configuration and internal test

Visible labels group business/service information and agent knowledge. Knowledge textareas resize vertically. Saving produces feedback asking staff to test before activation. A saved agent exposes a separate internal test and a neutral preview reply; preview text retains line breaks. New records keep dependent sections disabled until saved.

**The Current Configuration Rule.** Keep saving, testing, connecting, and activating visibly distinct. Saving configuration invalidates its previous test and pauses the agent. Activation requires the registered number's current connection and a test of the current configuration. Disabled activation retains a visible reason. An owner connection confirmation does not claim an active agent.

### Connection and owner invitation

Connection facts show linked number, authorization state/expiry, and current-version test status. Generating an owner invitation reveals a read-only selectable URL with copy feedback and manual-selection recovery when clipboard access fails. Visible copy states that the invitation expires after 30 minutes and a replacement invalidates the previous link.

The owner page displays only the invited business and registered phone, consent text, and the staged Meta action. Preparing and continuing with Meta require separate clicks. SDK readiness, consent, and busy state disable dependent actions; errors use an alert and completion uses status text. Invalid/unavailable invitations show an explanation and ask the owner to request a new link without creating an account. Connection completion tells the owner that Oktae still needs to review, test, and activate the agent.

### Conversations and consumption

Conversation selection uses a pale fill and visible identity/summary. Message rows name Cliente, Equipo humano, or Agente IA, show timestamp and body, and explicitly label skipped, failed, or uncertain replies. Staff can pause a conversation for human attention and resume for new messages. The interface states that pausing continues message recording and omitted messages are not replayed on activation.

Consumption uses separated factual rows, including sent replies versus quota, reservations/review, internal tests, messages requiring review, and recorded monthly fee. Copy distinguishes UTC monthly usage, received messages, outgoing replies, internal fee records, and provider costs; the interface does not claim automatic billing.

## Do's and Don'ts

- **Do** inherit the incumbent palette, Poppins hierarchy, visible focus, modest corners, and flat bordered panels.
- **Do** preserve named states, disabled-action reasons, loading/error feedback, unsaved-change protection, and copy-failure recovery.
- **Do** keep dense tables and section navigation scrolling inside their containers, with narrow-screen fields and facts stacked.
- **Don't** present owner authorization as registration, admin access, agent activation, or proof that a real external Meta onboarding succeeded.
- **Don't** promote this surface's local measurements or state tints into new global tokens.

Evidence: `src/app/admin/whatsapp-clients/page.tsx`, `clients.tsx`, `clients.css`; `src/app/connect/whatsapp/[token]/page.tsx`, `owner-connect.tsx`; inherited `src/app/admin/admin.css`; `PRODUCT.md` and the surface direction contract. Desktop/owner review captures in the task's `outputs/whatsapp-clients`: `desktop.png`, `directory.png`, `connection.png`, `owner.png`, `usage.png`, `conversations.png`. Finish reviewer disposition: ship, with all three material findings reported resolved. Earlier mobile review accepted the contained-scroll section navigation; no fresh mobile revalidation is claimed. No real external Meta authorization was tested.

Not canonized: temporary QA records, development overlays, local dimensions/tints as global tokens, or simulated/preview connection feedback as evidence of real Meta authorization. No craft-floor violation is promoted into a reusable system rule.
