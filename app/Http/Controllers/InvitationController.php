<?php

namespace App\Http\Controllers;

use App\Models\AccountInvitation;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;
use Inertia\Inertia;

class InvitationController extends Controller
{
    public function store(Request $request)
    {
        Gate::authorize('users.create');

        $validated = $request->validate([
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'role' => ['required', 'exists:roles,name'],
        ]);

        $user = DB::transaction(function () use ($validated) {
            $plainToken = Str::random(64);
            $user = User::create([
                'name' => Str::before($validated['email'], '@'),
                'email' => strtolower($validated['email']),
                'password' => Str::random(64),
                'status' => 'invited',
            ]);
            $user->assignRole($validated['role']);
            AccountInvitation::create([
                'user_id' => $user->id,
                'token' => hash('sha256', $plainToken),
                'expires_at' => now()->addHours(48),
            ]);

            return [$user, $plainToken];
        });

        return back()->with('invitationLink', route('invitation.show', $user[1]));
    }

    public function show(string $token)
    {
        $invitation = AccountInvitation::where('token', hash('sha256', $token))
            ->whereNull('used_at')->where('expires_at', '>', now())->firstOrFail();

        return Inertia::render('Invitation', ['token' => $token]);
    }

    public function accept(Request $request, string $token)
    {
        $invitation = AccountInvitation::where('token', hash('sha256', $token))
            ->whereNull('used_at')->where('expires_at', '>', now())->firstOrFail();
        $validated = $request->validate(['email' => ['required', 'email']]);

        abort_if($invitation->user->status !== 'invited', 403, 'This account is not active. Contact an administrator.');

        if (! hash_equals($invitation->user->email, strtolower($validated['email']))) {
            return back()->withErrors(['email' => 'The email does not match this invitation.']);
        }

        Auth::login($invitation->user);
        $request->session()->regenerate();

        return redirect()->route('onboarding.show');
    }
}
