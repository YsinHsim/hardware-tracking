<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleController extends Controller
{
    private const VALIDATION_ATTRIBUTES = [
        'name' => 'role name',
        'permissions' => 'permissions',
        'permissions.*' => 'permission',
    ];

    /**
     * Permissions grouped by their module prefix (hardware.*, branches.*, ...).
     */
    private function groupedPermissions(): array
    {
        return Permission::query()
            ->orderBy('name')
            ->pluck('name')
            ->groupBy(fn (string $name) => explode('.', $name, 2)[0])
            ->map(fn ($group) => $group->values())
            ->toArray();
    }

    public function index(): Response
    {
        Gate::authorize('admin.roles');

        return Inertia::render('Admin/Roles/Index', [
            'roles' => Role::query()
                ->withCount(['users', 'permissions'])
                ->orderBy('id')
                ->get(['id', 'name'])
                ->map(fn (Role $role) => [
                    'id' => $role->id,
                    'name' => $role->name,
                    'users_count' => $role->users_count,
                    'permissions_count' => $role->permissions_count,
                ]),
            'permissions' => $this->groupedPermissions(),
        ]);
    }

    public function show(Role $role): Response
    {
        Gate::authorize('admin.roles');

        return Inertia::render('Admin/Roles/Show', [
            'role' => [
                'id' => $role->id,
                'name' => $role->name,
                'permissions' => $role->permissions->pluck('name'),
                'users_count' => $role->users()->count(),
            ],
            'permissions' => $this->groupedPermissions(),
            'isBaseRole' => in_array($role->name, ['superadmin', 'manager', 'staff'], true),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        Gate::authorize('admin.roles');

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:64', 'regex:/^[a-z][a-z0-9-]*$/', Rule::unique('roles', 'name')],
            'permissions' => ['array'],
            'permissions.*' => ['string', Rule::exists('permissions', 'name')],
        ], [], self::VALIDATION_ATTRIBUTES);

        $role = Role::create(['name' => $validated['name'], 'guard_name' => 'web']);
        $role->syncPermissions($validated['permissions'] ?? []);

        return back()->with('success', "Role {$role->name} created.");
    }

    public function update(Request $request, Role $role): RedirectResponse
    {
        Gate::authorize('admin.roles');

        $validated = $request->validate([
            'permissions' => ['array'],
            'permissions.*' => ['string', Rule::exists('permissions', 'name')],
        ], [], self::VALIDATION_ATTRIBUTES);

        $role->syncPermissions($validated['permissions'] ?? []);

        return back()->with('success', "Permissions for {$role->name} updated.");
    }

    public function destroy(Role $role): RedirectResponse
    {
        Gate::authorize('admin.roles');

        if (in_array($role->name, ['superadmin', 'manager', 'staff'], true)) {
            return back()->withErrors(['delete' => "The {$role->name} role is a base role and cannot be deleted."]);
        }

        if ($role->users()->exists()) {
            return back()->withErrors(['delete' => "Role {$role->name} still has users assigned. Reassign them first."]);
        }

        $role->delete();

        return back()->with('success', "Role {$role->name} deleted.");
    }

    public function users(): Response
    {
        Gate::authorize('admin.roles');

        return Inertia::render('Admin/Users/Index', [
            'users' => User::query()
                ->with('roles:id,name')
                ->orderBy('name')
                ->get(['id', 'name', 'email'])
                ->map(fn (User $user) => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->roles->first()?->name,
                ]),
            'roles' => Role::query()->orderBy('id')->pluck('name'),
        ]);
    }

    public function assignUser(Request $request, User $user): RedirectResponse
    {
        Gate::authorize('admin.roles');

        $validated = $request->validate([
            'role' => ['required', 'string', Rule::exists('roles', 'name')],
        ], [], ['role' => 'role']);

        // Guard: never let the last superadmin be demoted.
        if ($user->hasRole('superadmin') && $validated['role'] !== 'superadmin') {
            $superadmins = User::role('superadmin')->count();
            if ($superadmins <= 1) {
                return back()->withErrors(['role' => 'Cannot change the role of the last superadmin.']);
            }
        }

        $user->syncRoles([$validated['role']]);

        return back()->with('success', "{$user->name} is now {$validated['role']}.");
    }
}
