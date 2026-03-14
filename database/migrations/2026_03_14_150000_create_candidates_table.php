<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('candidates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained()->cascadeOnDelete();
            $table->foreignId('position_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('photo_path');
            $table->timestamps();

            $table->unique(['position_id', 'name']);
            $table->index(['event_id', 'position_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('candidates');
    }
};
