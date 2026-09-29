# Release checks

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
