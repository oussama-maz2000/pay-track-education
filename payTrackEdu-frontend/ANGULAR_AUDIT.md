# Angular 22 Audit

Audit date: 2026-09-19

The production build succeeds. No source files were changed as part of the audit.

## Confirmed deprecation

- `provideAnimations()` in `src/app/app.config.ts` is deprecated since Angular 20.2 and is intended for removal in v23. Migrate animation usage to native CSS with `animate.enter` / `animate.leave`, while assessing Angular Material animation requirements.

No legacy `*ngIf`, `*ngFor`, NgModule bootstrap, class HTTP interceptors, or deprecated routing configuration was found. The project uses standalone components, functional interceptors, `bootstrapApplication`, and `@if` / `@for` control flow.

## High priority

- **XSS exposure:** `src/app/shared/pipe/safe-html.pipe.ts` universally bypasses Angular HTML sanitization. It is used for navigation SVG and snackbar messages, including potentially backend-derived error content. Replace the generic bypass pipe with static icon components/assets, or limit trust conversion to vetted local constants.
- **Tokens in localStorage:** `src/app/core/facade/auth.facade.ts` persists both access and refresh tokens through `StorageCoreService`. A successful XSS can steal them. Prefer secure, HttpOnly, Secure, SameSite refresh-token cookies with short-lived in-memory access tokens.
- **Credential logging:** `src/app/shared/components/auth/signup-form/signup-form.component.ts` logs email and password values to the browser console. Remove immediately. The audit found 42 console calls overall.
- **Event-listener leak:** `src/app/shared/components/common/table-dropdown/table-dropdown.component.ts` adds `this.close.bind(this)` and removes a newly-created bound function, so the listener remains after destruction. Store one stable callback or use `Renderer2.listen` / a host listener.

## Medium priority

- **Index-based tracking:** 31 `@for` loops use `track $index`, including mutable/paginated/sortable lists. Use stable identities such as `track item.id`; reserve `$index` for static immutable collections.
- **No OnPush components:** no component declares `ChangeDetectionStrategy.OnPush`. Introduce it incrementally for dashboard/list components, using immutable updates and signals where suitable. Remove manual `detectChanges()` calls where this makes them unnecessary.
- **Manual RxJS lifecycle management:** the sidebar manually aggregates subscriptions and briefly subscribes then immediately unsubscribes to read values. Prefer `takeUntilDestroyed(inject(DestroyRef))`, signals, or service methods for synchronous reads.
- **Browser globals:** direct `window`, `document`, `localStorage`, and `sessionStorage` calls occur in services and components. Encapsulate them in platform-safe injected services to support SSR/prerendering and testing.
- **Type-safety escapes:** 27 `any` usages exist despite `strict: true`, including reusable form controls and table dropdown inputs. Replace with precise types. `strictPropertyInitialization` is disabled in `tsconfig.json`.

## Lower priority / maintainability

- Protected-route guards are commented out in `src/app/app.routes.ts`, leaving the main route tree unguarded.
- The global ApexCharts script contributes to a large initial bundle (about 2.16 MB raw). Lazy-load chart-heavy code and avoid global scripts where possible.
- No committed `*.spec.ts` tests exist, including for auth token/error behavior and interceptor flows.

## Suggested remediation order

1. Remove credential logs, fix the `bind()` event-listener leak, and limit `SafeHtml` bypasses.
2. Rework browser token storage with corresponding backend support.
3. Replace mutable-list `$index` tracking and re-enable route guards.
4. Modernize change detection, subscriptions, and browser-global access.
5. Migrate off `provideAnimations()` before Angular v23, reduce bundle size, and add focused tests.
