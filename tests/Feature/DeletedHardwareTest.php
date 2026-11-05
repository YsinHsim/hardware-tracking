<?php

use App\Models\Hardware;
use App\Models\UpdateRecord;
use App\Models\User;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    Role::findOrCreate('superadmin', 'web');
    Role::findOrCreate('staff', 'web');
});

function makeDeletedHardware(): Hardware
{
    $hardware = makeHardware();
    UpdateRecord::create([
        'record_name' => 'Hardware Deleted',
        'record_desc' => 'Deleted for the test.',
        'record_last_updated' => now(),
        'hardware_id' => $hardware->id,
    ]);
    $hardware->delete();

    return $hardware;
}

it('allows superadmin to view deleted hardware', function () {
    $admin = User::factory()->create()->assignRole('superadmin');

    $this->actingAs($admin)->get('/admin/deleted-hardware')->assertOk();
});

it('denies deleted hardware management to non-superadmin', function () {
    $user = User::factory()->create()->assignRole('staff');
    $hardware = makeDeletedHardware();

    $this->actingAs($user)->get('/admin/deleted-hardware')->assertForbidden();
    $this->actingAs($user)->post("/admin/deleted-hardware/{$hardware->id}/restore")->assertForbidden();
});

it('restores deleted hardware and records the restoration', function () {
    $admin = User::factory()->create()->assignRole('superadmin');
    $hardware = makeDeletedHardware();

    $this->actingAs($admin)->post("/admin/deleted-hardware/{$hardware->id}/restore")
        ->assertRedirect()->assertSessionHas('success');

    expect($hardware->fresh()->trashed())->toBeFalse();
    $this->assertDatabaseHas('update_records', [
        'hardware_id' => $hardware->id,
        'record_name' => 'Hardware Restored',
    ]);
});

it('permanently deletes one hardware record and its history with password confirmation', function () {
    $admin = User::factory()->create()->assignRole('superadmin');
    $hardware = makeDeletedHardware();

    $this->actingAs($admin)->delete('/admin/deleted-hardware', [
        'ids' => [$hardware->id],
        'password' => 'password',
        'confirmation' => 'PERMANENTLY DELETE',
    ])->assertRedirect()->assertSessionHas('success');

    expect(Hardware::withTrashed()->find($hardware->id))->toBeNull()
        ->and(UpdateRecord::where('hardware_id', $hardware->id)->count())->toBe(0);
});

it('permanently deletes hardware in bulk', function () {
    $admin = User::factory()->create()->assignRole('superadmin');
    $hardware = collect([makeDeletedHardware(), makeDeletedHardware()]);

    $this->actingAs($admin)->delete('/admin/deleted-hardware', [
        'ids' => $hardware->pluck('id')->all(),
        'password' => 'password',
        'confirmation' => 'PERMANENTLY DELETE',
    ])->assertRedirect()->assertSessionHas('success', '2 hardware records permanently deleted.');

    expect(Hardware::withTrashed()->whereIn('id', $hardware->pluck('id'))->count())->toBe(0);
});

it('rejects permanent deletion with an incorrect admin password', function () {
    $admin = User::factory()->create()->assignRole('superadmin');
    $hardware = makeDeletedHardware();

    $this->actingAs($admin)->from('/admin/deleted-hardware')->delete('/admin/deleted-hardware', [
        'ids' => [$hardware->id],
        'password' => 'wrong-password',
        'confirmation' => 'PERMANENTLY DELETE',
    ])->assertRedirect('/admin/deleted-hardware')->assertSessionHasErrors('password');

    expect(Hardware::withTrashed()->find($hardware->id))->not->toBeNull();
});

it('requires the exact permanent deletion phrase', function () {
    $admin = User::factory()->create()->assignRole('superadmin');
    $hardware = makeDeletedHardware();

    $this->actingAs($admin)->delete('/admin/deleted-hardware', [
        'ids' => [$hardware->id],
        'password' => 'password',
        'confirmation' => 'DELETE',
    ])->assertSessionHasErrors('confirmation');

    expect(Hardware::withTrashed()->find($hardware->id))->not->toBeNull();
});
