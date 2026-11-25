# Engineering with Judgment

**A manifesto for software engineering teams in the age of Artificial Intelligence.**

Read it online: <https://kilianjimenez.github.io/engineering-with-judgment/> · Source texts: [English](manifesto_software_engineering_ai_era.md) · [Español](manifiesto_ingenieria_software_era_ia.md)

## What This Is

AI lets us produce software faster than ever, but speed without evidence is not engineering. This manifesto states the values, principles and commitments we believe teams need to keep building trustworthy systems when part of the work is done by AI:

- **Accountability cannot be delegated** — people remain responsible for what ships.
- **Tests are contracts and a source of operational truth**, not targets to be bent.
- **Every AI-generated result is a hypothesis until it is validated**, and validation must stay independent.
- **Guardrails, observability and evidence** are part of the goal, not obstacles to speed.

It also lists the warning signs of unhealthy engineering and how we will recognize healthy engineering. The site is a bilingual (ES/EN) one-page reading experience.

## How to sign

Anyone with a GitHub account can sign by opening a pull request that adds `signatures/<your-github-username>.yml`:

```yaml
github: your-github-username   # required, must match the PR author
nombre: Your Name              # optional
rol: Your role                 # optional
fecha: 2026-11-25              # optional, YYYY-MM-DD
```

The easiest way is the **Sign** button on the website: it opens the GitHub editor with the file pre-filled. A GitHub Action validates the signature (one new file, your own username, no HTML or URLs), merges it and republishes the site. Details: [`signatures/README.md`](signatures/README.md).

## Contribute

Suggestions to the manifesto, translations and site improvements are welcome:

1. Open an issue to discuss changes to the manifesto text before submitting them.
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
npm test          # unit tests + build + Playwright (first time: npx playwright install chromium)
```
