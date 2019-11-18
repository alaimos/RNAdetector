<?php
/**
 * RNADetector Web Service
 *
 * @author S. Alaimo, Ph.D. <alaimos at gmail dot com>
 */

namespace App\Jobs\Types;


use App\Exceptions\ProcessingJobException;
use App\Models\Annotation;
use Illuminate\Http\Request;
use Storage;

class AnnotationUploadJobType extends AbstractJob
{

    /**
     * Returns an array containing for each input parameter an help detailing its content and use.
     *
     * @return array
     */
    public static function parametersSpec(): array
    {
        return [
            'name'    => 'A name for this GTF annotation',
            'gtfFile' => 'The GTF file for this annotation',
        ];
    }

    /**
     * Returns an array containing for each output value an help detailing its use.
     *
     * @return array
     */
    public static function outputSpec(): array
    {
        return [
            'done' => 'A boolean that is true if the annotation has been successfully created',
        ];
    }

    /**
     * Returns an array containing rules for input validation.
     *
     * @param \Illuminate\Http\Request $request
     *
     * @return array
     */
    public static function validationSpec(Request $request): array
    {
        return [
            'name'    => ['required', 'alpha_dash', 'max:255'],
            'gtfFile' => ['required', 'string'],
        ];
    }

    /**
     * Checks the input of this job and returns true iff the input contains valid data
     * The default implementation does nothing.
     *
     * @return bool
     */
    public function isInputValid(): bool
    {
        $gtfFile = $this->model->getParameter('gtfFile');
        $disk = Storage::disk('public');
        $dir = $this->model->getJobDirectory() . '/';
        if (!$disk->exists($dir . $gtfFile)) {
            return false;
        }

        return true;
    }


    /**
     * Handles all the computation for this job.
     * This function should throw a ProcessingJobException if something went wrong during the computation.
     * If no exceptions are thrown the job is considered as successfully completed.
     *
     * @throws \App\Exceptions\ProcessingJobException
     */
    public function handle(): void
    {
        $this->log('Starting job.');
        $name = $this->model->getParameter('name');
        $file = $this->model->getParameter('gtfFile');
        $absoluteSourceFilename = $this->model->getAbsoluteJobDirectory() . '/' . $file;
        $annotationFileName = env('ANNOTATIONS_PATH') . '/' . $name . '.gtf';
        rename($absoluteSourceFilename, $annotationFileName);
        if (!file_exists($annotationFileName)) {
            throw new ProcessingJobException('Unable to create annotation file.');
        }
        Annotation::create(
            [
                'name' => $name,
                'path' => $annotationFileName,
            ]
        )->save();
        $this->log('Job completed!');
        $this->model->setOutput(['done' => true]);
        $this->model->save();
    }

    /**
     * Returns a description for this job
     *
     * @return string
     */
    public static function description(): string
    {
        return 'Upload a novel genome annotation';
    }
}
