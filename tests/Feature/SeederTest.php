<?php

use App\Models\AssignedUser;
use App\Models\Estate;
use App\Models\Hardware;
use App\Models\HardwareStatus;
use App\Models\HardwareType;
use App\Models\Region;
use App\Models\UserPosition;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Artisan;

uses(RefreshDatabase::class);

it('seeds lookups, estates and demo data with hardware count 50', function () {
    Artisan::call('db:seed', ['--force' => true]);

    expect(Region::count())->toBe(15)
        ->and(HardwareType::count())->toBe(6)
        ->and(HardwareStatus::count())->toBe(5)
        ->and(UserPosition::count())->toBe(6)
        ->and(Estate::count())->toBe(15)
        ->and(AssignedUser::count())->toBe(12)
        ->and(Hardware::withTrashed()->count())->toBe(51)
        ->and(Hardware::onlyTrashed()->count())->toBe(1)
        ->and(Hardware::count() === Hardware::withTrashed()->count())->toBeFalse();

    // Unique columns stay unique across the batch.
    $hardwareNos = Hardware::withTrashed()->pluck('hardware_no');
    $serialNos = Hardware::withTrashed()->pluck('hardware_serial_no');
    expect($hardwareNos->unique()->count())->toBe($hardwareNos->count())
        ->and($serialNos->unique()->count())->toBe($serialNos->count());

    // Every hardware has history entries with no signed-in user.
    expect(Hardware::withTrashed()->get()->every(fn ($hardware) => $hardware->updateRecords()->count() >= 1))->toBeTrue()
        ->and(\App\Models\UpdateRecord::whereNotNull('user_id')->count())->toBe(0);
});

it('does not duplicate curated rows when seeded twice', function () {
    Artisan::call('db:seed', ['--force' => true]);
    Artisan::call('db:seed', ['--force' => true]);

    expect(Region::count())->toBe(15)
        ->and(HardwareType::count())->toBe(6)
        ->and(HardwareStatus::count())->toBe(5)
        ->and(UserPosition::count())->toBe(6)
        ->and(Estate::count())->toBe(15)
        ->and(AssignedUser::count())->toBe(24)
        ->and(Hardware::withTrashed()->count())->toBe(102);
});

it('skips demo users and hardware when SEED_HARDWARE_COUNT is 0', function () {
    // env() reads $_ENV/$_SERVER before the process environment, so all
    // three layers must be set for the gate to see the override.
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
        ->and(Estate::count())->toBe(15)
        ->and(AssignedUser::count())->toBe(0)
        ->and(Hardware::count())->toBe(0);
});

it('skips the admin account when ADMIN_EMAIL is not configured', function () {
    // env() reads $_ENV/$_SERVER before the process environment, so all
    // three layers must be cleared to simulate an unconfigured admin.
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

    expect(\App\Models\User::count())->toBe(0)
        ->and(Region::count())->toBe(15)
        ->and(AssignedUser::count())->toBe(12)
        ->and(Hardware::withTrashed()->count())->toBe(51);
});

it('seeds each estate under its matching region', function () {
    Artisan::call('db:seed', ['--force' => true]);

    $estate = Estate::where('estate_name', 'KK HQ Office')->firstOrFail();

    expect($estate->region->region_name)->toBe('Kota Kinabalu');
});
