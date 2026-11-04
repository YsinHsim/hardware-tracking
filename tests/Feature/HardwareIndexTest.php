<?php

use App\Models\AssignedUser;
use App\Models\Estate;
use App\Models\HardwareType;
use App\Models\HardwareStatus;
use App\Models\User;
use Inertia\Testing\AssertableInertia;

beforeEach(function () {
    $this->actingAs(User::factory()->create());
});

it('defaults to ten per page, echoes null filters and orders newest first', function () {
    $oldest = makeHardware();
    $newest = makeHardware();

    $this->get('/hardwares')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('Hardwares/Index')
            ->where('hardwares.per_page', 10)
            ->where('hardwares.data.0.id', $newest->id)
            ->where('hardwares.data.1.id', $oldest->id)
            ->where('filters.search', '')
            ->where('filters.estate_id', null)
            ->where('filters.hardware_type_id', null)
            ->where('filters.hardware_status_id', null)
            ->where('filters.per_page', 10));
});

it('searches partial hardware numbers and serial numbers', function () {
    $lookups = makeLookups();
    $matchingNumber = makeHardware([
        'hardware_no' => 'HW-NUMBER-123',
        'hardware_type_id' => $lookups['hardwareType']->id,
        'hardware_status_id' => $lookups['hardwareStatus']->id,
    ]);
    $matchingSerial = makeHardware([
        'hardware_no' => 'HW-OTHER',
        'hardware_serial_no' => 'SERIAL-456-XYZ',
        'hardware_type_id' => $lookups['hardwareType']->id,
        'hardware_status_id' => $lookups['hardwareStatus']->id,
    ]);
    makeHardware([
        'hardware_no' => 'HW-NOMATCH',
        'hardware_serial_no' => 'SN-NOMATCH',
        'hardware_type_id' => $lookups['hardwareType']->id,
        'hardware_status_id' => $lookups['hardwareStatus']->id,
    ]);

    $this->get('/hardwares?search=NUMBER')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('hardwares.total', 1)
            ->where('hardwares.data.0.id', $matchingNumber->id));

    $this->get('/hardwares?search=456')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('hardwares.total', 1)
            ->where('hardwares.data.0.id', $matchingSerial->id));
});

it('searches by assigned user name', function () {
    $lookups = makeLookups();
    $assigned = makeHardware([
        'assigned_user_id' => $lookups['assignedUser']->id,
        'hardware_type_id' => $lookups['hardwareType']->id,
        'hardware_status_id' => $lookups['hardwareStatus']->id,
    ]);
    makeHardware([
        'hardware_type_id' => $lookups['hardwareType']->id,
        'hardware_status_id' => $lookups['hardwareStatus']->id,
    ]);

    $this->get('/hardwares?search=ahmad')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('hardwares.total', 1)
            ->where('hardwares.data.0.id', $assigned->id));
});

it('searches by estate name', function () {
    $lookups = makeLookups();
    $assigned = makeHardware([
        'assigned_user_id' => $lookups['assignedUser']->id,
        'hardware_type_id' => $lookups['hardwareType']->id,
        'hardware_status_id' => $lookups['hardwareStatus']->id,
    ]);
    makeHardware([
        'hardware_type_id' => $lookups['hardwareType']->id,
        'hardware_status_id' => $lookups['hardwareStatus']->id,
    ]);

    $this->get('/hardwares?search=estate')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('hardwares.total', 1)
            ->where('hardwares.data.0.id', $assigned->id));
});

it('searches by hardware type name and status name', function () {
    $lookups = makeLookups();
    $matching = makeHardware([
        'hardware_type_id' => $lookups['hardwareType']->id,
        'hardware_status_id' => $lookups['hardwareStatus']->id,
    ]);
    $otherType = HardwareType::create(['hardware_type_name' => 'Monitor']);
    makeHardware([
        'hardware_no' => 'HW-TYPE-SEARCH',
        'hardware_type_id' => $otherType->id,
        'hardware_status_id' => $lookups['hardwareStatus']->id,
    ]);

    $this->get('/hardwares?search=laptop')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('hardwares.total', 1)
            ->where('hardwares.data.0.id', $matching->id));

    $this->get('/hardwares?search=active')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('hardwares.total', 2));
});

it('matches percent signs literally in search terms', function () {
    $lookups = makeLookups();
    $literal = makeHardware([
        'hardware_no' => 'HW-100%-DONE',
        'hardware_type_id' => $lookups['hardwareType']->id,
        'hardware_status_id' => $lookups['hardwareStatus']->id,
    ]);
    makeHardware([
        'hardware_no' => 'HW-100X-DONE',
        'hardware_type_id' => $lookups['hardwareType']->id,
        'hardware_status_id' => $lookups['hardwareStatus']->id,
    ]);

    $this->get('/hardwares?search=' . rawurlencode('%'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('hardwares.total', 1)
            ->where('hardwares.data.0.id', $literal->id));
});

it('matches exclamation marks literally in search terms', function () {
    $lookups = makeLookups();
    $literal = makeHardware([
        'hardware_no' => 'HW-A!B',
        'hardware_type_id' => $lookups['hardwareType']->id,
        'hardware_status_id' => $lookups['hardwareStatus']->id,
    ]);
    makeHardware([
        'hardware_no' => 'HW-AXB',
        'hardware_type_id' => $lookups['hardwareType']->id,
        'hardware_status_id' => $lookups['hardwareStatus']->id,
    ]);

    $this->get('/hardwares?search=' . rawurlencode('A!B'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('hardwares.total', 1)
            ->where('hardwares.data.0.id', $literal->id));
});

it('filters hardware by estate and excludes unassigned hardware', function () {
    $lookups = makeLookups();
    $otherEstate = Estate::create([
        'estate_name' => 'Other Estate',
        'region_id' => $lookups['region']->id,
    ]);
    $otherUser = AssignedUser::create([
        'user_name' => 'Other User',
        'user_position_id' => $lookups['position']->id,
        'estate_id' => $otherEstate->id,
    ]);
    $matching = makeHardware([
        'assigned_user_id' => $lookups['assignedUser']->id,
        'hardware_type_id' => $lookups['hardwareType']->id,
        'hardware_status_id' => $lookups['hardwareStatus']->id,
    ]);
    makeHardware([
        'assigned_user_id' => $otherUser->id,
        'hardware_type_id' => $lookups['hardwareType']->id,
        'hardware_status_id' => $lookups['hardwareStatus']->id,
    ]);
    makeHardware([
        'hardware_type_id' => $lookups['hardwareType']->id,
        'hardware_status_id' => $lookups['hardwareStatus']->id,
    ]);

    $this->get("/hardwares?estate_id={$lookups['estate']->id}")
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('hardwares.total', 1)
            ->where('hardwares.data.0.id', $matching->id)
            ->where('filters.estate_id', $lookups['estate']->id));
});

it('filters hardware to unassigned items only', function () {
    $lookups = makeLookups();
    makeHardware([
        'assigned_user_id' => $lookups['assignedUser']->id,
        'hardware_type_id' => $lookups['hardwareType']->id,
        'hardware_status_id' => $lookups['hardwareStatus']->id,
    ]);
    $unassigned = makeHardware([
        'hardware_type_id' => $lookups['hardwareType']->id,
        'hardware_status_id' => $lookups['hardwareStatus']->id,
    ]);

    $this->get('/hardwares?estate_id=unassigned')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('hardwares.total', 1)
            ->where('hardwares.data.0.id', $unassigned->id)
            ->where('filters.estate_id', 'unassigned')
            ->where('total', 1));
});

it('filters by type and status separately and combines both with search', function () {
    $lookups = makeLookups();
    $otherType = HardwareType::create(['hardware_type_name' => 'Monitor']);
    $otherStatus = HardwareStatus::create(['hardware_status_name' => 'Retired']);
    $matching = makeHardware([
        'hardware_no' => 'HW-COMBINED',
        'hardware_type_id' => $lookups['hardwareType']->id,
        'hardware_status_id' => $lookups['hardwareStatus']->id,
    ]);
    $wrongType = makeHardware([
        'hardware_no' => 'HW-COMBINED-TYPE',
        'hardware_type_id' => $otherType->id,
        'hardware_status_id' => $lookups['hardwareStatus']->id,
    ]);
    $wrongStatus = makeHardware([
        'hardware_no' => 'HW-COMBINED-STATUS',
        'hardware_type_id' => $lookups['hardwareType']->id,
        'hardware_status_id' => $otherStatus->id,
    ]);
    $wrongSearch = makeHardware([
        'hardware_no' => 'HW-OTHER',
        'hardware_type_id' => $lookups['hardwareType']->id,
        'hardware_status_id' => $lookups['hardwareStatus']->id,
    ]);

    $this->get("/hardwares?hardware_type_id={$lookups['hardwareType']->id}")
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('hardwares.total', 3)
            ->where('hardwares.data.0.id', $wrongSearch->id));

    $this->get("/hardwares?hardware_status_id={$lookups['hardwareStatus']->id}")
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('hardwares.total', 3)
            ->where('hardwares.data.0.id', $wrongSearch->id));

    $this->get("/hardwares?search=COMBINED&hardware_type_id={$lookups['hardwareType']->id}&hardware_status_id={$lookups['hardwareStatus']->id}")
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('hardwares.total', 1)
            ->where('hardwares.data.0.id', $matching->id)
            ->where('filters.search', 'COMBINED')
            ->where('filters.hardware_type_id', $lookups['hardwareType']->id)
            ->where('filters.hardware_status_id', $lookups['hardwareStatus']->id));
});

it('accepts supported page sizes and falls back for unsupported values', function () {
    $lookups = makeLookups();

    foreach (range(1, 11) as $sequence) {
        makeHardware([
            'hardware_no' => "HW-SIZE-{$sequence}",
            'hardware_serial_no' => "SN-SIZE-{$sequence}",
            'hardware_type_id' => $lookups['hardwareType']->id,
            'hardware_status_id' => $lookups['hardwareStatus']->id,
        ]);
    }

    $this->get('/hardwares?per_page=25')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('hardwares.per_page', 25)
            ->where('filters.per_page', 25));

    $this->get('/hardwares?per_page=7')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('hardwares.per_page', 10)
            ->where('filters.per_page', 10));
});

it('keeps search parameters in pagination links', function () {
    $lookups = makeLookups();

    foreach (range(1, 11) as $sequence) {
        makeHardware([
            'hardware_no' => "HW-PAGE-{$sequence}",
            'hardware_serial_no' => "SN-PAGE-{$sequence}",
            'hardware_type_id' => $lookups['hardwareType']->id,
            'hardware_status_id' => $lookups['hardwareStatus']->id,
        ]);
    }

    $this->get('/hardwares?search=PAGE')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('hardwares.total', 11)
            ->where('hardwares.links.2.url', fn ($url) => str_contains($url, 'search=PAGE')));
});

it('excludes soft deleted hardware from the list', function () {
    $deleted = makeHardware();
    $active = makeHardware();
    $deleted->delete();

    $this->get('/hardwares')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('hardwares.total', 1)
            ->where('hardwares.data.0.id', $active->id));
});

it('provides ordered lookup lists for the filter bar', function () {
    $lookups = makeLookups();
    HardwareType::create(['hardware_type_name' => 'A Type']);
    HardwareStatus::create(['hardware_status_name' => 'A Status']);
    Estate::create([
        'estate_name' => 'A Estate',
        'region_id' => $lookups['region']->id,
    ]);

    $this->get('/hardwares')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->count('estates', 2)
            ->where('estates.0.estate_name', 'A Estate')
            ->count('hardwareTypes', 2)
            ->where('hardwareTypes.0.hardware_type_name', 'A Type')
            ->count('hardwareStatuses', 2)
            ->where('hardwareStatuses.0.hardware_status_name', 'A Status'));
});
