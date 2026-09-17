# Development

Everything a developer needs to run, test and deploy the project. For what the project is and why it is built this way, see the [README](../README.md).

## Requirements

- Node.js 20 or newer (the Docker images use `node:20-alpine`)
- npm
- Docker with the Compose plugin, only for the full two-service setup and for the end-to-end tests

## Run the frontend only

```bash
npm install
npm run dev
```

Vite prints the local URL. With no API running, sync requests fail silently and the app works entirely from `localStorage`. This is the quickest way to try it.

## Run the frontend with the API

The dev server proxies `/api` to `http://localhost:3001` (see `vite.config.ts`), so start the API in a second terminal:

```bash
cd server
npm install
npm start
```

By default the API stores data in `server/db.json`. Set `DATA_PATH` to put it elsewhere, and `PORT` to change the port. Do not commit `db.json`: once you use the app for real, it contains your quotations.

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/data` | Read quotations and config |
| `PUT` | `/api/data/quotations` | Replace `currentQuotation` and `history` |
| `PUT` | `/api/data/config` | Replace the config object |

## Run with Docker Compose

```bash
docker compose up -d --build
```

The app is served at `http://localhost:8080`. Two services start:

- `quote-generator`: nginx serving the built frontend and proxying `/api/` to the API
- `api`: the Express server, with data on the named volume `quote-data`

Stop with `docker compose down`. Add `-v` only if you also want to delete the stored data.

To run the frontend container by itself, without the API:

```bash
docker build -t quote-generator .
docker run -d --name quote-generator -p 8080:80 quote-generator
```

## Security note

The API has no authentication and allows cross-origin requests from anywhere. Anyone who can reach it can read and overwrite every stored quotation, including client names, tax IDs and prices.

Run it only on a network you trust, such as your own machine, a home network, or a private VPN. If it must be reachable from the internet, put it behind something that authenticates requests first, for example a reverse proxy with basic auth or an identity-aware proxy.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check with `tsc -b`, then build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint |

## End-to-end tests

The Playwright suite in `e2e/` expects the full stack at `http://localhost:8080`, so bring up Docker Compose first:

```bash
docker compose up -d --build
npx playwright install chromium   # first time only
npx playwright test
```

The HTML report is written to `e2e-report/`; failure traces, screenshots and videos go to `test-results/`. Both are git-ignored. Tests run serially with a single worker because they share one backend.

**The suite writes through the real API.** It saves quotations and changes config as part of the tests. Run it against a throwaway instance, never against one that holds your actual data.

`e2e/debug-tax.spec.ts` and `e2e/inspect-dom.spec.ts` are small diagnostic specs kept from debugging sessions; the main suite is `e2e/quote-generator.spec.ts`.

## Project structure

```text
src/
  components/        Screen components (QuotationDisplay, ConfigManager, HistoryDrawer, ExportButtons, ...)
  components/ui/     shadcn/ui primitives
  stores/            Zustand stores: quotationStore, configStore
  utils/
    calculations.ts        Tax and totals
    exportHandler.ts       PDF, PNG and Excel export, including page-break logic
    persistenceService.ts  Best-effort API sync
    quotationNumber.ts     Daily running document numbers
    configManager.ts       Config import and export
    formatCurrency.ts      Amount formatting
    imageUtils.ts          Upload limits and image handling
  types/             Quotation and config types
server/              Express API and its Dockerfile
e2e/                 Playwright specs
Dockerfile           Multi-stage build: Node builder, nginx runtime
nginx.conf           Static serving and /api proxy
docker-compose.yml   Frontend and API services
```

## FAQ

**The exported PDF looks different from the screen.**
The exporter renders the quotation at a fixed 794 px width (A4 at 96 dpi) and waits for fonts before capturing. html2canvas does not support every CSS feature, `backdrop-filter` among them, so avoid those inside the quotation area.

**Where do I change the quotation layout?**
`src/components/QuotationDisplay.tsx`. Elements that must not be split across PDF pages are marked with the `data-export-block` attribute; table rows and the table header are protected automatically.

**I cleared my browser data and my quotations are gone.**
Without the API, `localStorage` is the only copy. Run the API as well, or export anything you need to keep.

**Can I import an existing quotation from Excel?**
No. Quotations can only be reloaded from history. Config can be imported and exported as JSON.

**Is there a dark mode?**
No. The UI is fixed to light mode.
