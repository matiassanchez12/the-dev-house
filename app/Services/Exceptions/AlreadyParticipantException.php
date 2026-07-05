<?php

namespace App\Services\Exceptions;

use Exception;

class AlreadyParticipantException extends Exception
{
    public function __construct()
    {
        parent::__construct('Ya sos participante de este proyecto');
    }
}