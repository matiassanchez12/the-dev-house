<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_privacy_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();

            // Privacy-first defaults: sensitive data is OFF until the user opts in.
            $table->boolean('show_email')->default(false);
            $table->boolean('show_phone')->default(false);

            // Discovery is the directory listing; reasonable default ON so newcomers
            // are visible by default. Off is the explicit privacy opt-out.
            $table->boolean('is_discoverable')->default(true);

            // Activity includes public projects and join request history.
            $table->boolean('show_activity')->default(true);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_privacy_settings');
    }
};
