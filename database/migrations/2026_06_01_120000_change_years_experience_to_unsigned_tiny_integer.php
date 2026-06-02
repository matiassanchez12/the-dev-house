<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('user_tech', function (Blueprint $table) {
            $table->unsignedTinyInteger('years_experience')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('user_tech', function (Blueprint $table) {
            $table->decimal('years_experience', 3, 1)->nullable()->change();
        });
    }
};
