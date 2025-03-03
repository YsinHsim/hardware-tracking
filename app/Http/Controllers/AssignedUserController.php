<?php

namespace App\Http\Controllers;

use App\Models\AssignedUser;
use App\Models\Estate;
use App\Models\User;
use App\Models\UserPosition;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;

class AssignedUserController extends Controller
{
    // Display a listing of users
    public function index()
    {
        $users = AssignedUser::with(['userPosition', 'estate'])->get();

        return Inertia::render('Users/Index', [
            'users' => $users
        ]);
    }

    // Show the form for creating a new user
    public function create()
    {
        $users = AssignedUser::all();
        $positions = UserPosition::all();
        $estates = Estate::with('region')->get();
        return Inertia::render('Users/Create', ['users' => $users, 'positions' => $positions, 'estates' => $estates]);
    }

    // Store a newly created user
    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_name' => 'required|string|max:255',
            'user_position_id' => 'required|exists:user_positions,id',
            'estate_id' => 'required|exists:estates,id',
        ]);

        AssignedUser::create($validated);

        return redirect()->back()->with('success', 'User created successfully.');
    }

    // Show the form for editing the specified user
    public function edit(AssignedUser $user)
    {
        $positions = UserPosition::all();
        $estates = Estate::with('region')->get();
        return Inertia::render('Users/Edit', ['user' => $user, 'positions' => $positions, 'estates' => $estates]);
    }

    // Update the specified user
    public function update(Request $request, AssignedUser $user)
    {
        $request->validate([
            'user_name' => 'required|string|max:255',
            'user_position_id' => 'required|exists:user_positions,id',
            'estate_id' => 'required|exists:estates,id',
        ]);

        $user->update($request->only('user_name', 'user_position_id', 'estate_id'));

        return Redirect::route('users.index')->with('success', 'User updated successfully!');
    }

    public function show($id)
    {
        $user = AssignedUser::with([
            'userPosition',
            'estate.region',
            'hardwares.hardwareType',
            'hardwares.hardwareStatus'  // Include hardwareStatus relationship
        ])->findOrFail($id);

        return Inertia::render('Users/Show', [
            'user' => $user
        ]);
    }

    // Remove the specified user
    public function destroy(AssignedUser $user)
    {
        $user->delete();
        return Redirect::route('users.index')->with('success', 'User deleted successfully!');
    }
}
