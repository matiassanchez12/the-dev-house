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
        // PostgreSQL uses VARCHAR with CHECK constraint, not ENUM
        // Drop old constraint and create new one with expanded values
        
        DB::statement("ALTER TABLE social_links ADD CONSTRAINT social_links_platform_check CHECK (platform IN ('github', 'linkedin', 'twitter', 'website', 'youtube', 'discord', 'stackoverflow'))");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // PostgreSQL: Not easily reversible - would require recreating the type
        // This is a one-way migration for adding new platforms
    }
};
