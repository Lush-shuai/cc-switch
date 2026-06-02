# Repository Guidelines

## Project Structure & Module Organization

CC Switch is a Tauri 2 desktop app with a React/TypeScript renderer and Rust backend. Frontend source lives in `src/`, with UI components in `src/components/`, hooks in `src/hooks/`, API/query helpers in `src/lib/`, utilities in `src/utils/`, and translations in `src/i18n/locales/`. Rust application code is under `src-tauri/src/`; integration tests are in `src-tauri/tests/`. Frontend tests live in `tests/`, with some colocated unit tests such as `src/lib/version.test.ts`. Static screenshots and documentation assets are in `assets/` and `docs/images/`.

## Build, Test, and Development Commands

- `pnpm install` installs Node dependencies.
- `pnpm dev` runs the full Tauri app in development mode.
- `pnpm dev:renderer` runs only the Vite renderer.
- `pnpm build` creates a production Tauri build.
- `pnpm build:renderer` builds the renderer bundle.
- `pnpm typecheck` runs TypeScript checks with `tsc --noEmit`.
- `pnpm format` formats frontend files with Prettier.
- `pnpm format:check` verifies Prettier formatting.
- `pnpm test:unit` runs Vitest once; `pnpm test:unit:watch` runs it in watch mode.
- `cd src-tauri && cargo fmt --check && cargo test` checks Rust formatting and tests.

## Coding Style & Naming Conventions

Use TypeScript, React function components, and the `@/` alias for imports from `src/`. Component files use PascalCase, for example `ProviderCard.tsx`; hooks use camelCase names beginning with `use`, for example `useSettings.ts`. Keep Tauri command names in camelCase. Frontend formatting is Prettier-managed; Rust formatting is `cargo fmt`. Keep changes surgical and match nearby patterns before introducing new abstractions.

## Testing Guidelines

Vitest runs in `jsdom` with setup files in `tests/setupGlobals.ts` and `tests/setupTests.ts`. Name frontend tests `*.test.ts` or `*.test.tsx` and place broad component tests in `tests/components/`. Rust integration tests belong in `src-tauri/tests/`. Add or update tests for behavior changes, especially provider configuration, proxy behavior, import/export, and user-facing workflows.

## Commit & Pull Request Guidelines

Use Conventional Commits, matching existing history: `docs: clarify guide usage`, `chore(release): bump version`, `fix(tray): ...`, or `feat(provider): ...`. Keep each PR focused on one fix or feature. Include a clear description, linked issue when applicable, and screenshots for visible UI changes. Before submitting, run relevant checks: `pnpm typecheck`, `pnpm format:check`, `pnpm test:unit`, and Rust checks when `src-tauri/` changes.

## Security & Configuration Tips

Do not commit secrets, API keys, local config files, or generated credentials. Report security issues through the project security policy rather than public issues. When changing user-visible text, update all locale files in `src/i18n/locales/`.
