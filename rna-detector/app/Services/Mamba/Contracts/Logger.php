<?php

namespace App\Services\Mamba\Contracts;

interface Logger
{
    /**
     * Log an output message (stdout for processes).
     *
     * @param  string  $message  The message to log.
     */
    public function output(string $message): void;

    /**
     * Log an error message (stderr for processes).
     *
     * @param  string  $message  The message to log.
     */
    public function error(string $message): void;

    /**
     * Log a message based on the type.
     * If the type is 'stdout', the message should be logged as an output.
     * If the type is 'stderr', the message should be logged as an error.
     *
     * @param  'stdout'|'stderr'  $type  The type of message to log.
     * @param  string  $output  The message to log.
     */
    public function __invoke(string $type, string $output): void;
}
