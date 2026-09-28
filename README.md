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

The header switches between English and Spanish and between light and dark
themes. Preferences persist locally in the browser. Country search in SolarCalc
filters by the beginning of the country name in the selected language, ignoring
accents. Choose a country, then a city, to apply a solar estimate.

## Checks

```sh
npm run typecheck
npm run build
node --experimental-strip-types --test qa/solar-model.test.mjs qa/electricity-model.test.mjs
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

The remaining experiments are concept previews, with implementation deferred.
