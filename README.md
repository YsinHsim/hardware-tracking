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
