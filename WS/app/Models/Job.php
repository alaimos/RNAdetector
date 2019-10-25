<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Storage;

/**
 * App\Models\Job
 *
 * @property int                             $id
 * @property string                          $job_type
 * @property string                          $status
 * @property array                           $job_parameters
 * @property array                           $job_output
 * @property string                          $log
 * @property int                             $user_id
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\User           $user
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\Job newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\Job newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\Job query()
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\Job whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\Job whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\Job whereJobOutput($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\Job whereJobParameters($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\Job whereJobType($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\Job whereLog($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\Job whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\Job whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\Job whereUserId($value)
 * @mixin \Eloquent
 */
class Job extends Model
{

    public const QUEUED = 'queued';
    public const PROCESSING = 'processing';
    public const COMPLETED = 'completed';
    public const FAILED = 'failed';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'job_type', 'status', 'job_parameters', 'job_output', 'log', 'user_id',
    ];

    /**
     * The attributes that should be cast to native types.
     *
     * @var array
     */
    protected $casts = [
        'job_parameters' => 'array',
        'job_output'     => 'array',
    ];

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function user()
    {
        return $this->belongsTo('App\Models\User', 'user_id', 'id');
    }

    /**
     * Set the status attribute.
     *
     * @param $value
     */
    public function setStatusAttribute($value): void
    {
        if (!in_array($value, [
            self::QUEUED, self::PROCESSING, self::COMPLETED, self::FAILED,
        ], true)) {
            $value = self::QUEUED;
        }
        $this->attributes['status'] = $value;
    }

    /**
     * Returns the path of the job storage directory
     *
     * @return string
     */
    public function getJobDirectory()
    {
        $path = 'jobs/' . $this->id;
        $disk = Storage::disk('public');
        if (!$disk->exists($path)) {
            $disk->makeDirectory($path);
        }
        return $path;
    }

    /**
     * Delete the job directory
     *
     * @return bool
     */
    public function deleteJobDirectory()
    {
        return Storage::disk('public')->deleteDirectory($this->getJobDirectory());
    }

    /**
     * Set the value of one or more output data.
     * If $parameter is an associative array sets multiple parameters at the same time.
     *
     * @param array|string $parameter
     * @param null|mixed   $value
     * @return $this
     */
    public function setOutput($parameter, $value = null): self
    {
        $tmp = $this->job_output;
        if ($value === null && is_array($parameter)) {
            foreach ($parameter as $p => $v) {
                $tmp[$p] = $v;
            }
        } else {
            $tmp[$parameter] = $value;
        }
        $this->job_output = $tmp;
        return $this;
    }

    /**
     * Get the value of an output data
     *
     * @param string|array|null $parameter
     * @param mixed             $default
     *
     * @return mixed
     */
    public function getOutput($parameter = null, $default = null)
    {
        if ($parameter === null) {
            return $this->job_output;
        }
        if (is_array($parameter)) {
            $slice = [];
            foreach ($parameter as $key) {
                $slice[$key] = $this->job_output[$key] ?? $default;
            }
            return $slice;
        }
        return $this->job_output[$parameter] ?? $default;
    }

    /**
     * Set the value of a parameter
     *
     * @param string $parameter
     * @param mixed  $value
     *
     * @return $this
     */
    public function setParameter($parameter, $value): self
    {
        $tmp                  = $this->job_parameters;
        $tmp[$parameter]      = $value;
        $this->job_parameters = $tmp;
        return $this;
    }

    /**
     * Add parameters to this job
     *
     * @param array $parameters
     *
     * @return $this
     */
    public function addParameters(array $parameters): self
    {
        $tmp = $this->job_parameters;
        foreach ($parameters as $param => $value) {
            $tmp[$param] = $value;
        }
        $this->job_parameters = $tmp;
        return $this;
    }

    /**
     * Set parameters of this job
     *
     * @param array $parameters
     *
     * @return $this
     */
    public function setParameters($parameters)
    {
        $this->job_parameters = [];
        return $this->addParameters($parameters);
    }

    /**
     * Get the value of a parameter
     *
     * @param string|array|null $parameter
     * @param mixed             $default
     *
     * @return mixed
     */
    public function getParameter($parameter = null, $default = null)
    {
        if ($parameter === null) {
            return $this->job_parameters;
        }
        if (is_array($parameter)) {
            $slice = [];
            foreach ($parameter as $key) {
                $slice[$key] = $this->job_parameters[$key] ?? $default;
            }
            return $slice;
        }
        return $this->job_parameters[$parameter] ?? $default;
    }

}
