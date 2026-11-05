<?php

use App\Models\User;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    // Base permission the tests exercise
    Permission::findOrCreate('hardware.view', 'web');
    Permission::findOrCreate('hardware.edit', 'web');
    Permission::findOrCreate('admin.roles', 'web');

    Role::findOrCreate('superadmin', 'web');
    Role::findOrCreate('manager', 'web');
    Role::findOrCreate('staff', 'web');
});

it('allows superadmin to view the roles panel', function () {
    $user = User::factory()->create()->assignRole('superadmin');

    $this->actingAs($user)->get('/admin/roles')->assertOk();
});

it('denies the roles panel to non-superadmin', function () {
    $user = User::factory()->create()->assignRole('staff');

    $this->actingAs($user)->get('/admin/roles')->assertForbidden();
});

it('creates a role with permissions', function () {
    $admin = User::factory()->create()->assignRole('superadmin');

    $this->actingAs($admin)->post('/admin/roles', [
        'name' => 'technician',
        'permissions' => ['hardware.view'],
    ])->assertRedirect()->assertSessionHas('success');

    $role = Role::where('name', 'technician')->firstOrFail();
    expect($role->hasPermissionTo('hardware.view'))->toBeTrue()
        ->and($role->hasPermissionTo('hardware.edit'))->toBeFalse();
});

it('updates role permissions', function () {
    $admin = User::factory()->create()->assignRole('superadmin');

    $this->actingAs($admin)->put("/admin/roles/" . Role::where('name', 'staff')->first()->id, [
        'permissions' => ['hardware.view', 'hardware.edit'],
    ])->assertSessionHas('success');

    expect(Role::where('name', 'staff')->first()->hasPermissionTo('hardware.edit'))->toBeTrue();
});

it('refuses to delete a base role', function () {
    $admin = User::factory()->create()->assignRole('superadmin');

    $this->actingAs($admin)->delete('/admin/roles/' . Role::where('name', 'staff')->first()->id)
        ->assertSessionHasErrors('delete');

    expect(Role::where('name', 'staff')->exists())->toBeTrue();
});

it('refuses to delete a role that still has users', function () {
    $admin = User::factory()->create()->assignRole('superadmin');
    Role::create(['name' => 'temp', 'guard_name' => 'web']);
    User::factory()->create()->assignRole('temp');

    $this->actingAs($admin)->delete('/admin/roles/' . Role::where('name', 'temp')->first()->id)
        ->assertSessionHasErrors('delete');

    expect(Role::where('name', 'temp')->exists())->toBeTrue();
});

it('deletes an unused custom role', function () {
    $admin = User::factory()->create()->assignRole('superadmin');
    Role::create(['name' => 'temp', 'guard_name' => 'web']);

    $this->actingAs($admin)->delete('/admin/roles/' . Role::where('name', 'temp')->first()->id)
        ->assertSessionHas('success');

    expect(Role::where('name', 'temp')->exists())->toBeFalse();
});

it('assigns a role to a user', function () {
    $admin = User::factory()->create()->assignRole('superadmin');
    $user = User::factory()->create();

    $this->actingAs($admin)->put("/admin/users/{$user->id}/role", ['role' => 'manager'])
        ->assertSessionHas('success');

    expect($user->fresh()->hasRole('manager'))->toBeTrue();
});

it('prevents demoting the last superadmin', function () {
    $admin = User::factory()->create()->assignRole('superadmin');

    $this->actingAs($admin)->put("/admin/users/{$admin->id}/role", ['role' => 'staff'])
        ->assertSessionHasErrors('role');

    expect($admin->fresh()->hasRole('superadmin'))->toBeTrue();
});
