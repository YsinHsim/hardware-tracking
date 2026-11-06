<?php

use App\Models\Region;
use App\Models\User;

beforeEach(function () {
    $this->actingAs(User::factory()->create());
});

it('uses the readable position attribute when completing onboarding without a position', function () {
    $lookups = makeBranchLookups();
    $this->actingAs(User::factory()->create(['profile_completed_at' => null]));

    $this->put('/onboarding', [
        'name' => 'Validation User',
        'password' => 'new-password-123',
        'password_confirmation' => 'new-password-123',
        'branch_id' => $lookups['branch']->id,
    ])->assertSessionHasErrors([
        'user_position_id' => 'The position field is required.',
    ]);
});

it('uses the readable region attribute for a non-existent branch region', function () {
    $this->post('/branches', [
        'branch_name' => 'Validation Branch',
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
