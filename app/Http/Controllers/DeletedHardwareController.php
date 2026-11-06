<?php

namespace App\Http\Controllers;

use App\Models\Hardware;
use App\Models\UpdateRecord;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class DeletedHardwareController extends Controller
{
    public function index(): Response
    {
        Gate::authorize('admin.roles');

        return Inertia::render('Admin/DeletedHardware/Index', [
            'hardware' => Hardware::onlyTrashed()
                ->with(['assignedUser', 'hardwareType', 'hardwareStatus'])
                ->latest('deleted_at')
                ->get()
                ->map(fn (Hardware $hardware) => [
                    'id' => $hardware->id,
                    'hardware_no' => $hardware->hardware_no,
                    'hardware_serial_no' => $hardware->hardware_serial_no,
                    'assigned_user' => $hardware->assigned_user['user_name'] ?? 'Unassigned',
                    'branch' => $hardware->assigned_user['branch']['branch_name'] ?? 'Unassigned',
                    'type' => $hardware->hardwareType?->hardware_type_name ?? 'Unknown',
                    'status' => $hardware->hardwareStatus?->hardware_status_name ?? 'Unknown',
                    'deleted_at' => $hardware->deleted_at->toISOString(),
                    'history_count' => $hardware->updateRecords()->count(),
                ]),
        ]);
    }

    public function restore(Hardware $hardware): RedirectResponse
    {
        Gate::authorize('admin.roles');

        if (! $hardware->trashed()) {
            return back()->withErrors(['restore' => 'This hardware is not deleted.']);
        }

        $hardware->restore();
        UpdateRecord::create([
            'record_name' => 'Hardware Restored',
            'record_desc' => "Hardware (No: {$hardware->hardware_no}) was restored.",
            'record_last_updated' => now(),
            'hardware_id' => $hardware->id,
        ]);

        return back()->with('success', 'Hardware restored successfully.');
    }

    public function destroy(Request $request): RedirectResponse
    {
        Gate::authorize('admin.roles');

        $validated = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer', 'distinct'],
            'password' => ['required', 'string'],
            'confirmation' => ['required', 'in:PERMANENTLY DELETE'],
        ], [], [
            'password' => 'admin password',
            'confirmation' => 'confirmation phrase',
        ]);

        if (! Hash::check($validated['password'], $request->user()->password)) {
            return back()->withErrors(['password' => 'The admin password is incorrect.']);
        }

        $hardware = Hardware::onlyTrashed()->whereIn('id', $validated['ids'])->get();
        if ($hardware->count() !== count($validated['ids'])) {
            return back()->withErrors(['delete' => 'One or more records are no longer deleted. Refresh and try again.']);
        }

        DB::transaction(function () use ($hardware) {
            foreach ($hardware as $item) {
                $item->updateRecords()->delete();
                $item->forceDelete();
            }
        });

        return back()->with('success', $hardware->count() === 1
            ? 'Hardware permanently deleted.'
            : "{$hardware->count()} hardware records permanently deleted.");
    }
}
