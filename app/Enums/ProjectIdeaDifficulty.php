<?php

namespace App\Enums;

enum ProjectIdeaDifficulty: string
{
    case Principiante = 'principiante';
    case Intermedio = 'intermedio';
    case Avanzado = 'avanzado';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
