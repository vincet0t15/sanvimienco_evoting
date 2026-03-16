<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('voters', function (Blueprint $table) {
            $table->timestamp('last_seen_at')->nullable()->after('has_voted');
            $table->index(['event_id', 'last_seen_at']);
        });
    }

    public function down(): void
    {
        Schema::table('voters', function (Blueprint $table) {
            $table->dropIndex(['event_id', 'last_seen_at']);
            $table->dropColumn('last_seen_at');
        });
    }
};
