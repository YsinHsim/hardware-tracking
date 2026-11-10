<?php

use App\Models\User;
use Illuminate\Support\Facades\Hash;

it('redirects guests from hardwares to login', function () {
    $this->get('/hardwares')->assertRedirect('/login');
});

it('returns an email error for a wrong password', function () {
    $user = User::factory()->create(['password' => 'password']);

    $this->from('/login')->post('/login', [
        'email' => $user->email,
        'password' => 'wrong-password',
    ])->assertRedirect('/login')->assertSessionHasErrors('email');

    $this->assertGuest();
});

it('logs in with correct credentials', function () {
    $user = User::factory()->create(['password' => 'password']);

    $this->post('/login', [
        'email' => $user->email,
        'password' => 'password',
    ])->assertRedirect('/dashboard');

    $this->assertAuthenticatedAs($user);
});

it('blocks suspended users from logging in', function () {
    $user = User::factory()->create(['password' => 'password', 'status' => 'suspended']);

    $this->post('/login', [
        'email' => $user->email,
        'password' => 'password',
    ])->assertRedirect('/login')->assertSessionHasErrors([
        'email' => 'This account is not active. Contact an administrator.',
    ]);

    $this->assertGuest();
});

it('logs out a suspended user with an existing session', function () {
    $user = User::factory()->create(['status' => 'suspended']);

    $this->actingAs($user)->get('/dashboard')
        ->assertRedirect('/login')
        ->assertSessionHasErrors([
            'email' => 'This account is suspended. Contact an administrator.',
        ]);

    $this->assertGuest();
});

it('logs out and redirects to login', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post('/logout')
        ->assertRedirect('/login');

    $this->assertGuest();
});

it('redirects signed-in users from login to dashboard', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get('/login')
        ->assertRedirect('/dashboard');
});

it('throttles the sixth login attempt within a minute', function () {
    $user = User::factory()->create(['password' => 'password']);

    $payload = [
        'email' => $user->email,
        'password' => 'wrong-password',
    ];

    for ($attempt = 0; $attempt < 5; $attempt++) {
        $this->post('/login', $payload);
    }

    $this->post('/login', $payload)->assertStatus(429);
});

it('shows the change password page to signed-in users', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->get('/settings/password')->assertOk();
});

it('requires the current password when changing it', function () {
    $user = User::factory()->create(['password' => 'password']);

    $this->actingAs($user)
        ->put('/settings/password', [
            'current_password' => 'wrong-password',
            'password' => 'new-password-123',
            'password_confirmation' => 'new-password-123',
        ])
        ->assertSessionHasErrors('current_password');

    $this->assertTrue(Hash::check('password', $user->fresh()->password));
});

it('changes the password with the correct current password', function () {
    $user = User::factory()->create(['password' => 'password']);

    $this->actingAs($user)
        ->put('/settings/password', [
            'current_password' => 'password',
            'password' => 'new-password-123',
            'password_confirmation' => 'new-password-123',
        ])
        ->assertRedirect()
        ->assertSessionHas('success', 'Password changed successfully.');

    $this->assertTrue(Hash::check('new-password-123', $user->fresh()->password));
});

it('rejects a mismatched new password confirmation', function () {
    $user = User::factory()->create(['password' => 'password']);

    $this->actingAs($user)
        ->put('/settings/password', [
            'current_password' => 'password',
            'password' => 'new-password-123',
            'password_confirmation' => 'password',
        ])
        ->assertSessionHasErrors('password');

    $this->assertTrue(Hash::check('password', $user->fresh()->password));
});

it('requires a minimum password length', function () {
    $user = User::factory()->create(['password' => 'password']);

    $this->actingAs($user)
        ->put('/settings/password', [
            'current_password' => 'password',
            'password' => 'short',
            'password_confirmation' => 'short',
        ])
        ->assertSessionHasErrors('password');

    $this->assertTrue(Hash::check('password', $user->fresh()->password));
});
