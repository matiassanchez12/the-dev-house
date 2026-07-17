<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_notification_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->boolean('collaboration_emails')->default(true);
            $table->timestamps();
        });

        DB::table('users')
            ->leftJoin('user_privacy_settings', 'user_privacy_settings.user_id', '=', 'users.id')
            ->select([
                'users.id as user_id',
                DB::raw('COALESCE(user_privacy_settings.email_notifications_enabled, TRUE) as collaboration_emails'),
                DB::raw('CURRENT_TIMESTAMP as created_at'),
                DB::raw('CURRENT_TIMESTAMP as updated_at'),
            ])
            ->orderBy('users.id')
            ->get()
            ->chunk(500)
            ->each(function ($rows): void {
                DB::table('user_notification_settings')->insert($rows->map(fn ($row) => (array) $row)->all());
            });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_notification_settings');
    }
};
