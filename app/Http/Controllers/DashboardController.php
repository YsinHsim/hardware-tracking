<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use App\Models\Hardware;
use App\Models\HardwareStatus;
use App\Models\UpdateRecord;
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
            ->leftJoin('users', 'users.branch_id', '=', 'branches.id')
            ->leftJoin('hardwares', function ($join) {
                $join->on('hardwares.user_id', '=', 'users.id')
                    ->whereNull('hardwares.deleted_at');
            })
            ->groupBy('branches.id', 'branches.branch_name')
            ->orderByDesc('total')
            ->get();

        $totalHardware = $statusCounts->sum('total');
        $assignedCount = (int) Hardware::whereNotNull('user_id')->count();
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
            'recentActivity' => UpdateRecord::query()
                ->with(['hardware:id,hardware_no', 'user:id,name'])
                ->orderByDesc('id')
                ->limit(8)
                ->get(['id', 'record_name', 'record_desc', 'hardware_id', 'user_id', 'created_at'])
                ->map(fn ($record) => [
                    'id' => $record->id,
                    'record_name' => $record->record_name,
                    'record_desc' => $record->record_desc,
                    'hardware_no' => $record->hardware?->hardware_no,
                    'user_name' => $record->user?->name,
                    'created_at' => $record->created_at->toIso8601String(),
                ]),
        ]);
    }
}
