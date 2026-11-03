<?php

use App\Models\AssignedUser;
use App\Models\Estate;
use App\Models\Hardware;
use App\Models\HardwareStatus;
use App\Models\HardwareType;
use App\Models\Region;
use App\Models\UserPosition;
use Illuminate\Foundation\Testing\RefreshDatabase;

pest()->extend(Tests\TestCase::class)
    ->use(RefreshDatabase::class)
    ->beforeEach(function () {
        $this->withoutVite();
    })
    ->in('Feature');

function makeLookups(): array
{
    $region = Region::create(['region_name' => 'West Coast']);
    $estate = Estate::create([
        'estate_name' => 'Test Estate',
        'region_id' => $region->id,
    ]);
    $position = UserPosition::create(['position_name' => 'Technician']);
    $hardwareType = HardwareType::create(['hardware_type_name' => 'Laptop']);
    $hardwareStatus = HardwareStatus::create(['hardware_status_name' => 'Active']);

    $assignedUser = AssignedUser::create([
        'user_name' => 'Ahmad',
        'user_position_id' => $position->id,
        'estate_id' => $estate->id,
    ]);

    return [
        'region' => $region,
        'estate' => $estate,
        'position' => $position,
        'hardwareType' => $hardwareType,
        'hardwareStatus' => $hardwareStatus,
        'assignedUser' => $assignedUser,
    ];
}

function makeHardware(array $overrides = []): Hardware
{
    static $sequence = 0;
    $sequence++;

    $typeId = $overrides['hardware_type_id'] ?? null;
    $statusId = $overrides['hardware_status_id'] ?? null;

    if ($typeId === null) {
        $typeId = HardwareType::create(['hardware_type_name' => 'Desktop ' . $sequence])->id;
    }

    if ($statusId === null) {
        $statusId = HardwareStatus::create(['hardware_status_name' => 'Status ' . $sequence])->id;
    }

    return Hardware::create(array_merge([
        'hardware_no' => 'HW-' . $sequence,
        'hardware_serial_no' => 'SN-' . $sequence,
        'assigned_user_id' => null,
        'hardware_type_id' => $typeId,
        'hardware_status_id' => $statusId,
    ], $overrides));
}
