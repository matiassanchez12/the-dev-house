<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! app()->environment('testing') || DB::connection()->getDriverName() !== 'sqlite') {
            return;
        }

        Schema::table('social_links', function (Blueprint $table): void {
            $table->string('platform', 50)->change();
        });
    }

    public function down(): void
    {
        if (! app()->environment('testing') || DB::connection()->getDriverName() !== 'sqlite') {
            return;
        }

        Schema::table('social_links', function (Blueprint $table): void {
            $table->enum('platform', ['github', 'linkedin', 'twitter', 'website'])->change();
        });
    }
};
