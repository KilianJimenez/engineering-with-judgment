# Engineering with Judgment

**A declaration on software engineering in the age of Artificial Intelligence.**

Read it online: <https://kilianjimenez.github.io/engineering-with-judgment/> · Source texts: [English](declaration_software_engineering_ai_era.md) · [Español](declaracion_ingenieria_software_era_ia.md)

## What This Is

AI lets us produce software faster than ever, but speed without evidence is not engineering. This declaration states the values, principles and commitments we believe teams need to keep building trustworthy systems when part of the work is done by AI:

- **Accountability cannot be delegated** — people remain responsible for what ships.
- **Tests are contracts and a source of operational truth**, not targets to be bent.
- **Every AI-generated result is a hypothesis until it is validated**, and validation must stay independent.
- **Guardrails, observability and evidence** are part of the goal, not obstacles to speed.

It also lists the warning signs of unhealthy engineering and how we will recognize healthy engineering. The site is a bilingual (ES/EN) one-page reading experience.

## Contribute

Suggestions to the declaration, translations and site improvements are welcome:

1. Open an issue to discuss changes to the declaration text before submitting them.
2. Fork the repository, create a branch and open a pull request.
3. Edit the sources, not the generated HTML: content lives in the two `.md` files, presentation in `src/` and the generator in `scripts/generate.mjs`.
4. Make sure `npm run lint` and `npm test` pass.

## How to run locally

Requires Node.js 20+.

```sh
npm install
npm run dev       # development server
npm run build     # production build
npm run preview   # preview the build
npm test          # build + Playwright (first time: npx playwright install chromium)
```
