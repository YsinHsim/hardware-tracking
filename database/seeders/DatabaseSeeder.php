<?php

namespace Database\Seeders;

use App\Models\AssignedUser;
use App\Models\Hardware;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * Always seeds the admin account (from .env) and the curated
     * lookups. Demo users and hardware are gated by
     * SEED_HARDWARE_COUNT so a production-style install can seed
     * lookups only by setting it to 0.
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

        $this->call([
            LookupSeeder::class,
            EstateSeeder::class,
        ]);

        $hardwareCount = (int) env('SEED_HARDWARE_COUNT', 50);

        if ($hardwareCount > 0) {
            AssignedUser::factory()->count(12)->create();
            Hardware::factory()->count($hardwareCount)->create();
            Hardware::factory()->softDeleted()->create();

            $this->command->info("Seeded 12 assigned users, {$hardwareCount} hardware and 1 soft-deleted hardware.");
        }
    }
}
