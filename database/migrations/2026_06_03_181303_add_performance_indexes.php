<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('join_requests', function (Blueprint $table) {
            $table->index(['user_id', 'status'], 'join_requests_user_id_status_index');
        });

        Schema::table('projects', function (Blueprint $table) {
            $table->index(['status', 'created_at'], 'projects_status_created_at_index');
        });
    }

    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->dropIndex('projects_status_created_at_index');
        });

        Schema::table('join_requests', function (Blueprint $table) {
            $table->dropIndex('join_requests_user_id_status_index');
        });
    }
};
