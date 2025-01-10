<?php

namespace App\Services\DataFiles;

use DateTimeInterface;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use RuntimeException;

readonly class DataFile
{
    protected string $path;

    protected string $absolutePath;

    public function __construct(string $path)
    {
        $this->path = $path;
        $this->absolutePath = storage_path($path);
    }

    /**
     * Checks if the DataFile exists.
     */
    public function exists(): bool
    {
        return File::exists($this->absolutePath);
    }

    /**
     * Checks if this DataFile is a directory.
     */
    public function isDirectory(): bool
    {
        return File::isDirectory($this->absolutePath);
    }

    /**
     * Checks if this DataFile is a file.
     */
    public function isFile(): bool
    {
        return File::isFile($this->absolutePath);
    }

    /**
     * Checks if this DataFile is readable.
     */
    public function isReadable(): bool
    {
        return File::isReadable($this->absolutePath);
    }

    /**
     * Checks if this DataFile is writable.
     */
    public function isWritable(): bool
    {
        return File::isWritable($this->absolutePath);
    }

    /**
     * Link this DataFile to a target.
     */
    public function link(string $target): ?bool
    {
        return File::link($this->absolutePath, $target);
    }

    /**
     * Move this DataFile to a target.
     */
    public function move(string $target): bool
    {
        if ($this->isDirectory()) {
            return File::moveDirectory($this->absolutePath, $target);
        }

        return File::move($this->absolutePath, $target);
    }

    /**
     * Copy this DataFile to a target.
     */
    public function copy(string $target): bool
    {
        if ($this->isDirectory()) {
            return File::copyDirectory($this->absolutePath, $target);
        }

        return File::copy($this->absolutePath, $target);
    }

    /**
     * Delete this DataFile.
     */
    public function delete(): bool
    {
        if ($this->isDirectory()) {
            return File::deleteDirectory($this->absolutePath);
        }

        return File::delete($this->absolutePath);
    }

    /**
     * Generate the hash of this DataFile.
     */
    public function hash(string $algorithm = 'md5'): string|false
    {
        return File::hash($this->absolutePath, $algorithm);
    }

    /**
     * Get or set the mode of this DataFile.
     */
    public function chmod(?int $mode = null): bool|string
    {
        return File::chmod($this->absolutePath, $mode);
    }

    /**
     * Get the name of this DataFile.
     */
    public function name(): string
    {
        return File::basename($this->absolutePath);
    }

    /**
     * Get the name of this DataFile without the extension.
     */
    public function nameWithoutExtension(): string
    {
        return File::name($this->absolutePath);
    }

    /**
     * Get the dirname of this DataFile.
     */
    public function dirname(): string
    {
        return File::dirname($this->absolutePath);
    }

    /**
     * Get the relative path of this DataFile.
     */
    public function relativePath(): string
    {
        return $this->path;
    }

    /**
     * Get the absolute path of this DataFile.
     */
    public function absolutePath(): string
    {
        return $this->absolutePath;
    }

    /**
     * Get the extension of this DataFile.
     */
    public function extension(): string
    {
        return File::extension($this->path);
    }

    /**
     * Get the mime type of this DataFile.
     */
    public function mimeType(): string|false
    {
        return File::mimeType($this->absolutePath);
    }

    /**
     * Get the size of this DataFile.
     */
    public function size(): int
    {
        return File::size($this->absolutePath);
    }

    /**
     * Generate a temporary URL for this DataFile.
     * DataFiles are stored in the local private directory.
     * A temporary URL is generated for the file using the local storage disk.
     * The URL is valid for a limited time, which is set through the $expiration parameter or the default_temporary_url_expiration configuration value.
     * If the local storage disk does not contain the file, an exception is thrown.
     */
    public function temporaryUrl(?DateTimeInterface $expiration = null): string
    {
        if ($expiration === null) {
            $expiration = now()->addMinutes(config('rnadetector.default_temporary_url_expiration'));
        }
        $localStorage = Storage::disk('local');
        $localStoragePath = rtrim($localStorage->path('/'), DIRECTORY_SEPARATOR);
        if (! str_starts_with($this->absolutePath, $localStoragePath)) {
            throw new RuntimeException('Cannot generate URL for the file: the data path is outside of the local storage disk.');
        }
        $relativePath = substr($this->absolutePath, strlen($localStoragePath));

        return $localStorage->temporaryUrl($relativePath, $expiration);
    }
}
