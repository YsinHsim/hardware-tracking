<?php

use App\Models\AssignedUser;
use App\Models\Estate;
use App\Models\HardwareType;
use App\Models\Region;
use App\Models\User;

beforeEach(function () {
    $this->actingAs(User::factory()->create());
});

it('refuses to delete an estate with one assigned user', function () {
    $lookups = makeLookups();
    $estate = $lookups['estate'];

    $this->from('/estates')->delete("/estates/{$estate->id}")
        ->assertRedirect('/estates')
        ->assertSessionHasErrors('delete');
    expect(session('errors')->first('delete'))->toContain('1 assigned user still belongs');

    $this->assertDatabaseHas('estates', ['id' => $estate->id]);
});

it('refuses to delete a hardware type with two hardware', function () {
    $lookups = makeLookups();
    $type = $lookups['hardwareType'];

    makeHardware(['hardware_type_id' => $type->id, 'hardware_status_id' => $lookups['hardwareStatus']->id]);
    makeHardware(['hardware_type_id' => $type->id, 'hardware_status_id' => $lookups['hardwareStatus']->id]);

    $this->from('/system-data')->delete("/system-data/hardware_types/{$type->id}")
        ->assertRedirect('/system-data')
        ->assertSessionHasErrors('delete');
    expect(session('errors')->first('delete'))->toContain('2 hardware records still belong');

    $this->assertDatabaseHas('hardware_types', ['id' => $type->id]);
});

it('refuses to delete a hardware type whose only hardware is soft deleted', function () {
    $lookups = makeLookups();
    $type = $lookups['hardwareType'];
    $hardware = makeHardware([
        'hardware_type_id' => $type->id,
        'hardware_status_id' => $lookups['hardwareStatus']->id,
    ]);
    $hardware->delete();

    $this->from('/system-data')->delete("/system-data/hardware_types/{$type->id}")
        ->assertRedirect('/system-data')
        ->assertSessionHasErrors('delete');
    expect(session('errors')->first('delete'))->toContain('(including deleted hardware)');

    $this->assertDatabaseHas('hardware_types', ['id' => $type->id]);
});

it('refuses to delete a region with estates', function () {
    $lookups = makeLookups();
    $region = $lookups['region'];

    $this->from('/regions')->delete("/regions/{$region->id}")
        ->assertRedirect('/regions')
        ->assertSessionHasErrors('delete');
    expect(session('errors')->first('delete'))->toContain('1 estate still belongs');

    $this->assertDatabaseHas('regions', ['id' => $region->id]);
});

it('deletes an estate with no assigned users', function () {
    $region = Region::create(['region_name' => 'Empty Region']);
    $estate = Estate::create([
        'estate_name' => 'Empty Estate',
        'region_id' => $region->id,
    ]);

    $this->delete("/estates/{$estate->id}")
        ->assertRedirect(route('estates.index'));

    $this->assertDatabaseMissing('estates', ['id' => $estate->id]);
});
