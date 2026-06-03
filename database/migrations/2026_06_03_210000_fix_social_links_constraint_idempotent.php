<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::connection()->getDriverName() === 'sqlite') {
            return;
        }

        DB::statement('ALTER TABLE social_links DROP CONSTRAINT IF EXISTS social_links_platform_check');

        Schema::table('social_links', function (Blueprint $table) {
            $table->string('platform', 50)->change();
        });
    }

    public function down(): void
    {
        if (DB::connection()->getDriverName() === 'sqlite') {
            return;
        }

        DB::statement('ALTER TABLE social_links DROP CONSTRAINT IF EXISTS social_links_platform_check');

        DB::statement("ALTER TABLE social_links ADD CONSTRAINT social_links_platform_check CHECK (platform IN ('github', 'linkedin', 'twitter', 'website', 'youtube', 'discord', 'stackoverflow'))");
    }
};
