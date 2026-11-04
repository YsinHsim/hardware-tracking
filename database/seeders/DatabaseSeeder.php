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
     * Always seeds the curated lookups and branches. The admin account
     * comes from .env and is skipped with a warning when its
     * credentials are not configured. Demo users and hardware are
     * gated by SEED_HARDWARE_COUNT so a production-style install can
     * seed lookups only by setting it to 0.
     */
    public function run(): void
    {
        $this->call([
            LookupSeeder::class,
            BranchSeeder::class,
        ]);

        $name = env('ADMIN_NAME', 'Administrator');
        $email = env('ADMIN_EMAIL');
        $password = env('ADMIN_PASSWORD');

        if (empty($email) || empty($password)) {
            $this->command->warn('ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env to seed the admin account. Skipped.');
        } else {
            User::updateOrCreate(
                ['email' => $email],
                ['name' => $name, 'password' => $password]
            );

            $this->command->info("Admin account seeded for {$email}.");
        }

        $hardwareCount = (int) env('SEED_HARDWARE_COUNT', 50);

        if ($hardwareCount > 0) {
            AssignedUser::factory()->count(12)->create();
            Hardware::factory()->count($hardwareCount)->create();
            Hardware::factory()->softDeleted()->create();

            $this->command->info("Seeded 12 assigned users, {$hardwareCount} hardware and 1 soft-deleted hardware.");
        }
    }
}
