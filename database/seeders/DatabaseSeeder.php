<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $name = env('ADMIN_NAME', 'Administrator');
        $email = env('ADMIN_EMAIL');
        $password = env('ADMIN_PASSWORD');

        if (empty($email) || empty($password)) {
            $this->command->error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env to seed the admin account.');

            return;
        }

        User::updateOrCreate(
            ['email' => $email],
            ['name' => $name, 'password' => $password]
        );

        $this->command->info("Admin account seeded for {$email}.");
    }
}
