<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use App\Models\UserPosition;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

class OnboardingController extends Controller
{
    public function show(Request $request)
    {
        if ($request->user()->profile_completed_at) {
            return redirect()->route('dashboard');
        }

        return Inertia::render('Onboarding', [
            'user' => $request->user()->only('name', 'email'),
            'branches' => Branch::orderBy('branch_name')->get(['id', 'branch_name']),
            'positions' => UserPosition::orderBy('position_name')->get(['id', 'position_name']),
        ]);
    }

    public function update(Request $request)
    {
        $user = $request->user();
        abort_if($user->profile_completed_at !== null, 409, 'Your profile is already complete.');
        abort_if($user->invitation && ! $user->invitation->isValid(), 403, 'This invitation has expired. Ask an administrator for a new invitation.');

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'password' => ['required', Password::defaults(), 'confirmed'],
            'branch_id' => ['required', 'exists:branches,id'],
            'user_position_id' => ['required', 'exists:user_positions,id'],
        ], [], ['user_position_id' => 'position']);

        $request->user()->update([
            ...$validated,
            'status' => 'active',
            'profile_completed_at' => now(),
        ]);
        $request->user()->invitation?->update(['used_at' => now()]);

        return redirect()->route('my-hardware.index')->with('success', 'Profile completed. Welcome to AssetHub.');
    }
}
