---
name: Oktae CRM privado
description: Sistema operativo de prospectos, seguimiento y cobros del área /admin.
colors:
  primary: "#4655be"
  primary-hover: "#35449d"
  canvas: "#f5f6f9"
  surface: "#ffffff"
  carbon: "#252830"
  ink: "#242832"
  muted: "#5e6574"
  line: "#dce0e8"
  control-line: "#cbd0db"
  focus: "#9aa8ed"
  selected: "#edf0fc"
  nav-active: "#414a74"
  positive-bg: "#e1f1e8"
  positive-ink: "#24613b"
  attention-bg: "#fce9e5"
  attention-ink: "#8c3f31"
  stage-bg: "#e9edff"
  stage-ink: "#3849a5"
typography:
  headline:
    fontFamily: "Poppins, ui-sans-serif, system-ui, sans-serif"
    fontSize: "28px"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Poppins, ui-sans-serif, system-ui, sans-serif"
    fontSize: "19px"
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: "Poppins, ui-sans-serif, system-ui, sans-serif"
    fontSize: "14px"
    lineHeight: 1.5
  label:
    fontFamily: "Poppins, ui-sans-serif, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: 1.5
rounded:
  status: "4px"
  field: "6px"
  button: "7px"
  container: "10px"
spacing:
  inline: "8px"
  compact: "12px"
  inset: "18px"
  panel: "24px"
  desktop-gutter: "36px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    rounded: "{rounded.button}"
    padding: "9px 13px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.button}"
    padding: "9px 13px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    padding: "9px 11px"
  panel:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.container}"
    padding: "24px"
  stage-positive:
    backgroundColor: "{colors.positive-bg}"
    textColor: "{colors.positive-ink}"
    rounded: "{rounded.status}"
    padding: "4px 7px"
  navigation-active:
    backgroundColor: "{colors.nav-active}"
    textColor: "{colors.surface}"
    rounded: "{rounded.button}"
    padding: "12px"
---

# Design System: Oktae CRM privado

## Overview

**Creative North Star: "Agenda operativa de Oktae"**

This is a descriptive name for the built /admin interface, not evidence of an approved concept exercise. The private workspace inherits Poppins, charcoal framing, indigo actions, and the amber punctuation of the Oktae wordmark. White working surfaces and a pale canvas support sustained reading and editing.

The system is compact, restrained, and explicit: contacts use rows, details use a bordered panel, and labels describe the action or state in Spanish. This document records only the private CRM; the public site's darker, pill-shaped components remain a separate incumbent system.

**Key Characteristics:**
- Charcoal navigation surrounding a light workspace.
- Indigo actions and selection, with text-bearing semantic status badges.
- Flat bordered containers and modestly rounded controls.
- One Poppins family with a compact hierarchy.

## Colors

Indigo provides action emphasis against cool neutrals; semantic colors distinguish commercial and payment states.

### Primary
- **Operational Indigo:** primary actions, links, caret, and login icon; the darker variant signals hover.

### Neutral
- **Charcoal:** sidebar and login introduction.
- **Pale Canvas / White Surface:** workspace versus editable containers.
- **Ink / Muted:** main content versus supporting information.
- **Divider / Control Line:** panels and rows versus field boundaries.
- **Focus Lavender:** keyboard focus outlines.
- **Selected Lavender / Navigation Slate:** selected contact and active navigation backgrounds.

Green signals a client or paid state; terracotta signals discarded, failed, or review states; blue-lavender signals demonstration and proposal. Labels accompany these colors. Amber is punctuation in the brand mark; the muted sand configuration notice is explanatory rather than a primary action.

**The State Has a Name Rule.** Preserve visible status text alongside its color, especially when distinguishing a generated link from a paid transaction.

## Typography

**Body and heading font:** Poppins, with the inherited sans-serif fallbacks. The CRM does not use the public site's serif or mono roles.

### Hierarchy
- **Headline:** the frontmatter headline role; mobile page headings reduce to (25px).
- **Title:** the frontmatter title role for contact and section titles.
- **Section heading:** semibold (15px) for detail subsections.
- **Body:** the frontmatter body role for workspace content.
- **Label:** the frontmatter label role for fields; navigation and contact names use (13px), while supporting copy commonly uses (11–12px).
- **Status:** compact (10px), with stage badges reducing to (9px) on mobile. This is a current density limitation, not a target for new long-form content.

The login introduction is a separate context: medium (38px), reducing to (30px) and (26px) at the two responsive thresholds. The login form title uses (25px). No display face is introduced.

## Layout

The desktop shell uses a charcoal sidebar (218px) and a flexible workspace. A white top bar (64px) separates navigation context from content. The content container is centered, capped at (1550px), with padding (32px 36px 60px).

With a selected contact, the workspace pairs a flexible list, minimum (280px), with a detail panel ranging from (330px) to (410px), separated by (24px). Without a selection, the list occupies the workspace. Filters wrap; the stage selector retains (190px) on desktop.

At widths at or below (1100px), the sidebar becomes (180px), content side padding becomes (22px), and an open detail replaces the list. At or below (650px), the sidebar becomes a wrapping header with horizontal navigation, content side padding becomes (16px), filters and forms stack, and the explicit back action restores the contact list. Login switches from two columns to a vertical flow.

Use the recurring spacing steps in frontmatter for compact groups and panel insets. Keep long names, email addresses, and notes wrapping inside their containers.

**The Selection Keeps Context Rule.** Keep list and detail side by side when space supports both; in the single-panel layout, retain the explicit return to prospects.

## Elevation & Depth

The CRM is flat. White surfaces sit on the pale canvas through thin borders and tonal contrast, without resting shadows. Selected rows use a tinted fill; navigation uses a stronger tonal fill. Buttons transition background and box-shadow over (0.16s ease), although no shadow value is currently assigned. Reduced-motion mode disables transitions.

**The Bordered Workspace Rule.** Use the established surface, divider, and selection treatments to express grouping and state.

## Shapes

Containers use gently curved corners; controls use smaller curves and status badges are nearly rectangular. Rows inside the list have square edges and horizontal separators. Initial avatars are circular (36px). The public site's pill buttons are not the CRM's control shape.

## Components

### Buttons
Restrained, legible actions. Primary buttons use indigo with white text; secondary buttons use white, a gray border, and ink. Both use the button radius and inset from frontmatter. Secondary hover fills with a pale cool neutral. Keyboard focus is a lavender outline (3px) with offset (3px). Disabled buttons have opacity (0.6) and a waiting cursor.

### Chips
Stage and payment badges use compact text, status radius, and short padding. Blue, green, and terracotta variants retain explicit state names. They communicate state rather than acting as selectable filters.

### Cards / Containers
Lists, details, new-contact forms, payments, and settings share white fill, a thin divider border, and the container radius. Detail and standard form panels use the panel inset. The list clips its rows within the same outer silhouette.

### Inputs / Fields
White controls with a thin control-line border, field radius, minimum height (41px), and the input inset. Visible labels sit above fields with a (6px) gap. Textareas allow vertical resizing with minimum height (90px). Focus follows the common keyboard treatment; search also outlines its wrapper on focus within.

### Navigation
The sidebar uses labeled Lucide outline icons, quiet text, and an indigo-slate active fill. Controls align left on desktop and center in the mobile navigation row. Account information occupies the sidebar bottom on desktop; mobile retains sign-out while hiding secondary account information.

### Contact rows and follow-up detail
A circular initial, name, secondary contact information, optional follow-up date, and stage label form a selectable row. The selected fill links the row to its detail panel. Detail sections are separated by top borders; notes preserve line breaks, and their dates sit underneath. Monetary values use tabular numerals.

## Do's and Don'ts

### Do:
- **Do** use charcoal framing, light working surfaces, and indigo action emphasis within the CRM.
- **Do** preserve visible labels, keyboard focus, and explicit status names.
- **Do** keep detail return navigation available when the list is hidden.
- **Do** keep configuration and payment state messages precise in Spanish.

### Don't:
- **Don't** communicate payment confirmation through color alone.
- **Don't** treat a generated checkout link as a received payment.
- **Don't** inherit the public site's pill controls or serif display treatment into this recorded CRM without a deliberate design change.

Evidence: `src/app/admin/admin.css`, `crm.tsx`, `login/login.tsx`, inherited `src/app/globals.css`, and `.impeccable/review/desktop.png` / `mobile.png`. This documentation does not certify production deployment or a completed Recurrente Sandbox payment; the latter remains pending keys. No corroborated concept-roll or seed evidence is claimed.

Not canonized: compact 9–10px status text as a future legibility target; development-overlay badges visible in QA captures; public-site eyebrow styles, which are not used by the CRM. No craft-floor violation is promoted into a reusable rule.
