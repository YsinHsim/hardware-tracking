<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use App\Models\Hardware;
use App\Models\HardwareStatus;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $statusCounts = HardwareStatus::query()
            ->selectRaw('hardware_statuses.hardware_status_name as name, count(hardwares.id) as total')
            ->leftJoin('hardwares', function ($join) {
                $join->on('hardwares.hardware_status_id', '=', 'hardware_statuses.id')
                    ->whereNull('hardwares.deleted_at');
            })
            ->groupBy('hardware_statuses.id', 'hardware_statuses.hardware_status_name')
            ->orderBy('hardware_statuses.hardware_status_name')
            ->get();

        $branchCounts = Branch::query()
            ->selectRaw('branches.branch_name as name, count(hardwares.id) as total')
            ->leftJoin('assigned_users', 'assigned_users.branch_id', '=', 'branches.id')
            ->leftJoin('hardwares', function ($join) {
                $join->on('hardwares.assigned_user_id', '=', 'assigned_users.id')
                    ->whereNull('hardwares.deleted_at');
            })
            ->groupBy('branches.id', 'branches.branch_name')
            ->orderByDesc('total')
            ->get();

        $totalHardware = $statusCounts->sum('total');
        $assignedCount = (int) Hardware::whereNotNull('assigned_user_id')->count();
        $faultyCount = (int) Hardware::whereNull('deleted_at')
            ->whereHas('hardwareStatus', fn ($query) => $query->where('hardware_status_name', 'Faulty'))
            ->count();

        return Inertia::render('Dashboard', [
            'stats' => [
                'totalHardware' => $totalHardware,
                'assignedCount' => $assignedCount,
                'unassignedCount' => max($totalHardware - $assignedCount, 0),
                'faultyCount' => $faultyCount,
                'totalBranches' => (int) Branch::count(),
            ],
            'statusBreakdown' => $statusCounts,
            'branchBreakdown' => $branchCounts,
        ]);
    }
}
