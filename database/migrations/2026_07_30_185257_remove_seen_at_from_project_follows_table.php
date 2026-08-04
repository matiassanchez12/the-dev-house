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
        Schema::table('project_follows', function (Blueprint $table) {
            $table->dropColumn('seen_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('project_follows', function (Blueprint $table) {
            $table->timestamp('seen_at')->nullable()->after('user_id');
        });
    }
};
