# LEILANY LABS

Small engineering tools with individual visual identities. Built with Next.js,
React and TypeScript.

## Run locally

Use Node.js 22 or newer.

```sh
npm ci
npm run dev
```

Open http://localhost:3000. Home and Lab link to the available tools:

- `/lab/solarcalc`: preliminary solar sizing, panel visualization and solar resource lookup.
- `/lab/electricity-consumption`: appliance energy consumption and contribution breakdown.
- `/lab/battery-lab`: battery bank energy and constant-load runtime.
- `/lab/construction-materials`: concrete slab volume and block-wall quantities.
- `/lab/paint-calculator`: paint coverage, allowance and container count.
- `/lab/climate-ac-calculator`: reference room cooling capacity.
- `/lab/finance-calculator`: fixed-rate loan, extra payments and full amortization.
- `/lab/quote-generator`: itemized quotations with markup, discount and tax.
- `/lab/furniture-budget`: parts, labor, overhead and selling-price estimate.
- `/lab/work-benefits-rd`: selected Dominican Republic ordinary-desahucio benefits.

The header switches between English and Spanish and between light and dark
themes. Preferences persist locally in the browser. Country search in SolarCalc
filters by the beginning of the country name in the selected language, ignoring
accents. Choose a country, then a city, to apply a solar estimate.

## Checks

```sh
npm run typecheck
npm run build
node --experimental-strip-types --test qa/*-model.test.mjs
```

Browser checks in `qa/inspect-*.mjs` require a running server on port 3000 and
Google Chrome on Windows at the path configured in each script. They generate
screenshots and JSON reports. `qa/inspect-preferences.mjs` checks translations,
theme persistence, responsive layouts, preserved form data and country filtering.

## External data

Location lists use GeoNames data via countries.dev; solar resource estimates use
NASA POWER annual climatology. Network failures leave manual solar inputs
available. The city list contains up to 100 major cities per country. Solar
estimates are preliminary and do not replace a site assessment.

## PDF reports

All 10 tools offer **Download PDF / Descargar PDF**. Reports are generated locally
in the browser with jsPDF; form data is not uploaded. They contain current inputs,
units, calculated results and relevant assumptions in the selected language.
Changing the screen theme does not change the print-friendly white PDF layout.
Calculations must be valid. Quotations also require business, client and item names.

Finance exports the **entire** amortization schedule (up to 600 payments), not only
the 12 rows initially displayed. Quotes include every item and the entered terms.
Tables paginate automatically with repeated headings and numbered pages. Reports
use standard Helvetica for English/Spanish (Latin text); other writing systems and
emoji are not supported. The reports summarize data, not screenshots of charts.
CSV export in Finance and browser printing in Quotes remain available.

For a download regression test, start a production server:

```sh
npm run build
npm run start -- --port 3001
# In a second terminal:
node qa/inspect-pdf.mjs http://localhost:3001
# After deployment:
node qa/inspect-pdf.mjs https://leilanylabs.vercel.app
```

The script downloads all 10 reports in both languages, changes inputs, checks
invalid-input guards, a 600-payment schedule, long quote terms, Home links, mobile
and desktop layouts, both themes and preference persistence. It requires Chrome
and MuPDF (`mutool`); set `CHROME_PATH`
and `MUTOOL_PATH` if they are not at the Windows defaults in the script. Generated
PDFs and results go into ignored `tmp/pdfs/`. Render PDFs for visual review; text
extraction alone does not verify pagination. See [release checks](docs/release-checks.md).

## Scope and limitations

This is a personal engineering/software project. Results are illustrative, not
professional designs, financial advice, tax invoices or legal determinations.
Method notes are shown in each tool and included in its PDF. Forms are not saved
between page reloads; download results before leaving. Language/theme preferences
are stored locally. No currency conversion or live supplier prices are provided.

Video production assets and generated QA files are intentionally excluded from Git.
