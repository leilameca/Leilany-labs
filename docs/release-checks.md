# Release checks

## Verified release - September 29, 2026

Application commit: `fec5e4b`. Public site: https://leilanylabs.vercel.app.

- Production build and TypeScript checks passed; all 41 calculation tests passed.
- Local and public-site runs downloaded 20 PDFs each (10 tools, EN and ES).
- Reports contained changed calculation results; invalid inputs blocked export.
- A 600-payment Finance report included payment 600 and the zero final balance.
- Long Spanish quotation terms and accented names exported successfully.
- Unsupported Work RD scenarios and incomplete quotations blocked export.
- Public-site checks passed at 1440, 1024 and 390 pixels, in both languages and
  themes (120 tool layout/theme checks). Home/Lab layouts and preference
  persistence passed separately. No browser runtime exceptions were observed.
- Rendered report pages were visually inspected, including long-term quotation
  pagination and the final amortization page. Home/Lab desktop and mobile
  screenshots were reviewed in light/dark modes.
- Home links expose all 10 tools; hero cards now open their tools directly.
- Home, Lab, countries, Dominican Republic cities and Santo Domingo solar
  resource endpoints returned HTTP 200 on the public site. This is a point-in-time
  check; upstream availability is not guaranteed.

Video assets, downloaded PDFs and screenshots stay local and are not release code.

## Reproducible checks

- `npm run typecheck`
- `npm run build`
- `node --experimental-strip-types --test qa/*-model.test.mjs` (41 calculation tests)
- `node qa/inspect-pdf.mjs http://localhost:3001` against a production build
- Repeat the PDF check with `https://leilanylabs.vercel.app` after deployment

The PDF test requires Windows Chrome and MuPDF, or explicit executable paths via
`CHROME_PATH` and `MUTOOL_PATH`. It uses synthetic data, not customer information.
The JSON report records the tested URL, timestamp and paths of downloaded PDFs.

## Manual visual review

1. Open Home and Lab; verify every tool card navigates to its working page.
2. Switch EN/ES and light/dark. Check desktop and mobile; reload to check persistence.
3. Change a numeric field in each tool; confirm its displayed result updates.
4. Download a PDF and compare inputs/results against the current screen.
5. Check Spanish accents, units, headings, page numbers and no clipped text.
6. In Finance, set 600 months and verify the PDF includes the last payment and zero balance.
7. In Quotes, enter long terms and multiple items; verify page breaks, totals and all terms.
8. Test an invalid input: no stale PDF should be downloadable. An incomplete quote
   and an unsupported Work RD scenario must not export a result.
9. For SolarCalc, test location selection and a failed network request. Manual peak
   sun hours must remain available. Location services are independent external APIs.

PDFs are data reports with a white print layout, not chart screenshots. They use
Latin/Spanish Helvetica text; arbitrary non-Latin scripts are outside this version.
The export module is loaded only when requested. All generation runs client-side.
