<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('branches', function (Blueprint $table) {
            $table->dropForeign(['region_id']);
            $table->foreign('region_id')->references('id')->on('regions')->restrictOnDelete();
        });

        Schema::table('assigned_users', function (Blueprint $table) {
            $table->dropForeign(['user_position_id']);
            $table->foreign('user_position_id')->references('id')->on('user_positions')->restrictOnDelete();
            $table->dropForeign(['branch_id']);
            $table->foreign('branch_id')->references('id')->on('branches')->restrictOnDelete();
        });

        Schema::table('hardwares', function (Blueprint $table) {
            $table->dropForeign(['assigned_user_id']);
            $table->foreign('assigned_user_id')->references('id')->on('assigned_users')->restrictOnDelete();
            $table->dropForeign(['hardware_type_id']);
            $table->foreign('hardware_type_id')->references('id')->on('hardware_types')->restrictOnDelete();
            $table->dropForeign(['hardware_status_id']);
            $table->foreign('hardware_status_id')->references('id')->on('hardware_statuses')->restrictOnDelete();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('hardwares', function (Blueprint $table) {
            $table->dropSoftDeletes();
            $table->dropForeign(['assigned_user_id']);
            $table->foreign('assigned_user_id')->references('id')->on('assigned_users')->nullOnDelete();
            $table->dropForeign(['hardware_type_id']);
            $table->foreign('hardware_type_id')->references('id')->on('hardware_types')->cascadeOnDelete();
            $table->dropForeign(['hardware_status_id']);
            $table->foreign('hardware_status_id')->references('id')->on('hardware_statuses')->cascadeOnDelete();
        });

        Schema::table('assigned_users', function (Blueprint $table) {
            $table->dropForeign(['user_position_id']);
            $table->foreign('user_position_id')->references('id')->on('user_positions')->cascadeOnDelete();
            $table->dropForeign(['branch_id']);
            $table->foreign('branch_id')->references('id')->on('branches')->cascadeOnDelete();
        });

        Schema::table('branches', function (Blueprint $table) {
            $table->dropForeign(['region_id']);
            $table->foreign('region_id')->references('id')->on('regions')->cascadeOnDelete();
        });
    }
};
