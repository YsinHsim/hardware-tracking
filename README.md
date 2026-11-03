# hardware-tracking
 Web application that track and manage IT hardwares across all estates.





## Instruction to developer
1. Run `composer install`
2. Run `npm install`
3. Copy the environment file: `cp .env.example .env`
4. Generate the application key: `php artisan key:generate`
5. Set the `DB_*` and `ADMIN_*` values in `.env`
6. Run `php artisan migrate`
7. Run `php artisan db:seed`
8. Start the application with `php artisan serve` and `npm run dev`

The admin password lives only in `.env` and should be strong.
__________________________________________________