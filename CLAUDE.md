# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun dev          # Start dev server with Turbopack
bun build        # Production build
bun lint         # ESLint
bun format       # Prettier (writes in place)
bun typecheck    # tsc --noEmit
```

Add shadcn components: `npx shadcn@latest add <component>`

## Architecture

This is a **Next.js 16 App Router** project (TypeScript, React 19) for **Development Secrets Consultancy (DSC)** — a bilingual (EN/AR) multi-step client intake form.

### Stack

- **Tailwind CSS v4** — uses `@import "tailwindcss"` syntax (no `tailwind.config.js` needed)
- **shadcn/ui** with `radix-nova` style; components live in `components/ui/`
- **CVA** (`class-variance-authority`) for component variant composition
- **`cn()`** utility in `lib/utils.ts` — always use this for className merging (combines `clsx` + `tailwind-merge`)
- **next-themes** for light/dark mode (press `d` to toggle in dev)

### Path alias

`@/*` maps to the repo root. Use `@/components`, `@/lib`, `@/hooks`, `@/types`.

### Color system

Colors are defined as CSS custom properties in `app/globals.css` using oklch. The DSC brand palette to use in the form:

| Token | Hex | Usage |
|-------|-----|-------|
| Navy primary | `#0B1F3A` | CTAs, headers, nav |
| Gold accent | `#C8A45C` | Highlights, focus rings |
| Background | `#FFFFFF` | Page/card backgrounds |
| Muted | `#6B7280` | Secondary text |

### Form architecture (planned structure)

```
app/                          # App Router pages
components/
  form/                       # Wizard-level components (FormWizard, ProgressBar, NavigationButtons)
  questions/                  # Per-type renderers (QuestionRenderer, sub-renderers by type)
  ui/                         # shadcn primitives
lib/
  form-config.ts              # All steps + questions defined as structured data
  i18n.ts                     # Translation helpers and language utilities
types/
  form.ts                     # Shared TypeScript types (Question, Step, FormState, etc.)
hooks/                        # Custom hooks (useFormState, useDirection, etc.)
```

### Bilingual / RTL pattern

- All user-visible strings use `{ en: string; ar: string }` shape — never hardcode a single-language string in a component
- The `lang` state drives both content rendering and `dir="rtl"` / `dir="ltr"` on the root element
- A `DirectionProvider` component wraps the form and sets `dir` + CSS text/flex direction
- Tailwind logical properties (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`) are preferred over `ml-`/`mr-` to automatically respect RTL

### Question config shape

Each question in `lib/form-config.ts` must follow the `Question` type from `types/form.ts`:

```ts
{
  id: string
  type: "text" | "number" | "select" | "multi-select" | "textarea" | "radio" | "rating"
  label: { en: string; ar: string }
  placeholder?: { en: string; ar: string }
  options?: { value: string; label: { en: string; ar: string } }[]
  required?: boolean
  validation?: ValidationRule[]
  // future: conditional?: ConditionalLogic
}
```

Steps are arrays of questions; the wizard renders steps sequentially with per-step validation before advancing.

### Code style

- Prettier: double quotes, 2-space indent, 80-char print width, Tailwind class sorting enabled
- ESLint: `eslint-config-next/core-web-vitals` + TypeScript rules
- Strict TypeScript mode is on — no `any`, no implicit returns
