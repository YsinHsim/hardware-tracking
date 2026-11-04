<?php

use App\Models\Region;
use App\Models\User;

beforeEach(function () {
    $this->actingAs(User::factory()->create());
});

it('uses the readable position attribute when storing a user without a position', function () {
    $lookups = makeLookups();

    $this->post('/users', [
        'user_name' => 'Validation User',
        'estate_id' => $lookups['estate']->id,
    ])->assertSessionHasErrors([
        'user_position_id' => 'The position field is required.',
    ]);
});

it('uses the readable region attribute for a non-existent estate region', function () {
    $this->post('/estates', [
        'estate_name' => 'Validation Estate',
        'region_id' => 999999,
    ])->assertSessionHasErrors([
        'region_id' => 'The selected region is invalid.',
    ]);
});

it('uses the readable region name attribute for a duplicate region', function () {
    Region::create(['region_name' => 'Existing Region']);

    $this->post('/regions', [
        'region_name' => 'Existing Region',
    ])->assertSessionHasErrors([
        'region_name' => 'The region name has already been taken.',
    ]);
});
