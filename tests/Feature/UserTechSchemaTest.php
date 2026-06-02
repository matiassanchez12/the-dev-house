<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class UserTechSchemaTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Schema test for #30: years_experience must be an integer column type,
     * not decimal. The previous decimal(3,1) type allowed values like 1.5
     * to be stored, which is inconsistent with the domain (years of
     * experience are whole numbers) and with the FormRequest validation
     * rule that already requires 'integer'.
     *
     * Accepts Laravel's logical types AND PostgreSQL's native aliases
     * (int2/int4/int8, smallint/serial, etc.) because Laravel maps
     * unsignedTinyInteger to SMALLINT on PG.
     */
    public function test_years_experience_column_is_an_integer_type(): void
    {
        $type = DB::getSchemaBuilder()->getColumnType('user_tech', 'years_experience');

        $this->assertContains(
            $type,
            [
                // Laravel logical types
                'tinyinteger', 'smallinteger', 'integer', 'biginteger',
                // PostgreSQL native aliases
                'int2', 'int4', 'int8', 'smallint', 'serial', 'bigserial',
            ],
            "Expected years_experience to be an integer column, got '{$type}'."
        );
    }
}
