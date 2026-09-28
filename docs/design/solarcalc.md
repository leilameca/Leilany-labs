# EXP.001 SolarCalc

Route: /lab/solarcalc

Implements the approved rooftop concept. Home and Lab source and styles remain
unchanged. The direct route is available for review; the existing Lab concept
preview has not been modified to launch it.

## Experience

- Desktop: precise inputs and a live rooftop with installed capacity.
- Mobile: consumption, a compact live preview, assumptions, then an explicit
  reveal of the full rooftop and results.
- Whole modules update with the estimate. Above 36 panels the drawing uses 36
  symbols with an explicit actual-total caption; it is never a roof-fit layout.
- Invalid input hides current estimates until corrected. Roof shortage is a
  warning, not an instruction to silently reduce the requested system.
- Native range and numeric controls, visible units, keyboard focus, expandable
  explanations, committed-change announcements, and reduced-motion support.
- Panel wattage remains directly editable and includes quick 450 W, 550 W, and
  625 W choices. A city-and-country helper can apply an annual peak-sun-hours
  approximation while preserving manual editing.

## Model

Daily use = monthly use / assumed days.
Target kWp = daily use * desired coverage / (peak sun hours * performance ratio).
Panel count = ceiling(target kWp * 1000 / module W).
Installed kWp = whole panels * module W / 1000.
Production = installed kWp * sun hours * performance ratio * assumed days.
Coverage = production / monthly use.
Roof estimate = panels * module footprint * (1 + layout allowance).

Percentages are converted to fractions. Performance ratio is applied once.
Rounding is presentation-only, except whole panel count. Coverage is not capped
at 100%, even though the comparison bar is. Floating-point noise at exact
whole-panel boundaries is accounted for.

The example is 900 kWh/month, 90% coverage, 5.2 peak sun hours, 80% performance,
625 W modules, 30 days, 3 m2/module, and 20% layout allowance. These are editable
illustrative assumptions, not regional recommendations or a manufacturer's
module specification. The result is a 6.49038 kWp target, 11 panels, 6.875 kWp
installed, 858 kWh/month, 95.333% coverage, and 39.6 m2.

The estimate does not model hourly self-consumption, export, bills, inverter
sizing, batteries, weather variation, detailed shading, or structural suitability.
It is not an engineering design. Rooftop geometry is schematic.

Context references:
- [PVWatts model](https://developer.nlr.gov/docs/solar/pvwatts/v8/)
- [DOE rooftop guidance](https://www.energy.gov/cmei/systems/solar-rooftop-potential)

This simple model does not call or claim equivalence to PVWatts.

## Location-based solar resource

`/api/locations` provides a country-first, city-second selection flow using
GeoNames-backed data from countries.dev. `/api/solar-resource` then requests
the `ALLSKY_SFC_SW_DWN` annual climatology from NASA POWER. The
annual average daily horizontal irradiation is used as a preliminary numerical
approximation of peak sun hours and rounded to one decimal in the form. It is
not a site, roof-plane, or production forecast; users can always replace it.

## Verification

- Model: node --experimental-strip-types --test qa/solar-model.test.mjs
- Browser: node qa/inspect-solar.mjs (local server on port 3000; local Chrome)
- Build: npm run build

Browser checks cover 1440px, 1024px, and 390px: panel changes, estimates,
validation recovery, roof warnings, formula disclosure, reset, and reduced motion.
