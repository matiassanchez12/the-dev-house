<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class UserTech extends Pivot
{
    protected $fillable = [
        'years_experience',
        'proficiency',
    ];
}
