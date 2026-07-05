<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('contact_messages', function (Blueprint $table): void {
            $table->dropColumn(['reason', 'message']);
            $table->unsignedTinyInteger('satisfaction')->after('email');
            $table->string('understood_purpose', 20)->after('satisfaction');
            $table->string('would_join_project', 20)->after('understood_purpose');
            $table->text('missing_feature')->after('would_join_project');
            $table->string('tech_stack')->after('missing_feature');
            $table->string('preferred_project_type', 20)->after('tech_stack');
            $table->text('improvements')->after('preferred_project_type');
        });
    }

    public function down(): void
    {
        Schema::table('contact_messages', function (Blueprint $table): void {
            $table->dropColumn([
                'satisfaction',
                'understood_purpose',
                'would_join_project',
                'missing_feature',
                'tech_stack',
                'preferred_project_type',
                'improvements',
            ]);
            $table->string('reason')->after('email');
            $table->text('message')->after('reason');
        });
    }
};
