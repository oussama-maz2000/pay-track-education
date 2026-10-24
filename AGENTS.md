# Repository Guidelines

## Project Structure & Module Organization

This workspace contains two applications:

- `payTrackEdu-frontend/`: Angular/Tailwind client. Source is in `src/app/`; reusable infrastructure is in `core/`, routed screens in `pages/`, and shared UI in `shared/`. Assets are in `public/`.
- `payTrackEdu-backend/`: Java 21 Spring Boot API. Code is under `src/main/java/com/payTrackEdu/application/`, organized into `web`, `service`, `domain`, `repository`, `security`, and `dtos`. Configuration is in `src/main/resources/`; tests mirror packages beneath `src/test/java/`.

Read each module's `AGENTS.md` before changing files within that module. Do not edit generated directories: frontend `dist/` and `node_modules/`, or backend `target/`.

## Build, Test, and Development Commands

Run commands from the relevant module directory.

- `cd payTrackEdu-frontend; npm install`: install the locked frontend dependencies.
- `npm start`: serve the Angular app at `http://localhost:4200`.
- `npm run build`: build the frontend and enforce bundle budgets.
- `npm test`: run Angular Karma/Jasmine tests.
- `cd payTrackEdu-backend; .\mvnw.cmd spring-boot:run`: start the API (dev profile uses port `8081`).
- `.\mvnw.cmd test`: run the Maven Surefire suite.
- `.\mvnw.cmd clean package`: compile, test, and package the backend.

## Coding Style & Naming Conventions

Follow the conventions already present in the file you edit. Angular code uses two-space indentation, single-quoted imports, semicolons, PascalCase classes, camelCase members, and role-suffixed files such as `auth.service.ts` and `login.component.ts`. Keep API types in `src/app/core/model/` and use Tailwind utilities before adding component CSS.

Backend code uses four-space indentation and packages below `com.payTrackEdu.application`. Name Spring types by responsibility (`PaymentService`, `PaymentRepository`, `PaymentController`) and request/response DTOs descriptively. Prefer constructor injection; use Lombok and MapStruct consistently with adjacent code.

## Testing Guidelines

Add focused frontend tests beside source as `*.spec.ts`; test new branching, mappings, and auth/error handling. Backend tests must end in `Test`, `Tests`, or `IT` so Surefire discovers them. Run the relevant test command before handoff; also run `npm run build` for frontend UI, route, model, or API-client changes.

## Commit & Pull Request Guidelines

Git history is not available in this checkout, so use concise imperative Conventional Commit-style subjects, for example `feat(payments): add installment status` or `fix(auth): refresh expired token`. Keep pull requests focused, explain behavior and configuration changes, link the task when available, list validation performed, and attach before/after screenshots for visible frontend changes.

## Security & Configuration

Never commit `.env` files, database credentials, JWT secrets, mail passwords, or storage keys. Configure backend values through environment variables such as `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET`, and `STORAGE_ROOT`; keep uploads outside the repository.
