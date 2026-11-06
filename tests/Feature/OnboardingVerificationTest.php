<?php

use App\Models\AccountInvitation;
use App\Models\Hardware;
use App\Models\User;
use Inertia\Testing\AssertableInertia;
use Illuminate\Support\Facades\Notification;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    Role::findOrCreate('superadmin', 'web');
    Role::findOrCreate('staff', 'web');
    Role::findOrCreate('manager', 'web');
    Permission::findOrCreate('hardware.verify', 'web');
    Role::findByName('manager')->givePermissionTo('hardware.verify');
});

it('creates a single-use invitation without exposing a password', function () {
    $admin = User::factory()->create(['profile_completed_at' => now()])->assignRole('superadmin');
    $this->actingAs($admin)->post('/admin/invitations', ['email' => 'invited@example.com', 'role' => 'staff'])
        ->assertSessionHas('invitationLink');
    $invitationLink = session('invitationLink');
    $this->actingAs($admin)->get('/admin/users')->assertInertia(fn (AssertableInertia $page) => $page
        ->where('flash.invitationLink', $invitationLink)
    );
    expect(User::where('email', 'invited@example.com')->first()->status)->toBe('invited');
});

it('accepts a matching invitation email and forces onboarding', function () {
    $user = User::factory()->create(['status' => 'invited', 'profile_completed_at' => null]);
    $token = bin2hex('fixture');
    AccountInvitation::create(['user_id' => $user->id, 'token' => hash('sha256', $token), 'expires_at' => now()->addDay()]);
    $this->post("/invitation/$token", ['email' => $user->email])->assertRedirect('/onboarding');
    $this->assertAuthenticatedAs($user);
    expect(AccountInvitation::where('user_id', $user->id)->first()->used_at)->toBeNull();
    $lookups = makeBranchLookups();
    $this->put('/onboarding', [
        'name' => 'Invited User',
        'password' => 'new-password-123',
        'password_confirmation' => 'new-password-123',
        'branch_id' => $lookups['branch']->id,
        'user_position_id' => $lookups['position']->id,
    ])->assertRedirect('/my-hardware');
    expect(AccountInvitation::where('user_id', $user->id)->first()->used_at)->not->toBeNull();
});

it('rejects a mismatched invitation email', function () {
    $user = User::factory()->create(['status' => 'invited', 'profile_completed_at' => null]);
    $token = bin2hex('fixture');
    AccountInvitation::create(['user_id' => $user->id, 'token' => hash('sha256', $token), 'expires_at' => now()->addDay()]);
    $this->post("/invitation/$token", ['email' => 'wrong@example.com'])->assertSessionHasErrors('email');
    $this->assertGuest();
});

it('blocks dashboard until required profile and password are completed', function () {
    $user = User::factory()->create(['profile_completed_at' => null]);
    $this->actingAs($user)->get('/dashboard')->assertRedirect('/onboarding');
});

it('submits own hardware and notifies a manager in the same branch', function () {
    Notification::fake();
    $lookups = makeBranchLookups();
    $user = User::factory()->create(['profile_completed_at' => now(), 'branch_id' => $lookups['branch']->id, 'user_position_id' => $lookups['position']->id])->assignRole('staff');
    $manager = User::factory()->create(['profile_completed_at' => now(), 'branch_id' => $lookups['branch']->id])->assignRole('manager');
    $this->actingAs($user)->post('/my-hardware', [
        'hardware_no' => 'HW-SELF-1', 'hardware_serial_no' => 'SN-SELF-1',
        'hardware_type_id' => $lookups['hardwareType']->id, 'hardware_status_id' => $lookups['hardwareStatus']->id,
    ])->assertSessionHas('success');
    $hardware = Hardware::where('hardware_no', 'HW-SELF-1')->first();
    expect($hardware->verification_status)->toBe('pending')->and($hardware->user_id)->toBe($user->id);
    Notification::assertSentTo($manager, App\Notifications\HardwareVerificationRequested::class);
});

it('allows retrying invitation acceptance until onboarding is complete', function () {
    $user = User::factory()->create(['status' => 'invited', 'profile_completed_at' => null]);
    $token = bin2hex('fixture');
    AccountInvitation::create(['user_id' => $user->id, 'token' => hash('sha256', $token), 'expires_at' => now()->addDay()]);

    $this->post("/invitation/$token", ['email' => $user->email]);
    $this->post('/logout');
    $this->post("/invitation/$token", ['email' => $user->email])->assertRedirect('/onboarding');
    $this->assertAuthenticatedAs($user);
});

it('rejects expired and used invitations', function () {
    $user = User::factory()->create(['status' => 'invited', 'profile_completed_at' => null]);
    $token = bin2hex('fixture');
    $invitation = AccountInvitation::create(['user_id' => $user->id, 'token' => hash('sha256', $token), 'expires_at' => now()->subMinute()]);
    $this->get("/invitation/$token")->assertNotFound();
    $invitation->update(['expires_at' => now()->addDay(), 'used_at' => now()]);
    $this->get("/invitation/$token")->assertNotFound();
});

it('lets only the submitter edit and resubmit hardware with requested changes', function () {
    Notification::fake();
    $lookups = makeBranchLookups();
    $user = $lookups['assignedUser']->assignRole('staff');
    $hardware = makeHardware([
        'verification_status' => 'changes_requested',
        'submitted_by' => $user->id,
        'assigned_user_id' => $user->id,
        'hardware_type_id' => $lookups['hardwareType']->id,
        'hardware_status_id' => $lookups['hardwareStatus']->id,
    ]);
    $other = User::factory()->create();

    $this->actingAs($other)->put("/my-hardware/{$hardware->id}", [])->assertForbidden();

    $this->actingAs($user)->put("/my-hardware/{$hardware->id}", [
        'hardware_no' => 'HW-RESUBMITTED',
        'hardware_serial_no' => $hardware->hardware_serial_no,
        'hardware_type_id' => $hardware->hardware_type_id,
        'hardware_status_id' => $hardware->hardware_status_id,
    ])->assertSessionHas('success');

    expect($hardware->fresh()->verification_status)->toBe('pending')
        ->and($hardware->fresh()->hardware_no)->toBe('HW-RESUBMITTED');
    $this->assertDatabaseHas('update_records', [
        'hardware_id' => $hardware->id,
        'record_name' => 'Hardware Resubmitted',
        'record_desc' => 'Hardware (No: HW-RESUBMITTED) was updated and resubmitted for verification.',
    ]);
});

it('does not allow resubmitting pending verified or rejected hardware', function () {
    $lookups = makeBranchLookups();
    $user = $lookups['assignedUser'];
    foreach (['pending', 'verified', 'rejected'] as $status) {
        $hardware = makeHardware([
            'verification_status' => $status,
            'submitted_by' => $user->id,
            'assigned_user_id' => $user->id,
            'hardware_type_id' => $lookups['hardwareType']->id,
            'hardware_status_id' => $lookups['hardwareStatus']->id,
        ]);
        $this->actingAs($user)->put("/my-hardware/{$hardware->id}", [])->assertStatus(409);
    }
});

it('shows reviewer notes and verification history on hardware details', function () {
    $lookups = makeBranchLookups();
    $manager = User::factory()->create(['branch_id' => $lookups['branch']->id])->assignRole('manager');
    $hardware = makeHardware([
        'verification_status' => 'pending',
        'submitted_by' => $lookups['assignedUser']->id,
        'assigned_user_id' => $lookups['assignedUser']->id,
    ]);
    $this->actingAs($manager)->put("/verification/{$hardware->id}", [
        'status' => 'changes_requested',
        'notes' => 'Correct the serial number.',
    ]);
    $manager->givePermissionTo('hardware.view');
    $this->get("/hardwares/{$hardware->id}")->assertInertia(fn (AssertableInertia $page) => $page
        ->where('hardware.verification_status', 'changes_requested')
        ->where('hardware.verifications.0.notes', 'Correct the serial number.')
        ->where('hardware.verifications.0.reviewer.name', $manager->name)
    );
});

it('requires review notes for changes requested or rejected submissions', function () {
    $lookups = makeBranchLookups();
    $manager = User::factory()->create(['branch_id' => $lookups['branch']->id])->assignRole('manager');
    $hardware = makeHardware(['verification_status' => 'pending', 'submitted_by' => User::factory()->create()->id, 'assigned_user_id' => $lookups['assignedUser']->id]);
    $this->actingAs($manager)->put("/verification/{$hardware->id}", ['status' => 'changes_requested'])->assertSessionHasErrors('notes');
});

it('allows superadmins to review across branches but blocks other branch managers', function () {
    $lookups = makeBranchLookups();
    $otherRegion = App\Models\Region::create(['region_name' => 'Other']);
    $otherBranch = App\Models\Branch::create(['branch_name' => 'Other', 'region_id' => $otherRegion->id]);
    $manager = User::factory()->create(['branch_id' => $otherBranch->id])->assignRole('manager');
    $hardware = makeHardware(['verification_status' => 'pending', 'submitted_by' => User::factory()->create()->id, 'assigned_user_id' => $lookups['assignedUser']->id]);
    $this->actingAs($manager)->put("/verification/{$hardware->id}", ['status' => 'verified'])->assertForbidden();
    $admin = User::factory()->create()->assignRole('superadmin');
    $this->actingAs($admin)->put("/verification/{$hardware->id}", ['status' => 'verified'])->assertSessionHas('success');
});

it('denies verification access to staff', function () {
    $user = User::factory()->create()->assignRole('staff');
    $this->actingAs($user)->get('/verification')->assertForbidden();
});

it('allows manager to verify branch submissions but not their own', function () {
    $lookups = makeBranchLookups();
    $manager = User::factory()->create(['profile_completed_at' => now(), 'branch_id' => $lookups['branch']->id])->assignRole('manager');
    $hardware = makeHardware(['verification_status' => 'pending', 'submitted_by' => User::factory()->create(['profile_completed_at' => now()])->id, 'assigned_user_id' => $lookups['assignedUser']->id]);
    $this->actingAs($manager)->put("/verification/{$hardware->id}", ['status' => 'verified'])->assertSessionHas('success');
    expect($hardware->fresh()->verification_status)->toBe('verified');
    $hardware->update(['verification_status' => 'pending', 'submitted_by' => $manager->id]);
    $this->actingAs($manager)->put("/verification/{$hardware->id}", ['status' => 'verified'])->assertForbidden();
});
