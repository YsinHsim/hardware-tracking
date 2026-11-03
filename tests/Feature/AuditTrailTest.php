<?php

use App\Models\Hardware;
use App\Models\HardwareStatus;
use App\Models\HardwareType;
use App\Models\UpdateRecord;
use App\Models\User;
use Inertia\Testing\AssertableInertia;

it('stores the signed-in user on create, update, and delete records', function () {
    $user = User::factory()->create();
    $this->actingAs($user);
    $lookups = makeLookups();

    $this->post('/hardwares', [
        'hardware_no' => 'HW-AUDIT',
        'hardware_serial_no' => 'SN-AUDIT',
        'assigned_user_id' => $lookups['assignedUser']->id,
        'hardware_type_id' => $lookups['hardwareType']->id,
        'hardware_status_id' => $lookups['hardwareStatus']->id,
    ])->assertRedirect(route('hardwares.index'));

    $hardware = Hardware::where('hardware_serial_no', 'SN-AUDIT')->firstOrFail();

    $this->put("/hardwares/{$hardware->id}", [
        'hardware_no' => $hardware->hardware_no,
        'hardware_serial_no' => $hardware->hardware_serial_no,
        'assigned_user_id' => $lookups['assignedUser']->id,
        'hardware_type_id' => $hardware->hardware_type_id,
        'hardware_status_id' => HardwareStatus::create(['hardware_status_name' => 'Audit Status'])->id,
    ])->assertRedirect(route('hardwares.index'));

    $this->delete("/hardwares/{$hardware->id}")->assertRedirect(route('hardwares.index'));

    expect(UpdateRecord::where('hardware_id', $hardware->id)->count())->toBe(3)
        ->and(UpdateRecord::where('hardware_id', $hardware->id)->where('user_id', $user->id)->count())->toBe(3);
});

it('writes hardware status names instead of raw ids', function () {
    $this->actingAs(User::factory()->create());
    $lookups = makeLookups();
    $hardware = makeHardware([
        'hardware_type_id' => $lookups['hardwareType']->id,
        'hardware_status_id' => $lookups['hardwareStatus']->id,
    ]);
    $newStatus = HardwareStatus::create(['hardware_status_name' => 'Under Repair']);

    $this->put("/hardwares/{$hardware->id}", [
        'hardware_no' => $hardware->hardware_no,
        'hardware_serial_no' => $hardware->hardware_serial_no,
        'assigned_user_id' => $hardware->assigned_user_id,
        'hardware_type_id' => $hardware->hardware_type_id,
        'hardware_status_id' => $newStatus->id,
    ])->assertRedirect(route('hardwares.index'));

    $this->assertDatabaseHas('update_records', [
        'hardware_id' => $hardware->id,
        'record_desc' => "Hardware (No: {$hardware->hardware_no}) was updated. Hardware status changed from '{$lookups['hardwareStatus']->hardware_status_name}' to 'Under Repair'",
    ]);
});

it('writes hardware type names instead of raw ids', function () {
    $this->actingAs(User::factory()->create());
    $lookups = makeLookups();
    $hardware = makeHardware([
        'hardware_type_id' => $lookups['hardwareType']->id,
        'hardware_status_id' => $lookups['hardwareStatus']->id,
    ]);
    $newType = HardwareType::create(['hardware_type_name' => 'Workstation']);

    $this->put("/hardwares/{$hardware->id}", [
        'hardware_no' => $hardware->hardware_no,
        'hardware_serial_no' => $hardware->hardware_serial_no,
        'assigned_user_id' => $hardware->assigned_user_id,
        'hardware_type_id' => $newType->id,
        'hardware_status_id' => $hardware->hardware_status_id,
    ])->assertRedirect(route('hardwares.index'));

    $this->assertDatabaseHas('update_records', [
        'hardware_id' => $hardware->id,
        'record_desc' => "Hardware (No: {$hardware->hardware_no}) was updated. Hardware type changed from '{$lookups['hardwareType']->hardware_type_name}' to 'Workstation'",
    ]);
});

it('writes the previous assigned user name and Unassigned when unassigning', function () {
    $this->actingAs(User::factory()->create());
    $lookups = makeLookups();
    $hardware = makeHardware([
        'assigned_user_id' => $lookups['assignedUser']->id,
        'hardware_type_id' => $lookups['hardwareType']->id,
        'hardware_status_id' => $lookups['hardwareStatus']->id,
    ]);

    $this->put("/hardwares/{$hardware->id}", [
        'hardware_no' => $hardware->hardware_no,
        'hardware_serial_no' => $hardware->hardware_serial_no,
        'assigned_user_id' => null,
        'hardware_type_id' => $hardware->hardware_type_id,
        'hardware_status_id' => $hardware->hardware_status_id,
    ])->assertRedirect(route('hardwares.index'));

    $this->assertDatabaseHas('update_records', [
        'hardware_id' => $hardware->id,
        'record_desc' => "Hardware (No: {$hardware->hardware_no}) was updated. Assigned user changed from '{$lookups['assignedUser']->user_name}' to 'Unassigned'",
    ]);
});

it('keeps update records and clears user_id when the login user is deleted', function () {
    $user = User::factory()->create();
    $this->actingAs($user);
    $lookups = makeLookups();

    $this->post('/hardwares', [
        'hardware_no' => 'HW-USER-DELETE',
        'hardware_serial_no' => 'SN-USER-DELETE',
        'assigned_user_id' => $lookups['assignedUser']->id,
        'hardware_type_id' => $lookups['hardwareType']->id,
        'hardware_status_id' => $lookups['hardwareStatus']->id,
    ]);

    $hardware = Hardware::where('hardware_serial_no', 'SN-USER-DELETE')->firstOrFail();
    $record = UpdateRecord::where('hardware_id', $hardware->id)->firstOrFail();
    expect($record->user_id)->toBe($user->id);

    $user->delete();
    $record->refresh();

    expect(UpdateRecord::find($record->id))->not->toBeNull()
        ->and($record->user_id)->toBeNull();
});

it('passes history user names without email to the show page', function () {
    $user = User::factory()->create();
    $this->actingAs($user);
    $lookups = makeLookups();

    $this->post('/hardwares', [
        'hardware_no' => 'HW-SHOW-AUDIT',
        'hardware_serial_no' => 'SN-SHOW-AUDIT',
        'assigned_user_id' => $lookups['assignedUser']->id,
        'hardware_type_id' => $lookups['hardwareType']->id,
        'hardware_status_id' => $lookups['hardwareStatus']->id,
    ]);

    $hardware = Hardware::where('hardware_serial_no', 'SN-SHOW-AUDIT')->firstOrFail();

    $this->get("/hardwares/{$hardware->id}")
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('Hardwares/Show')
            ->where('hardware.update_records.0.user.name', $user->name)
            ->missing('hardware.update_records.0.user.email')
            ->missing('hardware.update_records.0.user.password'));
});
