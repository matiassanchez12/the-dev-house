<?php

namespace App\Services\Exceptions;

use Exception;

class DuplicateJoinRequestException extends Exception
{
    public function __construct()
    {
        parent::__construct('Ya tienes una solicitud pendiente para este proyecto');
    }
}