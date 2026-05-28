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
        // PostgreSQL: Add new values to the existing enum type
        DB::statement("ALTER TYPE social_links_platform_enum ADD VALUE IF NOT EXISTS 'youtube'");
        DB::statement("ALTER TYPE social_links_platform_enum ADD VALUE IF NOT EXISTS 'discord'");
        DB::statement("ALTER TYPE social_links_platform_enum ADD VALUE IF NOT EXISTS 'stackoverflow'");
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
