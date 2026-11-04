<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Rename estates to branches as part of rebranding the system for
     * general company use. Renames the table, its name column, and the
     * referencing column on assigned_users (with its foreign keys).
     *
     * Databases created fresh (tests, new installs) already have the
     * final schema from the historical migrations, so this migration
     * skips itself when `branches` already exists.
     */
    public function up(): void
    {
        if (! Schema::hasTable('estates') || Schema::hasTable('branches')) {
            return;
        }

        // Drop the assigned_users -> estates FK first so the column and
        // table can be renamed cleanly.
        Schema::table('assigned_users', function (Blueprint $table) {
            $table->dropForeign(['estate_id']);
        });

        Schema::table('estates', function (Blueprint $table) {
            $table->renameColumn('estate_name', 'branch_name');
        });

        Schema::rename('estates', 'branches');

        Schema::table('assigned_users', function (Blueprint $table) {
            $table->renameColumn('estate_id', 'branch_id');
            $table->foreign('branch_id')->references('id')->on('branches')->restrictOnDelete();
        });
    }

    public function down(): void
    {
        if (! Schema::hasTable('branches')) {
            return;
        }

        Schema::table('assigned_users', function (Blueprint $table) {
            $table->dropForeign(['branch_id']);
            $table->renameColumn('branch_id', 'estate_id');
        });

        Schema::rename('branches', 'estates');

        Schema::table('estates', function (Blueprint $table) {
            $table->renameColumn('branch_name', 'estate_name');
        });

        Schema::table('assigned_users', function (Blueprint $table) {
            $table->foreign('estate_id')->references('id')->on('estates')->restrictOnDelete();
        });
    }
};
