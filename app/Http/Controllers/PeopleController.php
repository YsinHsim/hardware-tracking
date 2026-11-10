<?php

namespace App\Http\Controllers;

use App\Models\Hardware;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PeopleController extends Controller
{
    public function index(Request $request): Response
    {
        $viewer = $request->user();
        $search = mb_substr(trim($request->string('search')->toString()), 0, 100);
        $escapedSearch = $this->escapeLike($search);

        $query = User::query()
            ->with(['roles:id,name', 'branch.region', 'position:id,position_name'])
            ->withCount(['hardware as hardware_count' => fn ($q) => $q->whereNull('deleted_at')])
            ->whereNotNull('profile_completed_at')
            ->orderBy('name');

        // Managers are scoped to their own branch. Superadmins see everyone.
        if (! $viewer->hasRole('superadmin')) {
            $query->where('branch_id', $viewer->branch_id);
        }

        if ($search !== '') {
            $query->where(function ($q) use ($escapedSearch) {
                $q->whereRaw("name LIKE ? ESCAPE '!'", ["%{$escapedSearch}%"])
                    ->orWhereRaw("email LIKE ? ESCAPE '!'", ["%{$escapedSearch}%"]);
            });
        }

        return Inertia::render('People/Index', [
            'people' => $query->get(['id', 'name', 'email', 'status', 'branch_id', 'user_position_id', 'created_at'])
                ->map(fn (User $user) => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'status' => $user->status,
                    'role' => $user->roles->first()?->name,
                    'branch' => $user->branch ? [
                        'id' => $user->branch->id,
                        'name' => $user->branch->branch_name,
                        'region' => $user->branch->region?->region_name,
                    ] : null,
                    'position' => $user->position?->position_name,
                    'hardware_count' => $user->hardware_count,
                ]),
            'filters' => ['search' => $search],
            'canViewAllBranches' => $viewer->hasRole('superadmin'),
        ]);
    }

    public function show(Request $request, User $user): Response
    {
        $viewer = $request->user();

        // Self-access is always allowed, even without users.view.
        if ($viewer->id !== $user->id) {
            abort_unless($viewer->can('users.view') || $viewer->hasRole('superadmin'), 403);
            abort_unless(
                $viewer->hasRole('superadmin') || $viewer->branch_id === $user->branch_id,
                403,
                'You can only view people in your own branch.'
            );
        }

        $hardware = Hardware::query()
            ->where('user_id', $user->id)
            ->with(['hardwareType', 'hardwareStatus'])
            ->latest()
            ->get();

        return Inertia::render('People/Show', [
            'person' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'status' => $user->status,
                'role' => $user->roles->first()?->name,
                'branch' => $user->branch ? [
                    'id' => $user->branch->id,
                    'name' => $user->branch->branch_name,
                    'region' => $user->branch->region?->region_name,
                ] : null,
                'position' => $user->position?->position_name,
                'joined' => $user->created_at?->toDateString(),
            ],
            'hardware' => $hardware,
            'isSelf' => $viewer->id === $user->id,
        ]);
    }

    private function escapeLike(string $term): string
    {
        return str_replace(['!', '%', '_'], ['!!', '!%', '!_'], $term);
    }
}
