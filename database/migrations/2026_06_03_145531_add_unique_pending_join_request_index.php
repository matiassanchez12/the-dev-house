<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('join_requests', function (Blueprint $table) {
            $table->dropUnique('join_requests_project_id_user_id_unique');
        });

        DB::statement("CREATE UNIQUE INDEX unique_pending_join_request ON join_requests (project_id, user_id) WHERE status = 'pending'");
    }

    public function down(): void
    {
        DB::statement('DROP INDEX IF EXISTS unique_pending_join_request');

        Schema::table('join_requests', function (Blueprint $table) {
            $table->unique(['project_id', 'user_id']);
        });
    }
};
