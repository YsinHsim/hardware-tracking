<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * One-off repair migration.
     *
     * 2026_11_04_000001_rename_estates_to_branches partially applied on the
     * production MariaDB: the table and branch_name were renamed, but the
     * assigned_users.estate_id -> branch_id rename did not take effect, and the
     * legacy foreign key (assigned_users_estate_id_foreign) survived, still
     * referencing the renamed-away estates table by name.
     *
     * This migration completes the remaining rename on databases where it is
     * still pending, and is a no-op where 2026_11_04_000001 fully applied
     * (fresh installs and the test suite).
     */
    public function up(): void
    {
        if (! Schema::hasTable('branches') || ! Schema::hasColumn('assigned_users', 'estate_id')) {
            return; // nothing to repair
        }

        Schema::table('assigned_users', function (Blueprint $table) {
            // Drop the legacy FK whichever name it carries; ignore failure when absent.
            try {
                $table->dropForeign(['estate_id']);
            } catch (\Throwable) {
                try {
                    $table->dropForeign('assigned_users_estate_id_foreign');
                } catch (\Throwable) {
                }
            }
        });

        Schema::table('assigned_users', function (Blueprint $table) {
            $table->renameColumn('estate_id', 'branch_id');
            $table->foreign('branch_id')->references('id')->on('branches')->restrictOnDelete();
        });
    }

    public function down(): void
    {
        //
    }
};
