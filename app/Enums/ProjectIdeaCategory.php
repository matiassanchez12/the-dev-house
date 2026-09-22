<?php

namespace App\Enums;

enum ProjectIdeaCategory: string
{
    case HerramientasDev = 'herramientas-dev';
    case Clones = 'clones';
    case AlternativasOss = 'alternativas-oss';
    case BotsAutomatizacion = 'bots-automatizacion';
    case Aprendizaje = 'aprendizaje';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
