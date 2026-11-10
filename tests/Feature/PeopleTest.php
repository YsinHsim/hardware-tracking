<?php

use App\Models\Branch;
use App\Models\Hardware;
use App\Models\Region;
use App\Models\User;
use Inertia\Testing\AssertableInertia;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    Role::findByName('manager')->givePermissionTo(['users.view', 'hardware.view']);
});

function makePerson(array $overrides = []): User
{
    return User::factory()->create(array_merge([
        'profile_completed_at' => now(),
    ], $overrides));
}

it('shows the people directory to users with users.view', function () {
    $lookups = makeBranchLookups();
    $person = makePerson(['branch_id' => $lookups['branch']->id, 'user_position_id' => $lookups['position']->id]);
    $manager = makePerson(['branch_id' => $lookups['branch']->id])->assignRole('manager');

    $this->actingAs($manager)->get('/people')
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('People/Index')
            ->where('canViewAllBranches', false)
            ->has('people', 3) // assignedUser (Ahmad) + person + manager
        );
});

it('denies the people directory to users without users.view', function () {
    $user = makePerson()->assignRole('staff');
    Role::findByName('staff')->revokePermissionTo('users.view');

    $this->actingAs($user)->get('/people')->assertForbidden();
});

it('scopes the people directory to the viewer branch for non-superadmins', function () {
    $lookups = makeBranchLookups();
    $otherRegion = Region::create(['region_name' => 'Other']);
    $otherBranch = Branch::create(['branch_name' => 'Other', 'region_id' => $otherRegion->id]);

    $inBranch = makePerson(['name' => 'In Branch', 'branch_id' => $lookups['branch']->id]);
    $outBranch = makePerson(['name' => 'Out Branch', 'branch_id' => $otherBranch->id]);
    $manager = makePerson(['branch_id' => $lookups['branch']->id])->assignRole('manager');

    $this->actingAs($manager)->get('/people')
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->has('people', 3) // assignedUser (Ahmad) + inBranch + manager, outBranch excluded
            ->where('people', function ($people) {
                $names = collect($people)->pluck('name');
                return $names->contains('Ahmad')
                    && $names->contains('In Branch')
                    && ! $names->contains('Out Branch');
            })
        );
});

it('shows all branches to superadmins', function () {
    $lookups = makeBranchLookups();
    $otherRegion = Region::create(['region_name' => 'Other']);
    $otherBranch = Branch::create(['branch_name' => 'Other', 'region_id' => $otherRegion->id]);
    makePerson(['branch_id' => $lookups['branch']->id]);
    makePerson(['branch_id' => $otherBranch->id]);
    $admin = makePerson()->assignRole('superadmin');

    $this->actingAs($admin)->get('/people')
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('canViewAllBranches', true)
            ->has('people', 4) // assignedUser + 2 persons + admin
        );
});

it('searches people by name or email', function () {
    $lookups = makeBranchLookups();
    makePerson(['name' => 'Alpha User', 'email' => 'alpha@example.test', 'branch_id' => $lookups['branch']->id]);
    makePerson(['name' => 'Beta User', 'email' => 'beta@example.test', 'branch_id' => $lookups['branch']->id]);
    $manager = makePerson(['branch_id' => $lookups['branch']->id])->assignRole('manager');

    $this->actingAs($manager)->get('/people?search=alpha')
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->has('people', 1)
            ->where('people.0.name', 'Alpha User')
        );

    $this->actingAs($manager)->get('/people?search=beta%40')
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->has('people', 1)
            ->where('people.0.name', 'Beta User')
        );
});

it('shows a person profile with their assigned hardware', function () {
    $lookups = makeBranchLookups();
    $person = makePerson([
        'name' => 'Holder',
        'branch_id' => $lookups['branch']->id,
        'user_position_id' => $lookups['position']->id,
    ]);
    $manager = makePerson(['branch_id' => $lookups['branch']->id])->assignRole('manager');

    $hardware = makeHardware([
        'hardware_no' => 'HW-HELD',
        'hardware_serial_no' => 'SN-HELD',
        'assigned_user_id' => $person->id,
        'verification_status' => 'verified',
        'hardware_type_id' => $lookups['hardwareType']->id,
        'hardware_status_id' => $lookups['hardwareStatus']->id,
    ]);

    $this->actingAs($manager)->get("/people/{$person->id}")
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('People/Show')
            ->where('person.name', 'Holder')
            ->where('person.branch.name', $lookups['branch']->branch_name)
            ->where('person.branch.region', $lookups['region']->region_name)
            ->where('person.position', $lookups['position']->position_name)
            ->where('isSelf', false)
            ->has('hardware', 1)
            ->where('hardware.0.hardware_no', 'HW-HELD')
            ->where('hardware.0.verification_status', 'verified')
        );
});

it('blocks a manager from viewing someone in another branch', function () {
    $lookups = makeBranchLookups();
    $otherRegion = Region::create(['region_name' => 'Other']);
    $otherBranch = Branch::create(['branch_name' => 'Other', 'region_id' => $otherRegion->id]);
    $person = makePerson(['branch_id' => $otherBranch->id]);
    $manager = makePerson(['branch_id' => $lookups['branch']->id])->assignRole('manager');

    $this->actingAs($manager)->get("/people/{$person->id}")->assertForbidden();
});

it('lets anyone view their own profile without users.view', function () {
    $user = makePerson()->assignRole('staff');
    Role::findByName('staff')->revokePermissionTo('users.view');

    $this->actingAs($user)->get("/people/{$user->id}")
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('isSelf', true)
            ->where('person.id', $user->id)
        );
});

it('lets a superadmin view anyone across branches', function () {
    $lookups = makeBranchLookups();
    $person = makePerson(['branch_id' => $lookups['branch']->id]);
    $admin = makePerson()->assignRole('superadmin');

    $this->actingAs($admin)->get("/people/{$person->id}")
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('person.id', $person->id)
        );
});

it('counts only active hardware on the people index', function () {
    $lookups = makeBranchLookups();
    $person = makePerson(['name' => 'Holder', 'branch_id' => $lookups['branch']->id]);
    $manager = makePerson(['branch_id' => $lookups['branch']->id])->assignRole('manager');

    makeHardware(['assigned_user_id' => $person->id, 'hardware_type_id' => $lookups['hardwareType']->id, 'hardware_status_id' => $lookups['hardwareStatus']->id]);
    $deleted = makeHardware(['assigned_user_id' => $person->id, 'hardware_type_id' => $lookups['hardwareType']->id, 'hardware_status_id' => $lookups['hardwareStatus']->id]);
    $deleted->delete();

    $this->actingAs($manager)->get('/people')
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('people', function ($people) {
                $holder = collect($people)->firstWhere('name', 'Holder');
                return $holder !== null && $holder['hardware_count'] === 1;
            })
        );
});

it('shows the people link in the sidebar when the user has users.view', function () {
    $user = makePerson()->assignRole('staff');
    $user->givePermissionTo('users.view');

    $this->actingAs($user)->get('/dashboard')
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('auth.permissions', fn ($permissions) => in_array('users.view', $permissions instanceof \Illuminate\Support\Collection ? $permissions->all() : $permissions))
        );
});
