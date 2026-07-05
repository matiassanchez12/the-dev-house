<?php

namespace App\Enums;

enum ProjectStatus: string
{
    case Open = 'open';
    case InProgress = 'in_progress';
    case Completed = 'completed';
    case Closed = 'closed';

    public function transitions(): array
    {
        return match ($this) {
            self::Open => [self::InProgress, self::Closed],
            self::InProgress => [self::Completed, self::Closed],
            self::Completed => [self::Closed],
            self::Closed => [],
        };
    }

    public function canTransitionTo(self $target): bool
    {
        return in_array($target, $this->transitions(), true);
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    /**
     * A project accepts new join requests while it is open or in progress.
     * Once it reaches completed/closed, no new requests are allowed.
     */
    public function acceptsJoinRequests(): bool
    {
        return $this === self::Open || $this === self::InProgress;
    }
}
