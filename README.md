# hardware-tracking

Web application that tracks and manages IT hardware across all estates.

## Stack

- **Backend:** Laravel 13, Inertia 2, MySQL/MariaDB locally
- **Frontend:** React 19, Tailwind CSS 4, shadcn/ui (JS mode), lucide-react, Motion, sonner, next-themes
- **Tests:** Pest on in-memory SQLite (never touches MySQL)

## Setup

1. Run `composer install`
2. Run `npm install`
3. Copy the environment file: `cp .env.example .env`
4. Generate the application key: `php artisan key:generate`
5. Set the `DB_*` and `ADMIN_*` values in `.env`
6. Run `php artisan migrate`
7. Run `php artisan db:seed`
8. Start the application with `php artisan serve` and `npm run dev`

The admin password lives only in `.env` and should be strong. `SEED_HARDWARE_COUNT=0` seeds only lookups and the admin. Otherwise, demo accounts use `DEMO_USER_PASSWORD` (default `password`); change it before seeding and never use the demo default outside local development.

To replace a local database and its demo data, run `php artisan migrate:fresh --seed`. **This permanently wipes all tables in the configured database. Back up first and never run it against production.**

## Deployment checklist

For a fresh server or a release that includes the invited-onboarding / hardware-verification work:

1. **Back up** the existing database before any migration.
2. `composer install --no-dev --optimize-autoloader`
3. `npm ci && npm run build`
4. Set production `.env`:
   - `APP_ENV=production`, `APP_DEBUG=false`, `APP_URL=https://…`
   - Strong `ADMIN_PASSWORD` (superadmin bootstrap)
   - `SEED_HARDWARE_COUNT=0` — never seed demo accounts or demo hardware in production
   - Real `MAIL_*` settings so invitation emails and verification notifications actually send
   - Real `DB_*` credentials
5. `php artisan key:generate` (first deploy only)
6. `php artisan migrate --force` — runs all pending migrations including:
   - `2026_11_05_120000_add_invitations_and_hardware_verification.php`
   - `2026_11_06_120000_assign_hardware_to_user_accounts.php`
7. `php artisan db:seed --force` — seeds lookups, branches, roles/permissions, and the superadmin. Skipped if `SEED_HARDWARE_COUNT=0` only controls demo rows.
8. `php artisan config:cache && php artisan route:cache && php artisan view:cache`
9. Point the web server at `public/` and verify:
   - Login as the seeded superadmin
   - Invite a user from **Admin → Users** and confirm the email arrives and the link works
   - Submit hardware from **My Hardware**, then review it from **Verification** as a manager in the same branch
10. Smoke-test the full onboarding flow once in production (invitation → password set → profile completion → first login).

**Never** run `php artisan migrate:fresh` against production. It drops every table.

## Tests

Run the full suite before every commit. `phpunit.xml` forces SQLite `:memory:`, so tests never touch MySQL:

```sh
php artisan test
```

Run a build whenever anything under `resources/` changed:

```sh
npm run build
```

## CI

GitHub Actions runs `php artisan test` and `npm run build` on every push and pull request targeting `team` or `redesign` (`.github/workflows/ci.yml`).

## Project conventions

See `AGENTS.md` for the branch model (`team` default, `redesign` integration), commit style (Conventional Commits), UI patterns, database gotchas, and the review queue in `docs/REVIEW_QUEUE.md`.
