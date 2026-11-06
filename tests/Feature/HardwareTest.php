<?php

use App\Models\Hardware;
use App\Models\HardwareStatus;
use App\Models\UpdateRecord;
use App\Models\User;
use Inertia\Testing\AssertableInertia;

beforeEach(function () {
    $this->actingAs(User::factory()->create()->assignRole('staff'));
});

it('creates hardware and a creation update record', function () {
    $lookups = makeBranchLookups();

    $this->post('/hardwares', [
        'hardware_no' => 'HW-001',
        'hardware_serial_no' => 'SN-001',
        'assigned_user_id' => $lookups['assignedUser']->id,
        'hardware_type_id' => $lookups['hardwareType']->id,
        'hardware_status_id' => $lookups['hardwareStatus']->id,
    ])->assertRedirect(route('hardwares.index'));

    $hardware = Hardware::where('hardware_serial_no', 'SN-001')->firstOrFail();

    $this->assertDatabaseHas('update_records', [
        'hardware_id' => $hardware->id,
        'record_name' => 'Hardware Created',
    ]);
});

it('requires a hardware serial number when storing', function () {
    $lookups = makeBranchLookups();

    $this->post('/hardwares', [
        'hardware_no' => 'HW-001',
        'assigned_user_id' => $lookups['assignedUser']->id,
        'hardware_type_id' => $lookups['hardwareType']->id,
        'hardware_status_id' => $lookups['hardwareStatus']->id,
    ])->assertSessionHasErrors('hardware_serial_no');
});

it('rejects a duplicate serial number when storing', function () {
    $hardware = makeHardware();

    $this->post('/hardwares', [
        'hardware_no' => 'HW-002',
        'hardware_serial_no' => $hardware->hardware_serial_no,
        'assigned_user_id' => null,
        'hardware_type_id' => $hardware->hardware_type_id,
        'hardware_status_id' => $hardware->hardware_status_id,
    ])->assertSessionHasErrors('hardware_serial_no');
});

it('rejects another hardware serial on update and leaves the row unchanged', function () {
    $hardware = makeHardware();
    $other = makeHardware();

    $original = $hardware->fresh()->getAttributes();

    $this->put("/hardwares/{$hardware->id}", [
        'hardware_no' => $hardware->hardware_no,
        'hardware_serial_no' => $other->hardware_serial_no,
        'assigned_user_id' => $hardware->assigned_user_id,
        'hardware_type_id' => $hardware->hardware_type_id,
        'hardware_status_id' => $hardware->hardware_status_id,
    ])->assertSessionHasErrors('hardware_serial_no');

    expect($hardware->fresh()->getAttributes())->toEqual($original);
});

it('writes a hardware updated record when the status changes', function () {
    $lookups = makeBranchLookups();
    $hardware = makeHardware([
        'hardware_type_id' => $lookups['hardwareType']->id,
        'hardware_status_id' => $lookups['hardwareStatus']->id,
    ]);
    $newStatus = HardwareStatus::create(['hardware_status_name' => 'Under Repair']);

    $this->put("/hardwares/{$hardware->id}", [
        'hardware_no' => $hardware->hardware_no,
        'hardware_serial_no' => $hardware->hardware_serial_no,
        'assigned_user_id' => $lookups['assignedUser']->id,
        'hardware_type_id' => $hardware->hardware_type_id,
        'hardware_status_id' => $newStatus->id,
    ])->assertRedirect(route('hardwares.index'));

    $this->assertDatabaseHas('update_records', [
        'hardware_id' => $hardware->id,
        'record_name' => 'Hardware Updated',
    ]);
});

it('soft deletes hardware while preserving its update records', function () {
    $hardware = makeHardware();

    UpdateRecord::create([
        'record_name' => 'Hardware Created',
        'record_desc' => 'Created for the test.',
        'record_last_updated' => now(),
        'hardware_id' => $hardware->id,
    ]);
    UpdateRecord::create([
        'record_name' => 'Hardware Updated',
        'record_desc' => 'Updated for the test.',
        'record_last_updated' => now(),
        'hardware_id' => $hardware->id,
    ]);

    $this->delete("/hardwares/{$hardware->id}")
        ->assertRedirect(route('hardwares.index'));

    $deleted = Hardware::withTrashed()->find($hardware->id);

    expect($deleted)->not->toBeNull()
        ->and($deleted->deleted_at)->not->toBeNull()
        ->and(UpdateRecord::where('hardware_id', $hardware->id)->count())->toBe(3);
});
