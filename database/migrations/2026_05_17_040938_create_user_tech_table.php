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
        Schema::create('user_tech', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('tech_id')->constrained('techs')->onDelete('cascade');
            $table->decimal('years_experience', 3, 1)->nullable(); // 0.0 a 99.9 años
            $table->string('proficiency')->nullable(); // basic, intermediate, advanced, expert
            $table->unique(['user_id', 'tech_id']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_tech');
    }
};
