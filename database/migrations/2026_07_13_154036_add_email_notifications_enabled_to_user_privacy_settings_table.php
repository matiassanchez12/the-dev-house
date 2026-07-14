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
        Schema::table('user_privacy_settings', function (Blueprint $table) {
            $table->boolean('email_notifications_enabled')->default(true)->after('show_activity');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_privacy_settings', function (Blueprint $table) {
            $table->dropColumn('email_notifications_enabled');
        });
    }
};
