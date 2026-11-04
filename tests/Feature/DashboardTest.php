<?php

use App\Models\AssignedUser;
use App\Models\Branch;
use App\Models\Hardware;
use App\Models\HardwareStatus;
use App\Models\User;
use Inertia\Testing\AssertableInertia;

beforeEach(function () {
    $this->actingAs(User::factory()->create());
    $this->lookups = makeBranchLookups();
});

function makeDashboardHardware(array $overrides = []): Hardware
{
    return Hardware::create(array_merge([
        'hardware_no' => 'HW-' . uniqid(),
        'hardware_serial_no' => 'SN-' . uniqid(),
        'assigned_user_id' => null,
        'hardware_type_id' => test()->lookups['hardwareType']->id,
        'hardware_status_id' => test()->lookups['hardwareStatus']->id,
    ], $overrides));
}

it('shows stat cards and chart breakdowns', function () {
    $faulty = HardwareStatus::create(['hardware_status_name' => 'Faulty']);

    $assigned = AssignedUser::create([
        'user_name' => 'Dash User',
        'user_position_id' => $this->lookups['position']->id,
        'branch_id' => $this->lookups['branch']->id,
    ]);

    makeDashboardHardware(['hardware_status_id' => $this->lookups['hardwareStatus']->id, 'assigned_user_id' => $assigned->id]);
    makeDashboardHardware(['hardware_status_id' => $faulty->id]);
    makeDashboardHardware(['hardware_status_id' => $this->lookups['hardwareStatus']->id]);

    $this->get('/dashboard')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('Dashboard')
            ->where('stats.totalHardware', 3)
            ->where('stats.assignedCount', 1)
            ->where('stats.unassignedCount', 2)
            ->where('stats.faultyCount', 1)
            ->where('stats.totalBranches', 1)
            ->where('statusBreakdown.0.name', 'Active')
            ->where('statusBreakdown.0.total', 2)
            ->where('statusBreakdown.1.name', 'Faulty')
            ->where('statusBreakdown.1.total', 1)
            ->where('branchBreakdown.0.name', 'Test Branch')
            ->where('branchBreakdown.0.total', 1));
});

it('excludes soft-deleted hardware from stats and charts', function () {
    $hardware = makeDashboardHardware();
    $hardware->delete();

    $this->get('/dashboard')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('stats.totalHardware', 0)
            ->where('stats.assignedCount', 0)
            ->where('stats.faultyCount', 0)
            ->where('statusBreakdown.0.total', 0)
            ->where('branchBreakdown.0.total', 0));
});

it('requires authentication', function () {
    auth()->logout();

    $this->get('/dashboard')->assertRedirect('/login');
});
