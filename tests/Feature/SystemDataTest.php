<?php

use App\Models\HardwareType;
use App\Models\User;

beforeEach(function () {
    $this->actingAs(User::factory()->create()->assignRole('staff'));
});

it('updates a hardware type name', function () {
    $type = HardwareType::create(['hardware_type_name' => 'Laptop']);

    $this->put("/system-data/hardware_types/{$type->id}", [
        'hardware_type_name' => 'Notebook',
    ])->assertRedirect(route('system-data.index'));

    $this->assertDatabaseHas('hardware_types', [
        'id' => $type->id,
        'hardware_type_name' => 'Notebook',
    ]);
});

it('rejects an empty hardware type name', function () {
    $type = HardwareType::create(['hardware_type_name' => 'Laptop']);

    $this->put("/system-data/hardware_types/{$type->id}", [
        'hardware_type_name' => '',
    ])->assertSessionHasErrors('hardware_type_name');

    $this->assertDatabaseHas('hardware_types', [
        'id' => $type->id,
        'hardware_type_name' => 'Laptop',
    ]);
});

it('returns 400 when storing an unknown type', function () {
    $this->post('/system-data/unknown', ['name' => 'Anything'])
        ->assertStatus(400);
});
