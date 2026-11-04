<?php

use App\Models\Estate;
use App\Models\Region;
use App\Models\User;
use Inertia\Testing\AssertableInertia;

beforeEach(function () {
    $this->actingAs(User::factory()->create());

    $this->westCoast = Region::create(['region_name' => 'West Coast']);
    $this->sandalwood = Region::create(['region_name' => 'Sandalwood']);
});

function makeEstate(array $overrides = []): Estate
{
    return Estate::create(array_merge([
        'estate_name' => 'Estate ' . uniqid(),
        'region_id' => test()->westCoast->id,
    ], $overrides));
}

it('defaults to ten per page, echoes null filters and orders by name', function () {
    $zulu = makeEstate(['estate_name' => 'Zulu Estate']);
    $alpha = makeEstate(['estate_name' => 'Alpha Estate']);

    $this->get('/estates')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('Estates/Index')
            ->where('estates.data.0.id', $alpha->id)
            ->where('estates.data.1.id', $zulu->id)
            ->where('filters.search', '')
            ->where('filters.region_id', null)
            ->where('filters.per_page', 10));
});

it('searches by estate name and region name', function () {
    $west = makeEstate(['estate_name' => 'Bavang Estate']);
    makeEstate([
        'estate_name' => 'Tamparuli Estate',
        'region_id' => $this->sandalwood->id,
    ]);

    $this->get('/estates?search=bavang')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('estates.total', 1)
            ->where('estates.data.0.id', $west->id));

    $this->get('/estates?search=sandalwood')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('estates.total', 1));
});

it('matches percent signs literally in search terms', function () {
    $literal = makeEstate(['estate_name' => 'Estate 100% Done']);
    makeEstate(['estate_name' => 'Estate 100X Done']);

    $this->get('/estates?search=' . rawurlencode('%'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('estates.total', 1)
            ->where('estates.data.0.id', $literal->id));
});

it('filters estates by region, combined with search', function () {
    $west = makeEstate(['estate_name' => 'West A']);
    makeEstate([
        'estate_name' => 'Sand A',
        'region_id' => $this->sandalwood->id,
    ]);

    $this->get("/estates?region_id={$this->westCoast->id}")
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('estates.total', 1)
            ->where('estates.data.0.id', $west->id)
            ->where('filters.region_id', $this->westCoast->id));

    $this->get("/estates?search=A&region_id={$this->sandalwood->id}")
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('estates.total', 1)
            ->where('filters.search', 'A')
            ->where('filters.region_id', $this->sandalwood->id));
});

it('accepts supported page sizes and falls back for unsupported values', function () {
    foreach (range(1, 11) as $sequence) {
        makeEstate(['estate_name' => sprintf('Estate %02d', $sequence)]);
    }

    $this->get('/estates?per_page=25')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('estates.per_page', 25)
            ->where('filters.per_page', 25));

    $this->get('/estates?per_page=7')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('estates.per_page', 10)
            ->where('filters.per_page', 10));
});

it('keeps search parameters in pagination links', function () {
    foreach (range(1, 11) as $sequence) {
        makeEstate(['estate_name' => sprintf('Pager Estate %02d', $sequence)]);
    }

    $this->get('/estates?search=PAGER')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('estates.total', 11)
            ->where('estates.links.2.url', fn ($url) => str_contains($url, 'search=PAGER')));
});

it('provides total and ordered region list for the filter bar', function () {
    makeEstate();
    makeEstate();
    Region::create(['region_name' => 'A Region']);

    $this->get('/estates')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('total', 2)
            ->count('regions', 3)
            ->where('regions.0.region_name', 'A Region'));
});
