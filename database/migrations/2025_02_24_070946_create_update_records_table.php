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
        Schema::create('update_records', function (Blueprint $table) {
            $table->id();
            $table->string('record_name');
            $table->text('record_desc')->nullable();
            $table->timestamp('record_last_updated');
            $table->foreignId('hardware_id')->constrained('hardwares')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('update_records');
    }
};
