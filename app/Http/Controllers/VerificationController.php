<?php

namespace App\Http\Controllers;

use App\Models\Hardware;
use App\Models\HardwareVerification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class VerificationController extends Controller
{
    public function index(Request $request)
    {
        Gate::authorize('hardware.verify');
        $query = Hardware::where('verification_status', 'pending')
            ->with(['assignedUser.branch', 'hardwareType', 'hardwareStatus', 'submitter']);
        if (! $request->user()->hasRole('superadmin')) {
            $query->whereHas('assignedUser', fn ($q) => $q->where('branch_id', $request->user()->branch_id));
        }

        return Inertia::render('Verification/Index', ['hardware' => $query->latest()->get()]);
    }

    public function update(Request $request, Hardware $hardware)
    {
        Gate::authorize('hardware.verify');
        $user = $request->user();
        abort_if($hardware->submitted_by === $user->id, 403, 'You cannot verify your own submission.');
        abort_if(! $user->hasRole('superadmin') && $hardware->getRelationValue('assignedUser')?->branch_id !== $user->branch_id, 403);
        abort_if($hardware->verification_status !== 'pending', 409, 'This hardware has already been reviewed.');

        $validated = $request->validate([
            'status' => ['required', 'in:verified,changes_requested,rejected'],
            'notes' => ['nullable', 'string', 'max:1000', 'required_unless:status,verified'],
        ]);

        $hardware->update(['verification_status' => $validated['status']]);
        HardwareVerification::create([
            'hardware_id' => $hardware->id,
            'reviewer_id' => $user->id,
            'status' => $validated['status'],
            'notes' => $validated['notes'] ?? null,
        ]);
        $user->unreadNotifications()
            ->where('type', \App\Notifications\HardwareVerificationRequested::class)
            ->where('data->hardware_id', $hardware->id)
            ->update(['read_at' => now()]);

        return back()->with('success', 'Hardware verification updated.');
    }
}
