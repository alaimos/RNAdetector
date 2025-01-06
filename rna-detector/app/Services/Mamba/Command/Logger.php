<?php

namespace App\Services\Mamba\Command;

use App\Services\Mamba\Contracts\Logger as LoggerContract;
use Closure;
use Override;

abstract class Logger implements LoggerContract
{
    /**
     * Get a logger that uses a closure to log messages.
     *
     * @param  \Closure  $output  The closure to log output messages.
     * @param  \Closure|null  $error  The closure to log error messages (optional).
     */
    public static function fromClosure(Closure $output, ?Closure $error = null): LoggerContract
    {
        return new class($output, $error) extends Logger
        {
            public function __construct(
                private readonly Closure $outputClosure,
                private readonly ?Closure $errorClosure = null,
            ) {}

            #[Override]
            public function output(string $message): void
            {
                ($this->outputClosure)($message);
            }

            #[Override]
            public function error(string $message): void
            {
                if (! $this->errorClosure) {
                    return;
                }
                ($this->errorClosure)($message);
            }
        };
    }

    /**
     * Log an output message (stdout for processes).
     *
     * @param  string  $message  The message to log.
     */
    #[Override]
    public function output(string $message): void {}

    /**
     * Log an error message (stderr for processes).
     *
     * @param  string  $message  The message to log.
     */
    #[Override]
    public function error(string $message): void {}

    /**
     * Log a message based on the type.
     * If the type is 'stdout', the message should be logged as an output.
     * If the type is 'stderr', the message should be logged as an error.
     *
     * @param  'stdout'|'stderr'  $type  The type of message to log.
     * @param  string  $output  The message to log.
     */
    #[Override]
    public function __invoke(string $type, string $output): void
    {
        if ($type === 'stdout') {
            $this->output($output);
        } elseif ($type === 'stderr') {
            $this->error($output);
        }
    }
}
