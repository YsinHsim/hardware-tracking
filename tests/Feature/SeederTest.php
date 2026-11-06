<?php

use App\Models\Branch;
use App\Models\Hardware;
use App\Models\HardwareStatus;
use App\Models\HardwareType;
use App\Models\HardwareVerification;
use App\Models\Region;
use App\Models\User;
use App\Models\UserPosition;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Hash;

uses(RefreshDatabase::class);

it('seeds lookups accounts and the complete hardware verification workflow', function () {
    Artisan::call('db:seed', ['--force' => true]);

    expect(Region::count())->toBe(15)
        ->and(HardwareType::count())->toBe(6)
        ->and(HardwareStatus::count())->toBe(5)
        ->and(UserPosition::count())->toBe(6)
        ->and(Branch::count())->toBe(15)
        ->and(User::count() - 1)->toBe(12)
        ->and(User::role('manager')->count())->toBe(3)
        ->and(User::role('staff')->count())->toBe(9)
        ->and(User::where('status', 'suspended')->count())->toBe(1)
        ->and(User::whereNull('profile_completed_at')->count())->toBe(0)
        ->and(Hardware::withTrashed()->count())->toBe(51)
        ->and(Hardware::onlyTrashed()->count())->toBe(1);

    foreach (['pending', 'verified', 'changes_requested', 'rejected'] as $status) {
        expect(Hardware::where('verification_status', $status)->exists())->toBeTrue();
    }
    expect(Hardware::whereNull('submitted_by')->count())->toBe(0)
        ->and(HardwareVerification::where('status', 'verified')->whereNull('notes')->exists())->toBeTrue()
        ->and(HardwareVerification::whereIn('status', ['changes_requested', 'rejected'])->whereNull('notes')->exists())->toBeFalse()
        ->and(Hardware::whereHas('assignedUser', fn ($query) => $query->where('status', 'suspended'))->exists())->toBeFalse();
});

it('uses the configured demo password without exposing the admin password', function () {
    Artisan::call('db:seed', ['--force' => true]);

    $staff = User::role('staff')->where('status', 'active')->first();
    expect(Hash::check(env('DEMO_USER_PASSWORD', 'password'), $staff->password))->toBeTrue();
});

it('does not duplicate curated rows when seeded twice', function () {
    Artisan::call('db:seed', ['--force' => true]);
    Artisan::call('db:seed', ['--force' => true]);

    expect(Region::count())->toBe(15)
        ->and(HardwareType::count())->toBe(6)
        ->and(HardwareStatus::count())->toBe(5)
        ->and(UserPosition::count())->toBe(6)
        ->and(Branch::count())->toBe(15)
        ->and(User::count() - 1)->toBe(24)
        ->and(Hardware::withTrashed()->count())->toBe(102);
});

it('skips demo users and hardware when SEED_HARDWARE_COUNT is 0', function () {
    $originalEnv = $_ENV['SEED_HARDWARE_COUNT'] ?? null;
    $originalServer = $_SERVER['SEED_HARDWARE_COUNT'] ?? null;
    $_ENV['SEED_HARDWARE_COUNT'] = '0';
    $_SERVER['SEED_HARDWARE_COUNT'] = '0';
    putenv('SEED_HARDWARE_COUNT=0');

    try {
        Artisan::call('db:seed', ['--force' => true]);
    } finally {
        if ($originalEnv === null) {
            unset($_ENV['SEED_HARDWARE_COUNT']);
        } else {
            $_ENV['SEED_HARDWARE_COUNT'] = $originalEnv;
        }
        if ($originalServer === null) {
            unset($_SERVER['SEED_HARDWARE_COUNT']);
        } else {
            $_SERVER['SEED_HARDWARE_COUNT'] = $originalServer;
        }
        putenv('SEED_HARDWARE_COUNT');
    }

    expect(Region::count())->toBe(15)
        ->and(Branch::count())->toBe(15)
        ->and(User::count())->toBe(1)
        ->and(Hardware::count())->toBe(0);
});

it('skips the admin account when ADMIN_EMAIL is not configured', function () {
    $originalEnv = $_ENV['ADMIN_EMAIL'] ?? null;
    $originalServer = $_SERVER['ADMIN_EMAIL'] ?? null;
    unset($_ENV['ADMIN_EMAIL'], $_SERVER['ADMIN_EMAIL']);
    putenv('ADMIN_EMAIL');

    try {
        Artisan::call('db:seed', ['--force' => true]);
    } finally {
        if ($originalEnv !== null) {
            $_ENV['ADMIN_EMAIL'] = $originalEnv;
        }
        if ($originalServer !== null) {
            $_SERVER['ADMIN_EMAIL'] = $originalServer;
        }
    }

    expect(Region::count())->toBe(15)
        ->and(User::count())->toBe(12)
        ->and(Hardware::withTrashed()->count())->toBe(51);
});

it('seeds each branch under its matching region', function () {
    Artisan::call('db:seed', ['--force' => true]);

    $branch = Branch::where('branch_name', 'KK HQ Office')->firstOrFail();

    expect($branch->region->region_name)->toBe('Kota Kinabalu');
});
