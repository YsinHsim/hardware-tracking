<?php

namespace App\Http\Controllers;

use App\Models\AssignedUser;
use App\Models\Estate;
use App\Models\User;
use App\Models\UserPosition;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Str;
use Inertia\Inertia;

class AssignedUserController extends Controller
{
    private const VALIDATION_ATTRIBUTES = [
        'user_name' => 'name',
        'user_position_id' => 'position',
        'estate_id' => 'estate',
    ];

    // Display a listing of users
    public function index(Request $request)
    {
        $search = mb_substr(trim($request->string('search')->toString()), 0, 100);
        $estateId = $request->integer('estate_id') ?: null;
        $positionId = $request->integer('position_id') ?: null;
        $perPage = (int) $request->query('per_page', 10);
        $perPage = in_array($perPage, [10, 25, 50], true) ? $perPage : 10;

        $escapedSearch = str_replace(['!', '%', '_'], ['!!', '!%', '!_'], $search);

        $users = AssignedUser::with(['userPosition', 'estate'])
            ->when($search !== '', function ($query) use ($escapedSearch) {
                $query->where(function ($query) use ($escapedSearch) {
                    $query->whereRaw("user_name LIKE ? ESCAPE '!'", ["%{$escapedSearch}%"])
                        ->orWhereHas('userPosition', fn ($query) => $query->whereRaw("position_name LIKE ? ESCAPE '!'", ["%{$escapedSearch}%"]))
                        ->orWhereHas('estate', fn ($query) => $query->whereRaw("estate_name LIKE ? ESCAPE '!'", ["%{$escapedSearch}%"]));
                });
            })
            ->when($estateId, fn ($query) => $query->where('estate_id', $estateId))
            ->when($positionId, fn ($query) => $query->where('user_position_id', $positionId))
            ->orderBy('user_name')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('Users/Index', [
            'users' => $users,
            'filters' => [
                'search' => $search,
                'estate_id' => $estateId,
                'position_id' => $positionId,
                'per_page' => $perPage,
            ],
            'total' => $users->total(),
            'estates' => Estate::query()->select('id', 'estate_name')->orderBy('estate_name')->get(),
            'positions' => UserPosition::query()->select('id', 'position_name')->orderBy('position_name')->get(),
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
        ], [], self::VALIDATION_ATTRIBUTES);

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
        ], [], self::VALIDATION_ATTRIBUTES);

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
        $hardwareCount = $user->hardwares()->withTrashed()->count();

        if ($hardwareCount > 0) {
            $trashedHardwareCount = $user->hardwares()->onlyTrashed()->count();
            $deletedHardwareNote = $trashedHardwareCount > 0 ? ' (including deleted hardware)' : '';

            $hardwareLabel = Str::plural('hardware record', $hardwareCount);
            $verb = $hardwareCount === 1 ? 'belongs' : 'belong';
            return back()->withErrors(['delete' => "Cannot delete user \"{$user->user_name}\": {$hardwareCount} {$hardwareLabel}{$deletedHardwareNote} still {$verb} to it. Move or delete them first."]);
        }

        $user->delete();
        return Redirect::route('users.index')->with('success', 'User deleted successfully!');
    }
}
