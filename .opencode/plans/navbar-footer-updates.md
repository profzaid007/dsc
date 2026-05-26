# Implementation Plan: Portal Homepage Updates

## Changes Required

### 1. Navbar Redesign (components/layout/Navbar.tsx)
Replace the floating glassmorphism navbar with full-width header from index.html:

**Current Design:**
- Floating rounded navbar with glassmorphism effect
- Logo image (/logo.svg)
- Nav links: Home, About Us, Services (dropdown), Contact Us
- Language toggle button
- Book Consultation button
- Auth buttons (Login/Dashboard)

**New Design (matching index.html):**
- Full width with border-bottom separator
- Gold gradient circular "DSC" logo placeholder (left side)
  - Background: radial-gradient(circle, #d4af37 0%, #aa7c11 100%)
  - Size: 60x60px
  - Text: "DSC" in white, bold
- Brand text block:
  - "DSC" - large bold text (#0b1a30)
  - "Development Secrets Consultancy" - smaller text (#555)
  - Tagline: "Your Partner in Personal & Professional Growth" (#0076a3, semibold)
- Right side:
  - "اللغة العربية" / "English" language toggle link (bold, #0b1a30)
  - Keep Login/Dashboard buttons

### 2. Portal Cards Layout (app/page.tsx)
**Current:** flex-wrap causing 2 cards per row
**New:** 
- Desktop: 5 cards in single horizontal row (grid-cols-5 or flex-nowrap)
- Mobile: Stack to 2 per row (grid-cols-2 on small screens)
- Reduce card widths

### 3. Global Footer (components/AppShell.tsx + app/page.tsx)
**Current:** Footer only on homepage
**New:** Footer on ALL pages
- Move FooterSection import and usage from app/page.tsx to components/AppShell.tsx
- AppShell wraps all routes, so footer appears everywhere
- Remove FooterSection from page.tsx to avoid duplication

## Implementation Steps

1. Update Navbar component with new design
2. Update page.tsx card layout (horizontal on desktop, 2-col on mobile)
3. Update AppShell.tsx to include FooterSection
4. Remove FooterSection from page.tsx

## Testing Checklist
- [ ] Navbar matches index.html design
- [ ] Gold gradient logo visible
- [ ] Brand text and tagline displayed
- [ ] Language toggle works
- [ ] Login/Dashboard buttons visible
- [ ] 5 portal cards in single row on desktop
- [ ] 2 portal cards per row on mobile
- [ ] Footer appears on homepage
- [ ] Footer appears on /portal/[id] pages
- [ ] Footer appears on /dashboard pages
- [ ] Footer appears on /login page
