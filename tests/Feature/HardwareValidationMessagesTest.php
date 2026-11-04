<?php

use App\Models\User;

beforeEach(function () {
    $this->actingAs(User::factory()->create());
});

it('uses the custom attribute name when a serial is required', function () {
    $lookups = makeBranchLookups();

    $this->post('/hardwares', [
        'hardware_no' => 'HW-VALIDATION-001',
        'assigned_user_id' => $lookups['assignedUser']->id,
        'hardware_type_id' => $lookups['hardwareType']->id,
        'hardware_status_id' => $lookups['hardwareStatus']->id,
    ])->assertSessionHasErrors([
        'hardware_serial_no' => 'The serial number field is required.',
    ]);
});

it('uses the custom attribute name for a duplicate serial', function () {
    $hardware = makeHardware();

    $this->post('/hardwares', [
        'hardware_no' => 'HW-VALIDATION-002',
        'hardware_serial_no' => $hardware->hardware_serial_no,
        'assigned_user_id' => null,
        'hardware_type_id' => $hardware->hardware_type_id,
        'hardware_status_id' => $hardware->hardware_status_id,
    ])->assertSessionHasErrors([
        'hardware_serial_no' => 'The serial number has already been taken.',
    ]);
});

it('uses the custom attribute name for a duplicate hardware number', function () {
    $hardware = makeHardware();

    $this->post('/hardwares', [
        'hardware_no' => $hardware->hardware_no,
        'hardware_serial_no' => 'SN-VALIDATION-UNIQUE',
        'assigned_user_id' => null,
        'hardware_type_id' => $hardware->hardware_type_id,
        'hardware_status_id' => $hardware->hardware_status_id,
    ])->assertSessionHasErrors([
        'hardware_no' => 'The hardware number has already been taken.',
    ]);
});

it('uses the custom attribute name for another hardware serial on update', function () {
    $hardware = makeHardware();
    $other = makeHardware();

    $this->put("/hardwares/{$hardware->id}", [
        'hardware_no' => $hardware->hardware_no,
        'hardware_serial_no' => $other->hardware_serial_no,
        'assigned_user_id' => $hardware->assigned_user_id,
        'hardware_type_id' => $hardware->hardware_type_id,
        'hardware_status_id' => $hardware->hardware_status_id,
    ])->assertSessionHasErrors([
        'hardware_serial_no' => 'The serial number has already been taken.',
    ]);
});

it('uses the custom attribute name for an invalid hardware type', function () {
    $lookups = makeBranchLookups();

    $this->post('/hardwares', [
        'hardware_no' => 'HW-VALIDATION-003',
        'hardware_serial_no' => 'SN-VALIDATION-003',
        'assigned_user_id' => null,
        'hardware_type_id' => 999999,
        'hardware_status_id' => $lookups['hardwareStatus']->id,
    ])->assertSessionHasErrors([
        'hardware_type_id' => 'The selected hardware type is invalid.',
    ]);
});
