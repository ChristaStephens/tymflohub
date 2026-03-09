# TymFlo Hub Design Guidelines

## Design System
**Approach**: Linear-inspired premium SaaS combining precision with visual distinction.

**Core Principles**: Premium Clarity • Confident Color • Elevated Simplicity • Trustworthy Polish • Engaging Efficiency

---

## Color System

**Primary**:
- Brand Purple `#463176` - headings, CTAs, nav
- Brand Coral `#F69679` - accents, hover, secondary CTAs

**Supporting**:
- Deep Purple `#352557` - hover states, dark accents
- Light Purple `#EDE9F3` - subtle backgrounds
- Coral Tint `#FFE8E1` - notifications, soft accents
- Neutral Gray `#F7F9FC` - page backgrounds
- Border Gray `#E5E7EB` - dividers
- Text Primary `#1F2937` - body text
- Text Secondary `#6B7280` - metadata

**Gradients**: Purple→Deep Purple (135deg) for heroes, buttons on hover; Coral→Purple for premium features

---

## Typography

**Fonts**: Inter (primary), JetBrains Mono (numbers/code)

**Scale**:
- Hero: `text-5xl md:text-7xl font-bold tracking-tight`
- H1: `text-3xl md:text-5xl font-bold text-purple`
- H2: `text-2xl md:text-3xl font-semibold`
- Tool Titles: `text-xl font-semibold`
- Body: `text-base md:text-lg leading-relaxed`
- Results: `text-5xl md:text-6xl font-mono font-bold text-purple`
- Labels: `text-sm font-medium text-secondary`
- Meta: `text-xs uppercase tracking-wider text-secondary`

---

## Layout & Spacing

**Spacing**: Tailwind scale - 4, 6, 8, 12, 16, 20, 24, 32
- Components: `p-6` to `p-8`
- Sections: `py-16` to `py-32`
- Cards: `gap-6` to `gap-8`

**Containers**:
- Full-width: `w-full max-w-7xl mx-auto px-6`
- Content: `max-w-6xl`
- Tools: `max-w-5xl`
- Text: `max-w-3xl`

**Grids**:
- Tools: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8`
- Features: `grid-cols-1 lg:grid-cols-2 gap-12`
- Pricing: `grid-cols-1 md:grid-cols-3 gap-8`
- Dashboard: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6`

---

## Components

### Header
`h-20` fixed, backdrop-blur, semi-transparent. Purple gradient logo, coral underline nav hover. CTA: coral bg, purple text, `rounded-lg`. Mobile: slide-in drawer.

### Hero
`min-h-screen py-32`, workspace image with purple gradient overlay (85%). White headline with text-shadow, `text-xl` subhead. Search: `rounded-xl h-16 shadow-2xl` white bg. CTAs: coral primary + outlined white, both `rounded-lg px-8 py-4`. Trust badges below.

### Tool Cards
`rounded-2xl shadow-lg` white, purple-tint border. `p-8` with `w-16 h-16` coral/purple gradient icon, `text-xl` purple title, `text-sm` description, coral "Try Tool →" link. Badge: top-right coral. Hover: `translateY(-4px)` + shadow increase.

### Tool Page
**Left** (lg:w-1/2): Purple gradient header `p-8 rounded-t-2xl`, white form `p-8 shadow-xl rounded-b-2xl`. Inputs: `rounded-lg border-2 focus:border-purple p-4`. Submit: full-width coral `rounded-lg py-4`.

**Right** (lg:w-1/2): Sticky `top-24 rounded-2xl shadow-2xl p-8`. Results: `text-6xl font-mono text-purple`, coral unit labels. Breakdown: purple bg steps `rounded-lg p-4 mb-3`.

### Calculator Results
Primary: `text-6xl font-mono font-bold text-purple mb-4` + `text-2xl text-coral` unit. Secondary metrics: grid with `border-l-4` purple, `p-4 bg-light-purple`. Accordion steps with coral icons.

### File Upload
`rounded-2xl border-2 border-dashed border-purple bg-light-purple py-16`. Coral cloud icon, purple text. Drag active: border-coral, bg-coral-tint. Files: white cards with coral remove. Coral progress bar.

### Upgrade Modal
Blur backdrop with purple tint. `rounded-3xl max-w-2xl p-12 shadow-2xl`. Coral gradient icon, `text-4xl` heading. Feature list: coral checkmarks. CTA: full purple-to-coral gradient `rounded-xl py-4 px-12`.

### Pricing
Three cards, center elevated `scale-105`. `rounded-3xl p-10 shadow-xl`. Coral badge on popular. `text-6xl` price alternating purple/coral. Coral CTA for Pro, outlined purple for others. Subtle purple gradient behind Pro.

### Dashboard
Purple-to-deep gradient header `p-8 rounded-2xl`. Stats: white cards `rounded-xl shadow-md p-6`, `text-4xl` purple numbers, `text-sm uppercase` coral labels. Timeline with coral accent line.

### Footer
Deep purple gradient bg, `py-16` four-column grid. `text-sm uppercase` coral headers, white/80 links hover coral. White input + coral button newsletter. Social: coral with white hover. Copyright: white/60, `border-t border-white/20 pt-8`.

---

## Images

**Hero**: Full-width modern workspace (MacBook, clean desk, natural light) with 85% purple gradient overlay.

**Icons**: Duotone purple/coral illustrations, consistent line weight.

**Empty States**: Coral line-art with purple accents.

---

## Interactions

**Timing**: 200-300ms cubic-bezier

**States**:
- Hover: cards lift + shadow; buttons gradient shift
- Focus: 3px coral ring, offset-2
- Active: `scale-98`
- Load: staggered fade-in

**Buttons**:
- Primary coral: hover shows purple gradient + scale
- Secondary outlined: hover fills purple, white text
- On images: backdrop-blur-md, white/20 bg, no hover blur

**Forms**:
- Success: green checkmark, fade + pulse
- Error: red text, horizontal shake
- Loading: coral spinner, purple trail

**Micro**: Search expands on focus, tool icons rotate 5deg hover, results count-up, smooth progress fills

---

## Accessibility

- Focus: 3px coral ring, offset-2, all interactive elements
- Contrast: 4.5:1 body, 7:1 headings
- Touch: 48px minimum height mobile
- Semantic HTML: proper hierarchy, landmarks
- ARIA: icon buttons, complex widgets
- Keyboard: visible focus, logical tab order
- Skip links: hidden until focus

---

## Responsive

- **Mobile** (<768px): single column, stacked, `py-12`
- **Tablet** (768-1024px): two-column grids
- **Desktop** (>1024px): three-column, full splits, `max-w-7xl`
- Tool pages mobile: form stacks above results
- Nav: hamburger→horizontal at md
- Typography: reduce 20-30% mobile