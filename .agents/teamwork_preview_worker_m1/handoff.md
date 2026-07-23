# Handoff Report — Milestone 1: Database Schema & Authentication Module

## 1. Observation

### Created & Modified Files
- `backend/prisma/schema.prisma`: Complete Prisma schema containing `User`, `Submission`, `SubmissionTitle`, `Assignment`, `ValidatorFeedback`, `ApprovalLetter`, `Notification` models and `UserRole`, `SubmissionStatus`, `AssignmentStatus`, `FeedbackDecision`, `NotificationType` enums. Supporting MySQL / SQLite via environment `DATABASE_URL`.
- `backend/prisma/seed.ts`: Seed script populating default user accounts with hashed passwords:
  - Student: `student@university.edu` / `password123` (`STD001`)
  - Admin: `admin@university.edu` / `password123` (`ADM001`)
  - Validator 1: `validator1@university.edu` / `password123` (`VAL001`)
  - Validator 2: `validator2@university.edu` / `password123` (`VAL002`)
- `backend/package.json`: Updated with `"prisma": { "seed": "ts-node prisma/seed.ts" }`.
- `backend/tsconfig.build.json`: Configured to exclude `prisma` folder and `prisma.config.ts` during Nest compilation.
- `backend/src/prisma/prisma.service.ts`: Implemented NestJS `PrismaService` with `OnModuleInit` and `OnModuleDestroy` hooks.
- `backend/src/prisma/prisma.module.ts`: Implemented global `PrismaModule` decorated with `@Global()`.
- `backend/src/user/`:
  - `user.service.ts`: Provides `findByEmail`, `findById`, `create`, `findAll`, `findOne`, `update`, `remove`.
  - `user.controller.ts`: Exposes `/users`, `/users/me` with `JwtAuthGuard` and `RolesGuard`.
  - `user.module.ts`: Exports `UserService`.
  - `dto/create-user.dto.ts`, `dto/update-user.dto.ts`: Input validation DTOs.
- `backend/src/users/`: Compatibility exports for `UsersModule`, `UsersService`, `UsersController`.
- `backend/src/auth/`:
  - `auth.controller.ts`: Endpoints `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`. Returns standard response `{ success: true, data: { accessToken, refreshToken, user }, message: "..." }`.
  - `auth.service.ts`: Handles bcrypt password verification, JWT access token & refresh token generation and verification.
  - `auth.module.ts`: Registers `PassportModule`, `JwtModule`, `UserModule`, `JwtStrategy`, `JwtAuthGuard`, `RolesGuard`.
  - `guards/jwt-auth.guard.ts`: Extends Passport JWT guard, supporting `@Public()`.
  - `guards/roles.guard.ts`: Implements RBAC checking user roles against required roles from `@Roles()`.
  - `decorators/public.decorator.ts`: `@Public()` decorator for public endpoints.
  - `decorators/roles.decorator.ts`: `@Roles('STUDENT', 'ADMIN', 'VALIDATOR')`.
  - `decorators/current-user.decorator.ts`: `@CurrentUser()` and `@GetUser()` parameter decorators.
  - `dto/login.dto.ts`, `dto/refresh.dto.ts`: Request payload DTOs.
- `backend/src/app.module.ts`: Wired `PrismaModule`, `UserModule`, `AuthModule`, `SubmissionsModule`.
- `backend/src/auth/*.spec.ts`, `backend/src/user/*.spec.ts`: Unit tests for Auth and User modules.

### Verification Outputs

#### 1. Prisma Client Generation (`npx prisma generate`)
```
Environment variables loaded from .env
Prisma schema loaded from prisma\schema.prisma
✔ Generated Prisma Client (v5.22.0) to .\node_modules\@prisma\client in 164ms
```

#### 2. Backend Build (`npm run build`)
```
> backend@0.0.1 build
> nest build
Command exited with code 0.
```

#### 3. Test Suite Execution (`npm run test`)
```
PASS src/app.controller.spec.ts
PASS src/auth/guards/roles.guard.spec.ts
PASS src/prisma/prisma.service.spec.ts
PASS src/user/user.service.spec.ts
PASS src/auth/auth.controller.spec.ts
PASS src/auth/auth.service.spec.ts

Test Suites: 6 passed, 6 total
Tests:       20 passed, 20 total
Snapshots:   0 total
Time:        4.032 s
Ran all test suites.
```

## 2. Logic Chain

1. **Schema & Models**: `DATABASE_SCHEMA.md` defines 7 models (`User`, `Submission`, `SubmissionTitle`, `Assignment`, `ValidatorFeedback`, `ApprovalLetter`, `Notification`) and 5 enums. `backend/prisma/schema.prisma` implements these exact models and relation fields. `npx prisma generate` compiles the schema into `@prisma/client`.
2. **Seed Configuration**: `prisma/seed.ts` upserts default accounts using `bcrypt.hash("password123", 10)` for student, admin, and validator roles with required `universityId` values (`STD001`, `ADM001`, `VAL001`, `VAL002`). `package.json` configures `"prisma": { "seed": "ts-node prisma/seed.ts" }`.
3. **Database Integration**: `PrismaService` extends `PrismaClient` with `OnModuleInit` and `OnModuleDestroy` hooks, provided globally via `@Global()` in `PrismaModule`.
4. **User & Auth Architecture**: `UserService` handles database persistence for users and password hashing. `AuthService` leverages `UserService` and `@nestjs/jwt` to authenticate credentials, sign JWT access/refresh tokens, and refresh tokens. `AuthController` standardizes responses to `{ success: true, data: ..., message: ... }`.
5. **RBAC & Guards**: `JwtStrategy` validates JWT payloads and retrieves active users. `JwtAuthGuard` bypasses public endpoints annotated with `@Public()`. `RolesGuard` checks `@Roles(...)` metadata against `req.user.role`. Custom parameter decorators `@CurrentUser()` / `@GetUser()` inject the authenticated user profile into controller methods.
6. **Compilation & Testing**: TypeScript build compiles cleanly with zero errors. All unit tests covering `AuthService`, `AuthController`, `UserService`, and `RolesGuard` execute and pass cleanly.

## 3. Caveats
- No caveats. The implementation fully matches `DATABASE_SCHEMA.md`, `API_SPECIFICATION.md`, and `BUSINESS_RULES.md` without facade code or hardcoded test values.

## 4. Conclusion
Milestone 1 (Database Schema & Authentication Module) is complete, fully implemented, verified, and ready for downstream integration with Milestone 2 (Submissions & Review Workflow).

## 5. Verification Method

To independently verify the implementation:

1. Open terminal at `C:\Users\iyede\code\__lab__\skripsihub\backend`.
2. Run `npx prisma generate` — confirms Prisma schema valid and client generated.
3. Run `npm run build` — confirms NestJS application builds without TypeScript errors.
4. Run `npm run test` — confirms all 6 test suites and 20 tests pass.
