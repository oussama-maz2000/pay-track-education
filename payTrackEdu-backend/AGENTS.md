# Repository Guidelines

## Project Structure & Module Organization

This is a Spring Boot backend for `payTrackEdu`. Application code lives in `src/main/java/com/payTrackEdu/application`, grouped by responsibility:

- `web`: REST controllers such as `AuthController`.
- `service`: business logic.
- `domain`: JPA entities.
- `repository`: Spring Data repositories.
- `security`: JWT and Spring Security integration.
- `dtos`: request/response DTOs.
- `config`, `utils`, `enums`: shared configuration and helpers.

Runtime configuration is in `src/main/resources/application.properties` and profile-specific overrides such as `application-dev.properties`. Tests belong in `src/test/java` using the same package structure as production code. Build outputs in `target/` are generated and should not be edited.

## Build, Test, and Development Commands

Use the Maven wrapper so contributors run the same Maven version:

- `./mvnw test` or `mvnw.cmd test`: run unit and integration tests matched by Surefire.
- `./mvnw clean package` or `mvnw.cmd clean package`: compile, test, and build the application JAR.
- `./mvnw spring-boot:run` or `mvnw.cmd spring-boot:run`: start the backend locally.

The dev profile runs on port `8081`. Local configuration is loaded from `.env` when present.

## Coding Style & Naming Conventions

Use Java 21 and the existing Spring style. Keep package names under `com.payTrackEdu.application`. Name classes by role, for example `UserRepository`, `AuthService`, `JwtAuthFilter`, and DTOs such as `LoginRequest` or `AuthResponse`. Use 4-space indentation in Java files. Prefer constructor injection for dependencies. Lombok and MapStruct are available; use them consistently where they reduce boilerplate without hiding important behavior.

## Testing Guidelines

Tests use Spring Boot's test stack and Maven Surefire. Test class names should end with `Test`, `Tests`, or `IT`, matching the configured includes. Put focused unit tests near the package they cover, and use Spring context tests only when framework wiring is part of the behavior under test. Run `mvnw.cmd test` before opening a pull request.

## Commit & Pull Request Guidelines

This checkout does not include Git history, so no repository-specific commit convention could be inferred. Use short, imperative commit subjects such as `Add refresh token validation` or `Fix JWT expiry handling`.

Pull requests should include a clear summary, test results, linked issue or task ID when available, and notes about configuration changes. For API changes, include example requests/responses or updated client expectations.

## Security & Configuration Tips

Do not commit `.env`, secrets, database credentials, JWT secrets, mail passwords, or storage keys. Configure these through environment variables such as `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET`, and mail/storage settings. Keep local uploads outside the project directory via `STORAGE_ROOT`.
