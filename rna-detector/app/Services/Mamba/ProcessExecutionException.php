<?php

namespace App\Services\Mamba;

use Illuminate\Contracts\Process\ProcessResult;
use RuntimeException;

final class ProcessExecutionException extends RuntimeException
{
    public ProcessResult $processResult {
        get {
            return $this->processResult;
        }
    }

    public function __construct(ProcessResult $processResult)
    {
        parent::__construct(self::summarize($processResult));
    }

    public static function of(ProcessResult $processResult): self
    {
        return new self($processResult);
    }

    private static function summarize(ProcessResult $processResult): string
    {
        return "Failed to run command: {$processResult->command()}";
    }
}
