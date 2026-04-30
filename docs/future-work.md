# Future work

Track execution in **GitHub Issues**; use this list as a lightweight in-repo backlog.

## TypeScript

Use **`tsc`** for builds and production: emits JavaScript you run in `node`, matches CI/deploy, and avoids a runtime transpiler in prod. Optionally add **`tsx`** (or `node --watch` on `dist/`) only for faster local dev—optional, not a substitute for `tsc` in release.

- [ ] TypeScript + `tsc`, ESM (`NodeNext`), types at HTTP boundary; treat inbound body as `unknown` until validated.

## Validation (Zod)

- [ ] Validate `POST /logs` with **Zod**; **400** + structured errors on parse/validation failure.

## Logging

- [ ] **Pino** (+ optional **pino-http**); JSON to stdout; later: forward events to a queue if needed (document when chosen).

## Security & traces

- [ ] **Helmet**, **rate limiting** (`express-rate-limit`, consider `trust proxy`), **correlation ID** (`X-Request-Id` or generate) on logs and responses.

## Dev Containers

- [ ] Add [Dev Containers](https://containers.dev/) so you can debug the app during development.
