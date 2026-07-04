<?php

namespace App\Services\Exceptions;

use Exception;

class ProjectNotAcceptingRequestsException extends Exception
{
    public function __construct()
    {
        parent::__construct('Este proyecto no acepta nuevas solicitudes');
    }
}