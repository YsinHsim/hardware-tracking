<?php

use App\Models\User;

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
