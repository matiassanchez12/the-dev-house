<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::statement("ALTER TABLE social_links MODIFY COLUMN platform ENUM('github', 'linkedin', 'twitter', 'website', 'youtube', 'discord', 'stackoverflow') NOT NULL");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("ALTER TABLE social_links MODIFY COLUMN platform ENUM('github', 'linkedin', 'twitter', 'website') NOT NULL");
    }
};
