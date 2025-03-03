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
        Schema::create('assigned_users', function (Blueprint $table) {
            $table->id();
            $table->string('user_name');
            $table->foreignId('user_position_id')->constrained('user_positions')->onDelete('cascade');
            $table->foreignId('estate_id')->constrained('estates')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('assigned_users');
    }
};
