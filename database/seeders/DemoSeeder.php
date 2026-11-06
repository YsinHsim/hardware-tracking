<?php

namespace Database\Seeders;

use App\Models\Branch;
use App\Models\Hardware;
use App\Models\HardwareStatus;
use App\Models\HardwareType;
use App\Models\HardwareVerification;
use App\Models\UpdateRecord;
use App\Models\User;
use App\Models\UserPosition;
use Illuminate\Database\Seeder;

class DemoSeeder extends Seeder
{
    public function run(): void
    {
        $hardwareCount = (int) env('SEED_HARDWARE_COUNT', 50);
        if ($hardwareCount < 1) {
            return;
        }

        $branches = Branch::all();
        $positions = UserPosition::all();
        $types = HardwareType::all();
        $statuses = HardwareStatus::all();
        $admin = User::role('superadmin')->first();
        $password = env('DEMO_USER_PASSWORD', 'password');

        $managers = collect(range(1, 3))->map(fn () => User::factory()->create([
            'branch_id' => $branches->random()->id,
            'user_position_id' => $positions->where('position_name', 'Manager')->first()->id,
            'password' => \Illuminate\Support\Facades\Hash::make($password),
        ])->assignRole('manager'));

        $staff = collect(range(1, 9))->map(fn () => User::factory()->create([
            'branch_id' => $branches->random()->id,
            'user_position_id' => $positions->random()->id,
            'password' => \Illuminate\Support\Facades\Hash::make($password),
        ])->assignRole('staff'));
        $staff->last()->update(['status' => 'suspended']);
        $activeStaff = $staff->slice(0, -1)->values();

        $hardwareOffset = Hardware::withTrashed()->count();
        $states = collect(range(0, $hardwareCount - 1))->map(fn ($index) => match (true) {
            $index === 0 => 'pending',
            $index === 1 => 'verified',
            $index === 2 => 'changes_requested',
            $index === 3 => 'rejected',
            default => fake()->randomElement(['pending', 'verified', 'verified', 'changes_requested', 'rejected']),
        });

        foreach ($states as $index => $state) {
            $assignee = $activeStaff->random();
            $hardware = Hardware::create([
                'hardware_no' => sprintf('HW-%04d', $hardwareOffset + $index + 1),
                'hardware_serial_no' => 'SN-' . strtoupper(fake()->unique()->bothify('??######')),
                'assigned_user_id' => $assignee->id,
                'hardware_type_id' => $types->random()->id,
                'hardware_status_id' => $statuses->random()->id,
                'verification_status' => $state,
                'submitted_by' => $assignee->id,
            ]);
            UpdateRecord::create([
                'record_name' => 'Hardware Submitted',
                'record_desc' => "Hardware (No: {$hardware->hardware_no}) was submitted for verification.",
                'record_last_updated' => now()->subDays(10),
                'hardware_id' => $hardware->id,
                'user_id' => $assignee->id,
            ]);

            if ($state === 'pending') {
                continue;
            }

            $reviewer = $managers->firstWhere('branch_id', $assignee->branch_id) ?? $admin ?? $managers->first();
            HardwareVerification::create([
                'hardware_id' => $hardware->id,
                'reviewer_id' => $reviewer?->id,
                'status' => $state,
                'notes' => match ($state) {
                    'changes_requested' => 'Please check the serial number and update the hardware condition.',
                    'rejected' => 'This submission does not match the branch asset records.',
                    default => null,
                },
                'created_at' => now()->subDays(5),
                'updated_at' => now()->subDays(5),
            ]);
        }

        Hardware::factory()->softDeleted()->create([
            'hardware_no' => sprintf('HW-%04d', $hardwareOffset + $hardwareCount + 1),
            'assigned_user_id' => $activeStaff->first()->id,
            'verification_status' => 'rejected',
            'submitted_by' => $activeStaff->first()->id,
        ]);

        $this->command->info("Seeded 12 accounts, {$hardwareCount} hardware and 1 soft-deleted hardware.");
    }
}
