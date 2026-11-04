<?php

use App\Models\AssignedUser;
use App\Models\Estate;
use App\Models\Region;
use App\Models\User;
use App\Models\UserPosition;
use Inertia\Testing\AssertableInertia;

beforeEach(function () {
    $this->actingAs(User::factory()->create());

    $region = Region::create(['region_name' => 'West Coast']);
    $estate = Estate::create([
        'estate_name' => 'Test Estate',
        'region_id' => $region->id,
    ]);
    $position = UserPosition::create(['position_name' => 'Technician']);

    $this->userLookups = [
        'region' => $region,
        'estate' => $estate,
        'position' => $position,
    ];
});

function makeUser(array $overrides = []): AssignedUser
{
    $lookups = test()->userLookups;

    return AssignedUser::create(array_merge([
        'user_name' => 'User ' . uniqid(),
        'user_position_id' => $lookups['position']->id,
        'estate_id' => $lookups['estate']->id,
    ], $overrides));
}

it('defaults to ten per page, echoes null filters and orders by name', function () {
    $zulu = makeUser(['user_name' => 'Zulu User']);
    $alpha = makeUser(['user_name' => 'Alpha User']);

    $this->get('/users')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('Users/Index')
            ->where('users.data.0.id', $alpha->id)
            ->where('users.data.1.id', $zulu->id)
            ->where('filters.search', '')
            ->where('filters.estate_id', null)
            ->where('filters.position_id', null)
            ->where('filters.per_page', 10));
});

it('searches by user name, position name and estate name', function () {
    $ahmad = makeUser(['user_name' => 'Ahmad Zaki']);
    makeUser(['user_name' => 'Zulaikha']);

    $this->get('/users?search=ahmad')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('users.total', 1)
            ->where('users.data.0.id', $ahmad->id));

    $this->get('/users?search=technician')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('users.total', 2));

    $this->get('/users?search=' . rawurlencode('Test Estate'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('users.total', 2));
});

it('matches percent signs literally in search terms', function () {
    $literal = makeUser(['user_name' => 'User 100% Done']);
    makeUser(['user_name' => 'User 100X Done']);

    $this->get('/users?search=' . rawurlencode('%'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('users.total', 1)
            ->where('users.data.0.id', $literal->id));
});

it('filters users by estate and position, combined with search', function () {
    $lookups = $this->userLookups;
    $otherEstate = Estate::create([
        'estate_name' => 'Other Estate',
        'region_id' => $lookups['region']->id,
    ]);
    $otherPosition = UserPosition::create(['position_name' => 'Supervisor']);
    $matching = makeUser(['user_name' => 'Match User']);
    makeUser([
        'user_name' => 'Wrong Estate',
        'estate_id' => $otherEstate->id,
    ]);
    makeUser([
        'user_name' => 'Wrong Position',
        'user_position_id' => $otherPosition->id,
    ]);

    $this->get("/users?estate_id={$lookups['estate']->id}")
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('users.total', 2)
            ->where('filters.estate_id', $lookups['estate']->id));

    $this->get("/users?position_id={$lookups['position']->id}")
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('users.total', 2));

    $this->get("/users?search=Match&estate_id={$lookups['estate']->id}&position_id={$lookups['position']->id}")
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('users.total', 1)
            ->where('users.data.0.id', $matching->id)
            ->where('filters.search', 'Match')
            ->where('filters.position_id', $lookups['position']->id));
});

it('accepts supported page sizes and falls back for unsupported values', function () {
    foreach (range(1, 11) as $sequence) {
        makeUser(['user_name' => sprintf('User %02d', $sequence)]);
    }

    $this->get('/users?per_page=25')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('users.per_page', 25)
            ->where('filters.per_page', 25));

    $this->get('/users?per_page=7')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('users.per_page', 10)
            ->where('filters.per_page', 10));
});

it('keeps search parameters in pagination links', function () {
    foreach (range(1, 11) as $sequence) {
        makeUser(['user_name' => sprintf('Pager User %02d', $sequence)]);
    }

    $this->get('/users?search=PAGER')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('users.total', 11)
            ->where('users.links.2.url', fn ($url) => str_contains($url, 'search=PAGER')));
});

it('provides total and ordered lookup lists for the filter bar', function () {
    $lookups = $this->userLookups;
    makeUser();
    makeUser();
    UserPosition::create(['position_name' => 'A Position']);
    Estate::create([
        'estate_name' => 'A Estate',
        'region_id' => $lookups['region']->id,
    ]);

    $this->get('/users')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('total', 2)
            ->count('estates', 2)
            ->where('estates.0.estate_name', 'A Estate')
            ->count('positions', 2)
            ->where('positions.0.position_name', 'A Position'));
});
