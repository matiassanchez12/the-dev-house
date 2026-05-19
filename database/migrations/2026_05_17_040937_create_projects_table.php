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
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // creator
            $table->string('title');
            $table->string('slug')->unique()->index();
            $table->text('description');
            $table->text('vision')->nullable(); // visión completa del proyecto
            $table->json('images')->nullable(); // array de URLs de imágenes
            $table->string('status')->default('open'); // open, closed, completed
            $table->string('repository_url')->nullable();
            $table->string('demo_url')->nullable();
            $table->timestamps();

            $table->index('user_id');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};
