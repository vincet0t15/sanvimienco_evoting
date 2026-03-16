<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('voters', function (Blueprint $table) {
            $table->string('current_session_token', 80)->nullable()->after('last_seen_at');
            $table->index(['event_id', 'current_session_token']);
        });
    }

    public function down(): void
    {
        Schema::table('voters', function (Blueprint $table) {
            $table->dropIndex(['event_id', 'current_session_token']);
            $table->dropColumn('current_session_token');
        });
    }
};
