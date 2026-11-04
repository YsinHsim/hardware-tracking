<?php

namespace App\Http\Controllers;

use App\Models\AssignedUser;
use App\Models\Branch;
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
        'branch_id' => 'branch',
    ];

    // Display a listing of users
    public function index(Request $request)
    {
        $search = mb_substr(trim($request->string('search')->toString()), 0, 100);
        $branchId = $request->integer('branch_id') ?: null;
        $positionId = $request->integer('position_id') ?: null;
        $perPage = (int) $request->query('per_page', 10);
        $perPage = in_array($perPage, [10, 25, 50], true) ? $perPage : 10;

        $escapedSearch = str_replace(['!', '%', '_'], ['!!', '!%', '!_'], $search);

        $users = AssignedUser::with(['userPosition', 'branch'])
            ->when($search !== '', function ($query) use ($escapedSearch) {
                $query->where(function ($query) use ($escapedSearch) {
                    $query->whereRaw("user_name LIKE ? ESCAPE '!'", ["%{$escapedSearch}%"])
                        ->orWhereHas('userPosition', fn ($query) => $query->whereRaw("position_name LIKE ? ESCAPE '!'", ["%{$escapedSearch}%"]))
                        ->orWhereHas('branch', fn ($query) => $query->whereRaw("branch_name LIKE ? ESCAPE '!'", ["%{$escapedSearch}%"]));
                });
            })
            ->when($branchId, fn ($query) => $query->where('branch_id', $branchId))
            ->when($positionId, fn ($query) => $query->where('user_position_id', $positionId))
            ->orderBy('user_name')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('Users/Index', [
            'users' => $users,
            'filters' => [
                'search' => $search,
                'branch_id' => $branchId,
                'position_id' => $positionId,
                'per_page' => $perPage,
            ],
            'total' => $users->total(),
            'branches' => Branch::query()->select('id', 'branch_name')->orderBy('branch_name')->get(),
            'positions' => UserPosition::query()->select('id', 'position_name')->orderBy('position_name')->get(),
        ]);
    }

    // Show the form for creating a new user
    public function create()
    {
        $users = AssignedUser::all();
        $positions = UserPosition::all();
        $branches = Branch::with('region')->get();
        return Inertia::render('Users/Create', ['users' => $users, 'positions' => $positions, 'branches' => $branches]);
    }

    // Store a newly created user
    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_name' => 'required|string|max:255',
            'user_position_id' => 'required|exists:user_positions,id',
            'branch_id' => 'required|exists:branches,id',
        ], [], self::VALIDATION_ATTRIBUTES);

        AssignedUser::create($validated);

        return redirect()->back()->with('success', 'User created successfully.');
    }

    // Show the form for editing the specified user
    public function edit(AssignedUser $user)
    {
        $positions = UserPosition::all();
        $branches = Branch::with('region')->get();
        return Inertia::render('Users/Edit', ['user' => $user, 'positions' => $positions, 'branches' => $branches]);
    }

    // Update the specified user
    public function update(Request $request, AssignedUser $user)
    {
        $request->validate([
            'user_name' => 'required|string|max:255',
            'user_position_id' => 'required|exists:user_positions,id',
            'branch_id' => 'required|exists:branches,id',
        ], [], self::VALIDATION_ATTRIBUTES);

        $user->update($request->only('user_name', 'user_position_id', 'branch_id'));

        return Redirect::route('users.index')->with('success', 'User updated successfully!');
    }

    public function show($id)
    {
        $user = AssignedUser::with([
            'userPosition',
            'branch.region',
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
