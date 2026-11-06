<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('status')->default('active')->after('password');
            $table->timestamp('profile_completed_at')->nullable()->after('status');
            $table->foreignId('branch_id')->nullable()->after('profile_completed_at')->constrained()->restrictOnDelete();
            $table->foreignId('user_position_id')->nullable()->after('branch_id')->constrained()->restrictOnDelete();
        });

        Schema::create('account_invitations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('token', 64)->unique();
            $table->timestamp('expires_at');
            $table->timestamp('used_at')->nullable();
            $table->timestamps();
        });

        Schema::table('hardwares', function (Blueprint $table) {
            $table->string('verification_status')->default('verified')->after('assigned_user_id');
            $table->foreignId('submitted_by')->nullable()->after('verification_status')->constrained('users')->nullOnDelete();
        });

        Schema::create('hardware_verifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hardware_id')->constrained('hardwares')->cascadeOnDelete();
            $table->foreignId('reviewer_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('status');
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('notifications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('type');
            $table->morphs('notifiable');
            $table->text('data');
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('hardware_verifications');
        Schema::table('hardwares', function (Blueprint $table) {
            $table->dropConstrainedForeignId('submitted_by');
            $table->dropColumn('verification_status');
        });
        Schema::dropIfExists('account_invitations');
        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('user_position_id');
            $table->dropConstrainedForeignId('branch_id');
            $table->dropColumn(['status', 'profile_completed_at']);
        });
    }
};
