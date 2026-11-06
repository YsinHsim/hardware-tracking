<?php

use App\Models\Branch;
use App\Models\Region;
use App\Models\User;
use Inertia\Testing\AssertableInertia;

beforeEach(function () {
    $this->actingAs(User::factory()->create()->assignRole('staff'));

    $this->westCoast = Region::create(['region_name' => 'West Coast']);
    $this->sandalwood = Region::create(['region_name' => 'Sandalwood']);
});

function makeBranch(array $overrides = []): Branch
{
    return Branch::create(array_merge([
        'branch_name' => 'Branch ' . uniqid(),
        'region_id' => test()->westCoast->id,
    ], $overrides));
}

it('defaults to ten per page, echoes null filters and orders by name', function () {
    $zulu = makeBranch(['branch_name' => 'Zulu Branch']);
    $alpha = makeBranch(['branch_name' => 'Alpha Branch']);

    $this->get('/branches')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('Branches/Index')
            ->where('branches.data.0.id', $alpha->id)
            ->where('branches.data.1.id', $zulu->id)
            ->where('filters.search', '')
            ->where('filters.region_id', null)
            ->where('filters.per_page', 10));
});

it('searches by branch name and region name', function () {
    $west = makeBranch(['branch_name' => 'Bavang Branch']);
    makeBranch([
        'branch_name' => 'Tamparuli Branch',
        'region_id' => $this->sandalwood->id,
    ]);

    $this->get('/branches?search=bavang')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('branches.total', 1)
            ->where('branches.data.0.id', $west->id));

    $this->get('/branches?search=sandalwood')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('branches.total', 1));
});

it('matches percent signs literally in search terms', function () {
    $literal = makeBranch(['branch_name' => 'Branch 100% Done']);
    makeBranch(['branch_name' => 'Branch 100X Done']);

    $this->get('/branches?search=' . rawurlencode('%'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('branches.total', 1)
            ->where('branches.data.0.id', $literal->id));
});

it('filters branches by region, combined with search', function () {
    $west = makeBranch(['branch_name' => 'West A']);
    makeBranch([
        'branch_name' => 'Sand A',
        'region_id' => $this->sandalwood->id,
    ]);

    $this->get("/branches?region_id={$this->westCoast->id}")
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('branches.total', 1)
            ->where('branches.data.0.id', $west->id)
            ->where('filters.region_id', $this->westCoast->id));

    $this->get("/branches?search=A&region_id={$this->sandalwood->id}")
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('branches.total', 1)
            ->where('filters.search', 'A')
            ->where('filters.region_id', $this->sandalwood->id));
});

it('accepts supported page sizes and falls back for unsupported values', function () {
    foreach (range(1, 11) as $sequence) {
        makeBranch(['branch_name' => sprintf('Branch %02d', $sequence)]);
    }

    $this->get('/branches?per_page=25')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('branches.per_page', 25)
            ->where('filters.per_page', 25));

    $this->get('/branches?per_page=7')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('branches.per_page', 10)
            ->where('filters.per_page', 10));
});

it('keeps search parameters in pagination links', function () {
    foreach (range(1, 11) as $sequence) {
        makeBranch(['branch_name' => sprintf('Pager Branch %02d', $sequence)]);
    }

    $this->get('/branches?search=PAGER')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('branches.total', 11)
            ->where('branches.links.2.url', fn ($url) => str_contains($url, 'search=PAGER')));
});

it('provides total and ordered region list for the filter bar', function () {
    makeBranch();
    makeBranch();
    Region::create(['region_name' => 'A Region']);

    $this->get('/branches')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('total', 2)
            ->count('regions', 3)
            ->where('regions.0.region_name', 'A Region'));
});
