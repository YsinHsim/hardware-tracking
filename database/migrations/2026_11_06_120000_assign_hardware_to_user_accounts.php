<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('hardwares', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->after('assigned_user_id')->constrained('users')->nullOnDelete();
            $table->string('assigned_user_name')->nullable()->after('user_id');
            $table->string('assigned_branch_name')->nullable()->after('assigned_user_name');
            $table->string('assigned_position_name')->nullable()->after('assigned_branch_name');
        });

        DB::table('hardwares')->orderBy('id')->chunk(100, function ($hardwareRecords) {
            foreach ($hardwareRecords as $hardware) {
                $legacy = $hardware->assigned_user_id
                    ? DB::table('assigned_users')->where('id', $hardware->assigned_user_id)->first()
                    : null;
                $user = $legacy
                    ? DB::table('users')->where('name', $legacy->user_name)
                        ->where('branch_id', $legacy->branch_id)
                        ->where('user_position_id', $legacy->user_position_id)
                        ->first()
                    : null;
                DB::table('hardwares')->where('id', $hardware->id)->update([
                    'user_id' => $user?->id,
                    'assigned_user_name' => $legacy?->user_name,
                    'assigned_branch_name' => $legacy ? DB::table('branches')->where('id', $legacy->branch_id)->value('branch_name') : null,
                    'assigned_position_name' => $legacy ? DB::table('user_positions')->where('id', $legacy->user_position_id)->value('position_name') : null,
                ]);
            }
        });
    }

    public function down(): void
    {
        DB::table('hardwares')->whereNotNull('user_id')->orderBy('id')->chunk(100, function ($hardwareRecords) {
            foreach ($hardwareRecords as $hardware) {
                $user = DB::table('users')->where('id', $hardware->user_id)->first();
                if (! $user) {
                    continue;
                }
                $assignee = DB::table('assigned_users')->where([
                    'user_name' => $user->name,
                    'branch_id' => $user->branch_id,
                    'user_position_id' => $user->user_position_id,
                ])->first();
                $assigneeId = $assignee?->id ?? DB::table('assigned_users')->insertGetId([
                    'user_name' => $user->name,
                    'branch_id' => $user->branch_id,
                    'user_position_id' => $user->user_position_id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                DB::table('hardwares')->where('id', $hardware->id)->update(['assigned_user_id' => $assigneeId]);
            }
        });

        Schema::table('hardwares', function (Blueprint $table) {
            $table->dropConstrainedForeignId('user_id');
            $table->dropColumn(['assigned_user_name', 'assigned_branch_name', 'assigned_position_name']);
        });
    }
};
