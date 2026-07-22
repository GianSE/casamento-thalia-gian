---
name: Ethereal Union
colors:
  surface: '#f6fafe'
  surface-dim: '#d6dade'
  surface-bright: '#f6fafe'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f4f8'
  surface-container: '#eaeef2'
  surface-container-high: '#e4e9ed'
  surface-container-highest: '#dfe3e7'
  on-surface: '#171c1f'
  on-surface-variant: '#43474e'
  inverse-surface: '#2c3134'
  inverse-on-surface: '#edf1f5'
  outline: '#74777f'
  outline-variant: '#c4c6cf'
  surface-tint: '#476083'
  primary: '#000613'
  on-primary: '#ffffff'
  primary-container: '#001f3f'
  on-primary-container: '#6f88ad'
  inverse-primary: '#afc8f0'
  secondary: '#005eb2'
  on-secondary: '#ffffff'
  secondary-container: '#4597fe'
  on-secondary-container: '#002e5d'
  tertiary: '#00070b'
  on-tertiary: '#ffffff'
  tertiary-container: '#00222d'
  on-tertiary-container: '#2891b2'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d4e3ff'
  primary-fixed-dim: '#afc8f0'
  on-primary-fixed: '#001c3a'
  on-primary-fixed-variant: '#2f486a'
  secondary-fixed: '#d5e3ff'
  secondary-fixed-dim: '#a7c8ff'
  on-secondary-fixed: '#001b3b'
  on-secondary-fixed-variant: '#004788'
  tertiary-fixed: '#baeaff'
  tertiary-fixed-dim: '#76d2f6'
  on-tertiary-fixed: '#001f29'
  on-tertiary-fixed-variant: '#004d62'
  background: '#f6fafe'
  on-background: '#171c1f'
  surface-variant: '#dfe3e7'
typography:
  display-hero:
    fontFamily: Playfair Display
    fontSize: 64px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  display-hero-mobile:
    fontFamily: Playfair Display
    fontSize: 40px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-lg:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '500'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.1em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1200px
  gutter: 24px
  margin-mobile: 20px
  section-gap: 120px
  section-gap-mobile: 64px
---

## Brand & Style

The design system is centered on a high-end editorial aesthetic that balances the gravity of a formal union with the lightness of a modern celebration. The target audience includes wedding guests seeking information and the couple documenting their journey. 

The visual style utilizes a **Modern Editorial** approach infused with **Subtle Glassmorphism**. It prioritizes high-quality photography, expansive whitespace, and sophisticated layering. The emotional response is intended to be aspirational and intimate, avoiding corporate rigidity in favor of fluid, organic compositions that feel curated and exclusive.

## Colors

The palette is a monochromatic exploration of blue, transitioning from the structural authority of **Deep Navy** to the airy lightness of **Sky Blue**. 

- **Deep Navy (#001F3F)**: Used for primary headings, high-contrast UI elements, and formal borders.
- **Royal Blue (#0074D9)**: The core action color for buttons and interactive states.
- **Sky Blue (#7FDBFF)**: Used for accents, soft highlights, and translucent overlays.
- **Grey-Blue (#F0F4F8)**: Serving as the "off-white" for subtle section backgrounds and container fills.

Gradients should be used sparingly to define depth—specifically on primary action buttons or as soft background washes behind editorial photography.

## Typography

This design system employs a classic Serif/Sans-Serif pairing to establish hierarchy. **Playfair Display** provides the romantic, editorial character required for names and section headers, while **Inter** ensures functional clarity for logistics and RSVP forms.

- **Display Hierarchy**: Use wide tracking for `label-sm` to create an "expensive" feel. 
- **Line Height**: Body text requires generous leading (1.6) to maintain an airy, readable feel against the navy and white backgrounds.
- **Mobile scaling**: Headlines drop significantly in size to ensure elegant wrapping on portrait displays without losing their characteristic weight.

## Layout & Spacing

The layout philosophy follows a **fluid grid** with significant "breathing room." Vertical rhythm is driven by large `section-gap` values to distinguish between different parts of the wedding story (The Story, The Venue, RSVP).

- **Mobile-First**: Content is primarily stacked in a single column with asymmetric padding to mimic editorial magazine layouts.
- **Fluidity**: Instead of rigid boxes, use fluid containers that bleed to the edges of the screen for photography, while keeping text within a maximum width of 1200px on desktop.
- **Organic Placement**: Elements like floating images or quote blocks should use offset margins to break the 12-column grid and create a more dynamic, less "templated" feel.

## Elevation & Depth

Hierarchy is established through **Glassmorphism** and **Tonal Layering** rather than traditional heavy shadows.

- **Surface Layers**: Use a background blur (`backdrop-filter: blur(12px)`) on navigation bars and floating cards. These should be semi-transparent white (e.g., `rgba(255, 255, 255, 0.7)`).
- **Subtle Depth**: Where elevation is required (like a "Save the Date" card or RSVP modal), use a very soft, diffused shadow tinted with the primary navy: `0 20px 40px rgba(0, 31, 63, 0.08)`.
- **Soft Outlines**: Use 1px borders in `Grey-Blue` or low-opacity `White` to define edges on light backgrounds.

## Shapes

The shape language is defined by **Soft Roundedness** and **Organic Radii**. 

- **Standard Elements**: Buttons and input fields use a medium `0.5rem` (8px) radius to maintain a modern feel.
- **Feature Elements**: Image containers and "Story" cards should utilize asymmetric rounding (e.g., top-left and bottom-right at `rounded-xl`) to create a more fluid, leaf-like or organic aesthetic.
- **Interactive States**: When hovered or active, elements can subtly increase their border radius to signal engagement.

## Components

- **Buttons**: Primary buttons feature the `deep-to-royal` gradient with white text. Secondary buttons are "Ghost" style with a `Royal Blue` border and `Inter` label in uppercase.
- **RSVP Inputs**: Clean, minimal fields with a 1px `Grey-Blue` bottom border that transitions to `Royal Blue` on focus. No heavy boxes.
- **Countdown Timer**: High-contrast `Deep Navy` numbers set in `Playfair Display` with `Grey-Blue` labels.
- **Cards**: Glassmorphic backgrounds with a 1px white internal border. Content is center-aligned for a formal, balanced feel.
- **Navigation**: A sticky header with a high blur effect. The menu items use `label-sm` styling with a subtle underline animation on hover.
- **Floating Action**: A subtle "RSVP" floating button on mobile, utilizing the `Royal Blue` gradient for visibility.