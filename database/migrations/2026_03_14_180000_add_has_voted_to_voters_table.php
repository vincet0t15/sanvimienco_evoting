<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('voters', function (Blueprint $table) {
            $table->boolean('has_voted')->default(false)->after('is_active');
            $table->index(['event_id', 'has_voted']);
        });
    }

    public function down(): void
    {
        Schema::table('voters', function (Blueprint $table) {
            $table->dropIndex(['event_id', 'has_voted']);
            $table->dropColumn('has_voted');
        });
    }
};
