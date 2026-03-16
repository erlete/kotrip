---
description: Instructions for AI assistants for colour selection
applyTo: 'frontend/**'
---

# Color Palette & Theme Explanation (LLM-Optimized)

This section describes the design system's color configuration, dark/light theming, and scale usage to ensure consistent UI generation by LLMs.

---

## 1️⃣ Dark / Light Theme

The project supports **two themes**: light (default) and dark.

- **Light theme:**
  - Background: `--bg`, `--bg-light`, `--bg-dark`
  - Text: `--text`, `--text-muted`
  - Borders and shadows: `--border`, `--shadow`, `--box-shadow`
  - Overlay: `--overlay`
- **Dark theme:**
  - Same variables are overridden under `[data-theme='dark']`
  - Backgrounds, text, borders, shadows, and overlay adjust for dark context
- Theme switching is controlled via the `data-theme` attribute.

---

## 2️⃣ Base Variables

- `--default-radius`: standard border radius for components
- `--inherit`: CSS `inherit` value
- `--dark` / `--light` / `--text`: global semantic colors
- `--bg`, `--bg-light`, `--bg-dark`: backgrounds
- `--border`, `--shadow`, `--overlay`: borders and layer effects
- All component styles rely on these for consistency.

---

## 3️⃣ Semantic Color Palette

The theme defines **semantic colors**:

- `primary`, `secondary`, `accent`, `success`, `warning`, `error`, `info`, `smoke`

Each color is defined using **OKLCH** and has a **shade scale** from **50 (lightest) to 950 (darkest)**.

Example:

```
--primary-50: lightest tint
--primary-500: base color
--primary-950: darkest shade
```

---

## 4️⃣ Color Scale Generation

- The scale is generated programmatically:
  - `$color-scale-labels: (50, 100, ..., 950)`
  - `make-scale($name, $base, $labels, $is-dark)` computes shades
  - `shade-step($base, $t, $is-dark)` interpolates between white (#fff) and black (#111) over the 0..1 range
- Dark/light themes use the same base colors but **flip interpolation**:
  - Light theme: blend with #111 for shadows, #fff for highlights
  - Dark theme: smaller range to avoid too bright highlights or deep shadows

---

## 5️⃣ Usage Guidelines

- Use `var(--colorname-500)` for the standard tone.
- Use lower numbers (50-400) for highlights, backgrounds, or hover states.
- Use higher numbers (600-950) for borders, shadows, or pressed states.
- For semantic consistency, always use the generated variables instead of custom colors.
- LLMs generating UI should respect these variables to maintain dark/light theme coherence.
