<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ContactMessage extends Model
{
    use HasFactory;

    protected $casts = [
        'satisfaction' => 'integer',
    ];

    protected $fillable = [
        'email',
        'improvements',
        'missing_feature',
        'name',
        'preferred_project_type',
        'satisfaction',
        'tech_stack',
        'understood_purpose',
        'would_join_project',
    ];
}
