# Repository Guidelines

This project is a Next.js (App Router) custom field extension for Sitecore XM Cloud Marketplace, written in TypeScript and React.

## Project Structure & Module Organization
- `app/custom-field-extension/page.tsx` – main custom field UI and entry point.
- `app/page.tsx` – simple landing page for local development.
- `src/components` – Crop canvas, breakpoint tabs, media search modal, preview strip.
- `src/hooks` – Marketplace client bootstrap and responsive crop state management.
- `src/utils`, `src/constants`, `src/types` – shared helpers, defaults, and value types.

## Build, Test, and Development Commands
- `npm install` – install dependencies.
- `npm run dev` – run the dev server, then open `/custom-field-extension` for local smoke tests.
- `npm run build` – build a production bundle (used for deployment).
- `npm start` – start the production server after a build.
- `npm run lint` – run ESLint with the TypeScript-aware Next.js config; fix issues before committing.

## Coding Style & Naming Conventions
- TypeScript + React functional components; 2‑space indentation and semicolons as in existing files.
- Use `PascalCase` for components and `camelCase` for variables, functions, and file‑local helpers.
- Prefer type-only imports where possible (e.g., `import type { FocalPoint } from "../types/crop";`).
- Keep logic focused and colocate feature-specific code under `src/*` rather than `app/*`.

## Testing Guidelines
- There is currently no automated test suite; when adding one, prefer unit tests close to the code (e.g., `src/utils/normalization.test.ts`).
- Focus tests on pure logic such as normalization helpers and `useResponsiveCropState` behavior (defaults, clamping, serialization).
- Ensure new tests run as part of a future `npm test` (or similar) script wired in `package.json`.

## Commit & Pull Request Guidelines
- Use short, imperative commit messages (e.g., `Add media search modal`, `Refine crop normalization math`).
- For PRs, describe the user-facing change (editor behavior, UX tweaks) and any XM Cloud configuration impact.
- Include screenshots or GIFs of `/custom-field-extension` when UI changes affect the cropper, focal point, or previews.
- List manual verification steps (open custom field, select image, switch breakpoints, save/reopen) so reviewers can reproduce quickly.

