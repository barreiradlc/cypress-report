# cypress-report

Demo application with **Cypress end-to-end (E2E) tests**, **Mochawesome HTML reports**, and a **GitHub Actions pipeline** that runs on every commit/pull request and blocks merges that break the UI.

This repo is a working implementation of the article
"Stop Shipping Broken UIs: E2E Testing with Cypress and a Git Pipeline" — a complete safety net for your most important user journeys.

## What this protects

A UI can break in ways no unit test will notice: a renamed CSS class, a missing route, a changed API contract, a modal covering a button. E2E tests drive a real browser through the real application, so they fail the same way a user would.

The suite covers:

* **Login flow** — form renders, valid credentials sign in (asserting the `POST /api/login` response is `200` and redirect to `/dashboard`), invalid credentials show an error.
* **Smoke test** — the main pages (`/`, `/dashboard`, `/products`, `/settings`) render with a `header` and `main`, and no "something went wrong" text.

## Technologies

| Layer | Tech |
|-------|------|
| Frontend | React 19, TypeScript, Vite 8 |
| Routing | React Router DOM 6 |
| Mock API server | Express 4 (serves the SPA + `POST /api/login`) |
| E2E testing | Cypress 13 |
| Reports | Mochawesome 7, mochawesome-merge 4, mochawesome-report-generator 5 (`marge`) |
| CI/CD | GitHub Actions (`actions/checkout`, `actions/setup-node`, `cypress-io/github-action`, `actions/upload-artifact`) |
| Linting | ESLint (flat config) + typescript-eslint |

## Methodologies

* **E2E over unit for critical journeys** — unit tests prove a function works; E2E tests prove a real user can log in and reach the dashboard.
* **Dedicated test attributes** — elements are targeted with `data-cy="..."` instead of CSS classes or visible text, which change constantly during design iterations.
* **No fixed waits** — never `cy.wait(5173)`. Wait on aliases, elements, or URLs (`cy.intercept('POST','/api/login').as('login')` + `cy.wait('@login')`).
* **CI on every commit** — pipeline runs on every `push` to `main` and every pull request targeting `main`; consistent environment, no "works on my machine".
* **Reports on every run** — Mochawesome JSON is merged into a readable HTML report (`cypress/reports/html/report.html`) and uploaded as an artifact, even when tests fail (`if: always()`), plus screenshots and videos on failure.
* **Merge gate** — branch protection requires the E2E check to pass and branches to be up to date before merging, so a broken interface never reaches `main`.
* **Fast & trustworthy suite** — test journeys not details, retry flaky runs in CI only (`runMode: 2`), treat flaky tests as bugs, log in via API + `cy.session()` where login isn't under test.

## Project structure

```
cypress-report/
├── .github/workflows/
│   ├── deploy.yml          # GitHub Pages deploy (pre-existing)
│   └── e2e.yml             # E2E test pipeline (this article)
├── cypress/
│   ├── config.cjs          # Cypress config (baseUrl, reporter, retries, videos/screenshots)
│   ├── e2e/
│   │   ├── login.cy.js     # Login flow tests
│   │   └── smoke.cy.js     # Smoke test over main pages
│   └── reports/            # Mochawesome JSON + HTML report (gitignored)
├── server.js               # Express mock API + SPA server (port 5173)
├── src/
│   ├── App.tsx             # React Router app: / /login /dashboard /products /settings
│   ├── App.module.css
│   ├── index.css
│   └── main.tsx
├── index.html
├── package.json
└── README.md
```

## Getting started

### Prerequisites

Node.js 20+ and npm. To run Cypress headless locally you also need the system libraries Cypress/Chrome depend on (e.g. on Ubuntu: `libnss3`, `libatk1.0-0`, `libgtk-3-0`, `libgbm1`, …). GitHub-hosted runners already include them, so the CI pipeline works out of the box.

### Install

```bash
npm install
```

### Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check (`tsc -b`) + production Vite build |
| `npm start` | Start the Express mock API + SPA server on `http://localhost:5173` (requires a prior `npm run build`) |
| `npm run lint` | ESLint |
| `npm run cy:open` | Open Cypress Test Runner (interactive) |
| `npm run cy:run` | Run Cypress headless |
| `npm run report:merge` | Merge `cypress/reports/*.json` into `cypress/reports/merged.json` |
| `npm run report:html` | Generate `cypress/reports/html/report.html` from `merged.json` |

### Local development

```bash
# Terminal 1: build + start the app (port 5173)
npm run build
npm start

# Terminal 2: open Cypress and run tests interactively
npm run cy:open
```

### Running the full pipeline locally

```bash
npm run build
npm start            # leave running in another terminal
npm run cy:run
npm run report:merge
npm run report:html
# open the report: cypress/reports/html/report.html
```

## CI pipeline (GitHub Actions)

`.github/workflows/e2e.yml` runs on every push to `main` and every pull request to `main`:

1. Checks out the code and sets up Node 20 (with npm cache).
2. `cypress-io/github-action@v6` builds (`npm run build`), starts the app (`npm start` on port 5173), waits for `http://localhost:5173`, then runs the Cypress specs headless in Chrome (with 2 retries in CI, videos and screenshots on failure).
3. `if: always()` — merges the Mochawesome JSON and builds the HTML report **even when tests fail**, because that's when you need it most.
4. Uploads artifacts: `cypress-report` (HTML report), `cypress-screenshots` (on failure), `cypress-videos`.

Push a branch, open a pull request, and the "E2E Tests" check appears next to your commit.

## Making the check mandatory

A pipeline people can ignore isn't a safety net. In GitHub:

1. Go to **Settings → Branches → Branch protection rules**.
2. Add a rule for `main`.
3. Enable **Require status checks to pass before merging**.
4. Select the `cypress` job ("E2E Tests").
5. Enable **Require branches to be up to date before merging**.

Now if a commit breaks the interface, the pull request shows a red check and the merge button stays disabled until it's fixed. The broken version never reaches `main`.

## Writing and maintaining tests

* Prefer one smoke test, one login test, and one workflow file to start. Add a new test every time a bug slips through.
* Use `data-cy` attributes for targets; they only change when you decide they should.
* Never use fixed waits (`cy.wait(5173)`). Wait on aliases, elements, or URLs.
* For tests that don't verify login itself, log in through the API and cache the session with `cy.session()`.
* Control your data: seed a known state or stub unstable third-party calls with `cy.intercept`.
* Keep the suite fast: test journeys, not details; run specs in parallel (GitHub Actions matrix or Cypress Cloud) as it grows.
* Treat flaky tests as bugs — fix or remove them quickly. If the team stops trusting the pipeline, they stop respecting it.

## Notes

* `package.json` uses `"type": "module"`, so the Cypress config is `cypress.config.cjs` (CommonJS `module.exports`) — a `.js` config would be treated as ESM and `module.exports` would throw.
* `npm start` runs `node server.js` rather than `vite preview` because the login flow posts to `/api/login`, which is provided by the small Express mock API on port 5173. This keeps local, CI, and production-like behavior identical.
* **Vite `base` must be `'/'`** (`vite.config.ts`). The built `index.html` bakes in asset paths, so if `base` points at a subpath (e.g. `/cypress-report/` for GitHub Pages) while the app is served at root (`http://localhost:5173`), the browser requests the wrong asset URLs, the React bundle never executes, and every E2E selector times out. Keep `base: '/'` for the E2E pipeline; adjust only if you change how the app is hosted.
* Headless browser runs require Cypress system dependencies (e.g. on Ubuntu: `libnss3`, `libatk1.0-0`, `libgtk-3-0`, `libgbm1`, …). They run on GitHub-hosted `ubuntu-latest` runners, which preinstall everything Cypress needs. If you run locally and Cypress can't launch, install those system packages.

## License

MIT
