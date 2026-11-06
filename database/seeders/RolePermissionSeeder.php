<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolePermissionSeeder extends Seeder
{
    /**
     * Base roles and permissions for AssetHub.
     *
     * - superadmin: full access incl. role/permission management (gate: before())
     * - manager: full CRUD on operational modules, no role administration
     * - staff: read-only on operational modules
     */
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $modules = ['hardware', 'users', 'branches', 'system-data'];
        $actions = ['view', 'create', 'edit', 'delete'];

        foreach ($modules as $module) {
            foreach ($actions as $action) {
                Permission::findOrCreate("{$module}.{$action}", 'web');
            }
        }

        Permission::findOrCreate('admin.roles', 'web');
        Permission::findOrCreate('hardware.verify', 'web');

        $superadmin = Role::findOrCreate('superadmin', 'web');
        $manager = Role::findOrCreate('manager', 'web');
        $staff = Role::findOrCreate('staff', 'web');

        $manager->syncPermissions(
            Permission::where('name', '!=', 'admin.roles')->pluck('name')
        );
        $staff->syncPermissions(
            collect($modules)->map(fn ($module) => "{$module}.view")
        );

        // Bootstrap: env admin account becomes superadmin.
        $adminEmail = env('ADMIN_EMAIL');
        if ($adminEmail) {
            $admin = User::where('email', $adminEmail)->first();
            $admin?->assignRole($superadmin);
        }
    }
}
