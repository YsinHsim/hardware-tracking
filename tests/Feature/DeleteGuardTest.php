<?php

use App\Models\Branch;
use App\Models\HardwareType;
use App\Models\Region;
use App\Models\User;

beforeEach(function () {
    $this->actingAs(User::factory()->create());
});

it('refuses to delete an branch with one assigned user', function () {
    $lookups = makeBranchLookups();
    $branch = $lookups['branch'];

    $this->from('/branches')->delete("/branches/{$branch->id}")
        ->assertRedirect('/branches')
        ->assertSessionHasErrors('delete');
    expect(session('errors')->first('delete'))->toContain('1 assigned user still belongs');

    $this->assertDatabaseHas('branches', ['id' => $branch->id]);
});

it('refuses to delete a hardware type with two hardware', function () {
    $lookups = makeBranchLookups();
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
    $lookups = makeBranchLookups();
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

it('refuses to delete a region with branches', function () {
    $lookups = makeBranchLookups();
    $region = $lookups['region'];

    $this->from('/regions')->delete("/regions/{$region->id}")
        ->assertRedirect('/regions')
        ->assertSessionHasErrors('delete');
    expect(session('errors')->first('delete'))->toContain('1 branch still belongs');

    $this->assertDatabaseHas('regions', ['id' => $region->id]);
});

it('deletes an branch with no assigned users', function () {
    $region = Region::create(['region_name' => 'Empty Region']);
    $branch = Branch::create([
        'branch_name' => 'Empty Branch',
        'region_id' => $region->id,
    ]);

    $this->delete("/branches/{$branch->id}")
        ->assertRedirect(route('branches.index'));

    $this->assertDatabaseMissing('branches', ['id' => $branch->id]);
});
