<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('project_invitations', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
            $table->foreignId('invited_user_id')->constrained('users')->cascadeOnDelete();
            $table->unsignedBigInteger('pending_invitation_key')->nullable();
            $table->text('message')->nullable();
            $table->string('status')->default('pending');
            $table->timestamp('cancelled_at')->nullable();
            $table->timestamps();

            $table->index('status');
            $table->unique(['project_id', 'pending_invitation_key'], 'project_invitations_pending_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('project_invitations');
    }
};
