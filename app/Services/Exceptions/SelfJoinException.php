<?php

namespace App\Services\Exceptions;

use Exception;

class SelfJoinException extends Exception
{
    public function __construct()
    {
        parent::__construct('No puedes unirte a tu propio proyecto');
    }
}