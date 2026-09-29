# Work Benefits RD: supported scenario

Reviewed 2026-09-29. This is an illustrative calculator, not an entitlement
determination or an official settlement. Only private-sector indefinite contracts,
ordinary schedules and employer desahucio are supported. Service before 1993,
special protections, disputed dismissal, resignation, intermittent/domestic work,
and public employment are deliberately outside scope.

## Primary sources

- [Labor Code hosted by the Judiciary](https://poderjudicial.gob.do/wp-content/uploads/2021/06/Codigo_Trabajo.pdf): articles 76, 80, 85, 177–181 and 219.
- [Ministry calculator](https://calculo.mt.gob.do/) and its public calculation implementation.
- [Ministry user guide](https://calculo.mt.gob.do/files/ayuda.pdf), pages 6–8: ordinary monthly divisor 23.83; salary bases and Christmas pay.

## Implementation decisions

- Count the final work date inclusively, using UTC and clamped calendar anniversaries.
- Follow the Ministry calculator's completed-month tiers (including the exact
  3-, 6-, 12-month and 5-year boundaries). Severance uses 21 days per complete year,
  23 from five complete years, plus 6 or 13 for 3 or 6 remaining complete months.
  These boundaries are made explicit rather than silently inferred from overlapping
  wording in the statutory text.
- Average ordinary monthly salary over the last year (or shorter service) is an
  explicit input. It is not assumed equal to the current salary. Notice and
  severance use this average divided by 23.83.
- Vacation days are a user-confirmed unpaid balance, not automatically accrued.
  Vacation valuation uses current ordinary monthly pay divided by 23.83.
- Optional Christmas pay uses actual ordinary earnings in the exit calendar year,
  not a guessed number of salary months. Apply the article 219 five-minimum-salary
  ceiling using a user-supplied sector minimum, then subtract payments already made.
  More favorable contractual entitlements are outside this model.
- Round each monetary component to cents, then sum; show omitted components.
- No personal identifiers or server submission. No late-payment penalties,
  unpaid wages, profit-sharing, protected-worker damages, or deductions.

Verify legal changes and the sector minimum before real-world reliance. Calendar
end-of-month conventions may differ from the Ministry's legacy date arithmetic;
this is not a byte-for-byte reproduction of the official calculator.
