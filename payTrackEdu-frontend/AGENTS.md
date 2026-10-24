# Repository Guidelines

## Project Structure & Module Organization

This is an Angular 22 application for education-payment tracking, styled with Tailwind CSS v4. Application code lives in `src/app`:

- `core/` contains API clients, authentication, NgRx state, guards, interceptors, and shared models.
- `pages/` contains routed screens; `shared/components/` and `shared/layout/` contain reusable UI and page shells.
- `environments/` holds API configuration; keep environment-specific URLs there.
- `public/images/` contains static assets served from `/images/...`.

Build output is written to `dist/pay-track-education/`. Do not edit `dist/` or `node_modules/`.

## Build, Test, and Development Commands

- `npm install` installs dependencies from `package-lock.json`.
- `npm start` starts the Angular development server at `http://localhost:4200`.
- `npm run build` creates a production build and enforces configured bundle budgets.
- `npm run watch` builds continuously using the development configuration.
- `npm test` runs the Karma/Jasmine test suite.

Run `npm run build` before handing off UI, routing, model, or API changes.

## Coding Style & Naming Conventions

Use TypeScript and Angular standalone components. Follow the surrounding file’s two-space indentation, single-quoted imports, and trailing semicolons. Name classes in PascalCase (`AuthFacade`), variables and methods in camelCase (`storeLoginSession`), and Angular files with dot-separated roles (`sign-in.component.ts`). Keep API payload types in `src/app/core/model/`.

All backend responses use the shared `ApiResponse<T>` envelope in `core/model/api-response.model.ts`; define each endpoint’s payload as `T`, for example `ApiResponse<LoginResponseData>`.

Prefer Tailwind utility classes in templates. Add component CSS only when utilities cannot express the required behavior.

## Testing Guidelines

The configured test stack is Karma with Jasmine. Place new unit tests next to source files using `*.spec.ts`, for example `auth.facade.spec.ts`. Cover new branching logic, token/error handling, and data mappings. There are currently no committed spec files or coverage threshold configured; add focused tests with each new non-trivial behavior.

## Commit & Pull Request Guidelines

Git history is unavailable in this checkout, so no existing commit convention could be verified. Use concise, imperative Conventional Commit-style subjects, such as `feat(auth): handle API response envelope` or `fix(login): persist access token`.

Keep pull requests focused. Include a short description, linked issue when applicable, validation performed (`npm run build`, tests), and before/after screenshots for visible UI changes. Never commit tokens, credentials, or environment secrets.
