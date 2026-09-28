# LEILANY LABS: Approved Home and Brand DNA

Status: approved by the user on 2026-09-28.

The implemented Home is the official visual reference. Preserve its appearance,
composition, typography, illustrations, spacing, navigation style, and interaction
quality. Do not redesign or simplify it without an explicit user request.
Approval of another stage is not permission to restyle Home.

This document takes precedence over conflicting early visual instructions in
[desing.md](../../desing.md). The original filename is retained.

## Same Brand. Different Worlds.

LEILANY LABS is a software engineer's portfolio and a collection of useful digital
products. It feels colorful, fresh, clever, friendly, curious, modern, playful,
and professional. The tools are the visual stars. Engineering appears in small
experiment numbers, meaningful units, diagrams, and understandable results.

The Home establishes the family; each application develops its own personality.
Do not reuse the Home hero, preview grid, or section composition as an application
template. A palette swap on a generic calculator does not meet this principle.

## Shared Brand

| Element | Approved reference |
| --- | --- |
| Typography | Friendly sans-serif, strong readable hierarchy, zero letter spacing |
| Main font stack | Aptos, Segoe UI Variable, Segoe UI, sans-serif |
| Technical font | Cascadia Code, Consolas, monospace; small supporting annotations |
| Canvas / paper | `--color-canvas: #fffdf7`; `--color-paper: #ffffff` |
| Primary / secondary text | `--color-ink: #252725`; `--color-ink-soft: #61635f` |
| Separators | `--color-line: #e4e6df`; restrained 1px lines |
| Brand action blue | `--color-solar-blue: #2856e8` |
| Navigation | Compact blue LL mark, bold wordmark, clear text links, quiet outlined Lab link |
| Geometry | 8px preview radius, 6px action radius; open sections and purposeful framed previews |
| Motion | 180ms controls, 250ms preview lift; feedback without changing document layout |
| Focus | Visible 3px blue outline with 5px offset |
| Accessibility | Semantic controls, keyboard access, skip link, reduced motion, readable contrast |

The current fonts are system font stacks, not downloaded webfonts. Do not silently
replace them. Reuse tokens for shared roles; scope new experiment-specific colors
and styles so they cannot change Home.

## Home Composition Baseline

Home uses a centered three-line statement, four staggered colorful ecosystem
previews, a mixed-width gallery of ten experiments, an open engineer introduction,
and a quiet footer. Its exact statement remains:

TINY TOOLS.  
REAL PROBLEMS.  
SMART SOLUTIONS.

The statement is 58px on desktop, 31px at widths up to 700px, and 27px up to 360px,
with weight 800. Body defaults are 16px / 1.5; section headings are 38px desktop
and 30px mobile. These are Home reference values, not mandatory application sizes.

Content has a 1200px maximum width, 40px desktop gutters, and 22px mobile gutters.
Generous section spacing contrasts with compact labels and actions. Primary
actions are 50px tall on desktop and 46px on mobile. Navigation and disclosures
have 44px minimum heights.

Home adapts at 1100px, 700px, and 360px. The gallery becomes two columns on tablet
and one on mobile; the hero ecosystem becomes two columns. Preserve these
relationships. Future tools should choose layouts around their own tasks and
maintain equivalent spacing, touch usability, and overflow protection.

## Experiment Worlds

These are the approved palette anchors and preview metaphors. They establish a
direction, not finished application layouts or verified calculation behavior.

| Experiment | Palette anchors | Visual world |
| --- | --- | --- |
| EXP.001 SolarCalc | Yellow #ffda47 / blue #2856e8 | Sunlight, panels, useful energy |
| EXP.002 Electricity Consumption | Cyan #b1efed / yellow #ffe45a | Current paths, appliance use, kWh |
| EXP.003 Battery Lab | Green #b9f482 / green-cyan #2c7466 | Cells, capacity, stored energy |
| EXP.004 Construction Materials | Orange #f48c45 / sand #f4dfc7 | Dimensions, materials, quantities |
| EXP.005 Paint Calculator | Coral #f77665 / pink #fbd1dd | Surfaces, coverage, swatches |
| EXP.006 Climate / AC | Ice #d3f1f7 / violet #7662bd | Airflow, temperature, comfort |
| EXP.007 Finance | Violet #ded3fa / coral #ff816e | Money, time, meaningful charts |
| EXP.008 Quote Generator | Blue #325de1 / cyan #b5eef3 | Documents, estimates, business |
| EXP.009 Furniture Budget | Brown #8b4b31 / orange #eab483 | Materials, joinery, craft |
| EXP.010 Work Benefits RD | Deep blue #283c76 / coral #ff917e | Salary, calendars, documentation |

Each application may vary its spatial composition, dominant color balance,
illustrations, input workflow, domain interactions, and result visualization.
It shares navigation conventions, font family, spacing quality, accessibility,
control quality, and the playful professional tone.

Share useful primitives and behavior, not one compulsory calculator shell.
Design each workflow around its problem. For example, solar sizing and roof
area deserve a different result composition from an amortization timeline or
paint coverage across walls.

## Boundaries

- Do not return to oversized editorial serif type, heavy black grids, rotated
  labels, newspaper layouts, or dominant technical-notebook styling.
- Do not drift into a generic SaaS, dashboard, calculator directory, identical
  rounded cards, decorative blobs, glassmorphism, glow, or floating clay icons.
- Keep flat or subtly dimensional illustrations tied to the subject.
- Use strong colors with a clear hierarchy; do not neutralize the brand.
- Keep decorative preview figures separate from real calculated results.
- Until tools are implemented, label previews honestly; do not imply they launch
  functioning calculators.

## Future Work and Review

1. Read this document and inspect the approved Home before starting a visual stage.
2. Define the new page's purpose and its relationship to the brand.
3. Keep page-specific styles isolated. Do not change global selectors to solve a
   local layout problem.
4. Preserve Home visually when wiring navigation or extending shared components.
5. Review new pages at approximately 1440px, 1024px, and 390px, including keyboard,
   focus, touch, reduced motion, empty states, and text overflow.
6. Check Home for regressions whenever shared behavior changes.
7. Stop at the requested stage for user approval.

## Reference Files

- [Home](../../src/app/page.tsx)
- [Tokens and approved Home styling](../../src/app/globals.css)
- [Navigation](../../src/components/site-header.tsx)
- [Tool preview illustrations](../../src/components/tool-artwork.tsx)
- [Experiment registry](../../src/experiments/registry.ts)

Existing full-page visual captures: [desktop](../../qa/home-1440-full.png),
[tablet](../../qa/home-1024-full.png), and [mobile](../../qa/home-390-full.png).
They supplement the approved implementation; they do not grant permission to
redesign it. This documentation records approval, not a new visual proposal.
