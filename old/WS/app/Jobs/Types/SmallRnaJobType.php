<?php
/**
 * RNADetector Web Service
 *
 * @author A. La Ferlita, Ph.D. Student <alessandrolf90 at hotmail dot it>
 * @author S. Alaimo, Ph.D. <alaimos at gmail dot com>
 */

namespace App\Jobs\Types;


use App\Exceptions\ProcessingJobException;
use App\Jobs\Types\Traits\ConvertsSamToBamTrait;
use App\Jobs\Types\Traits\HandlesCompressedFastqTrait;
use App\Jobs\Types\Traits\HasCommonParameters;
use App\Jobs\Types\Traits\IndexesBAMTrait;
use App\Jobs\Types\Traits\RunTrimGaloreTrait;
use App\Jobs\Types\Traits\UseAlignmentTrait;
use App\Jobs\Types\Traits\UseCountingTrait;
use App\Jobs\Types\Traits\UseGenome;
use App\Jobs\Types\Traits\UseGenomeAnnotation;
use App\Jobs\Types\Traits\UsesJBrowseTrait;
use App\Jobs\Types\Traits\UseTranscriptome;
use App\Models\Annotation;
use App\Models\Job;
use App\Models\Reference;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SmallRnaJobType extends AbstractJob
{
    use HasCommonParameters, ConvertsSamToBamTrait, RunTrimGaloreTrait, UseAlignmentTrait, UseCountingTrait, HandlesCompressedFastqTrait;
    use UseTranscriptome, UseGenome, UseGenomeAnnotation, IndexesBAMTrait, UsesJBrowseTrait;

    /**
     * Returns an array containing for each input parameter an help detailing its content and use.
     *
     * @return array
     */
    public static function parametersSpec(): array
    {
        return array_merge(
            self::commonParametersSpec(),
            [
                'algorithm'                  => 'Alignment/quantification algorithm: salmon, hisat2, star (Default: star)',
                'countingAlgorithm'          => 'The counting algorithm htseq, feature-counts, or salmon (Default: feature-counts)',
                'genome'                     => 'An optional name for a reference genome (Default human hg19)',
                'transcriptome'              => 'An optional name for a transcriptome if counting algorithm is salmon (Default human hg19)',
                'annotation'                 => 'An optional name for a GTF genome annotation (Default human hg19)',
                'threads'                    => 'Number of threads for this analysis (Default 1)',
                'alignment_custom_arguments' => 'An optional string containing custom arguments for the alignment software',
                'counting_custom_arguments'  => 'An optional string containing custom arguments for the counting software',
            ]
        );
    }

    /**
     * Returns an array containing for each output value an help detailing its use.
     *
     * @return array
     */
    public static function outputSpec(): array
    {
        return [
            'outputFile'                => 'Raw output file',
            'harmonizedFile'            => 'Harmonized output file',
            'harmonizedTranscriptsFile' => 'Harmonized output file for transcripts expression',
        ];
    }

    /**
     * Returns an array containing rules for input validation.
     *
     * @param  \Illuminate\Http\Request  $request
     *
     * @return array
     */
    public static function validationSpec(Request $request): array
    {
        return array_merge(
            self::commonParametersValidation($request),
            [
                'algorithm'                  => ['filled', Rule::in(self::VALID_ALIGN_QUANT_METHODS)],
                'countingAlgorithm'          => ['filled', Rule::in(self::VALID_COUNTING_METHODS)],
                'genome'                     => ['filled', 'alpha_dash', Rule::exists('references', 'name')],
                'annotation'                 => ['filled', 'alpha_dash', Rule::exists('annotations', 'name')],
                'transcriptome'              => ['filled', 'alpha_dash', Rule::exists('references', 'name')],
                'threads'                    => ['filled', 'integer'],
                'alignment_custom_arguments' => ['filled', 'string'],
                'counting_custom_arguments'  => ['filled', 'string'],
            ]
        );
    }

    /**
     * Checks the input of this job and returns true iff the input contains valid data
     * The default implementation does nothing.
     *
     * @return bool
     */
    public function isInputValid(): bool
    {
        if (!$this->validateCommonParameters($this->model, self::VALID_INPUT_TYPES, self::FASTQ)) {
            return false;
        }
        $algorithm = $this->model->getParameter('algorithm', self::STAR);
        if (!in_array($algorithm, self::VALID_ALIGN_QUANT_METHODS, true)) {
            return false;
        }
        $countingAlgorithm = $this->model->getParameter('countingAlgorithm', self::FEATURECOUNTS_COUNTS);
        if (!in_array($countingAlgorithm, self::VALID_COUNTING_METHODS, true)) {
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
        $this->log('Starting small ncRNAs analysis.');
        $paired = (bool)$this->getParameter('paired', false);
        $inputType = $this->getParameter('inputType');
        $convertBam = (bool)$this->getParameter('convertBam', false);
        $firstInputFile = $this->getParameter('firstInputFile');
        $secondInputFile = $this->getParameter('secondInputFile');
        $trimGaloreEnable = (bool)$this->getParameter('trimGalore.enable', $inputType === self::FASTQ);
        $trimGaloreQuality = (int)$this->getParameter('trimGalore.quality', 20);
        $trimGaloreLength = (int)$this->getParameter('trimGalore.length', 14);
        $threads = (int)$this->getParameter('threads', 1);
        $algorithm = $this->getParameter('algorithm', self::STAR);
        $countingAlgorithm = $this->getParameter('countingAlgorithm', self::FEATURECOUNTS_COUNTS);
        if ($inputType === self::SAM) {
            $firstInputFile = self::convertSamToBam($this->model, $firstInputFile);
            $inputType = self::BAM;
        }
        if ($inputType === self::BAM && $convertBam) {
            [$firstInputFile, $secondInputFile] = self::convertBamToFastq(
                $this->model,
                $paired,
                $firstInputFile
            );
            $inputType = self::FASTQ;
        }
        $outputFile = '';
        $outputUrl = '';
        $harmonizedGeneFile = '';
        $harmonizedGeneUrl = '';
        $harmonizedTxFile = null;
        $harmonizedTxUrl = null;
        $countingInputFile = '';
        $bamOutput = null;
        $count = true;
        $makeJBrowse = true;
        if ($inputType === self::FASTQ) {
            $this->log('Checking if input is compressed...');
            $firstInputFile = self::checksForCompression($this->model, $firstInputFile);
            $secondInputFile = self::checksForCompression($this->model, $secondInputFile);
            [$firstTrimmedFastq, $secondTrimmedFastq] = [$firstInputFile, $secondInputFile];
            if ($trimGaloreEnable) {
                [$firstTrimmedFastq, $secondTrimmedFastq] = $this->runTrimGalore(
                    $this->model,
                    $paired,
                    $firstInputFile,
                    $secondInputFile,
                    $trimGaloreQuality,
                    $trimGaloreLength,
                    false,
                    $threads
                );
            }
            switch ($algorithm) {
                case self::HISAT2:
                    $countingInputFile = $this->runHisat(
                        $this->model,
                        $paired,
                        $firstTrimmedFastq,
                        $secondTrimmedFastq,
                        $this->getGenome(),
                        $threads
                    );
                    break;
                case self::STAR:
                    $countingInputFile = $this->runSTAR(
                        $this->model,
                        $paired,
                        $firstTrimmedFastq,
                        $secondTrimmedFastq,
                        $this->getGenome(),
                        $this->getGenomeAnnotation('human_sncrna_annotation_name'),
                        $threads
                    );
                    break;
                case self::SALMON:
                    [
                        $outputFile,
                        $outputUrl,
                        $harmonizedGeneFile,
                        $harmonizedGeneUrl,
                        $harmonizedTxFile,
                        $harmonizedTxUrl,
                    ] = $this->runSalmon(
                        $this->model,
                        $paired,
                        $firstTrimmedFastq,
                        $secondTrimmedFastq,
                        $inputType,
                        $this->getTranscriptome('human_transcriptome_sncrna_name'),
                        $threads
                    );
                    $makeJBrowse = $count = false;
                    break;
            }
            if ($countingInputFile) {
                $bamOutput = $this->getFilePaths($countingInputFile);
            }
        } else {
            $countingInputFile = $firstInputFile;
            $bamOutput = $this->indexBAM($this->model, $countingInputFile, true, $threads);
        }
        if ($count) {
            switch ($countingAlgorithm) {
                case self::HTSEQ_COUNTS:
                    [$outputFile, $outputUrl, $harmonizedGeneFile, $harmonizedGeneUrl] = $this->runHTSEQ(
                        $this->model,
                        $countingInputFile,
                        $this->getGenomeAnnotation('human_sncrna_annotation_name'),
                        $threads
                    );
                    break;
                case self::FEATURECOUNTS_COUNTS:
                    [$outputFile, $outputUrl, $harmonizedGeneFile, $harmonizedGeneUrl] = $this->runFeatureCount(
                        $this->model,
                        $countingInputFile,
                        $this->getGenomeAnnotation('human_sncrna_annotation_name'),
                        $threads
                    );
                    break;
                case self::SALMON:
                    [
                        $outputFile,
                        $outputUrl,
                        $harmonizedGeneFile,
                        $harmonizedGeneUrl,
                        $harmonizedTxFile,
                        $harmonizedTxUrl,
                    ] = $this->runSalmonCount(
                        $this->model,
                        $paired,
                        $countingInputFile,
                        $this->getTranscriptome('human_transcriptome_sncrna_name'),
                        $threads
                    );
                    $makeJBrowse = false;
                    break;
                default:
                    throw new ProcessingJobException('Invalid counting algorithm');
            }
        }
        $output = [
            'type'           => self::OUT_TYPE_ANALYSIS_HARMONIZED,
            'outputFile'     => [
                'path' => $outputFile,
                'url'  => $outputUrl,
            ],
            'outputBamFile'  => $this->getFilePathsForOutput($bamOutput),
            'harmonizedFile' => [
                'path' => $harmonizedGeneFile,
                'url'  => $harmonizedGeneUrl,
            ],
        ];
        if ($makeJBrowse) {
            $output['outputJBrowseFile'] = $this->getFilePathsForOutput(
                $this->makeJBrowseConfig(
                    $this->model,
                    $bamOutput,
                    $this->getGenome(),
                    $this->getGenomeAnnotation('human_sncrna_annotation_name')
                )
            );
        }
        if ($harmonizedTxFile !== null) {
            $output['type'] = self::OUT_TYPE_ANALYSIS_HARMONIZED_TRANSCRIPTS;
            $output['harmonizedTranscriptsFile'] = [
                'path' => $harmonizedTxFile,
                'url'  => $harmonizedTxUrl,
            ];
        }
        $this->model->setOutput($output);
        $this->log('Analysis completed.');
        $this->model->save();
    }

    /**
     * Returns a description for this job
     *
     * @return string
     */
    public static function description(): string
    {
        return 'Runs small ncRNAs analysis from sequencing data';
    }

    /**
     * @inheritDoc
     */
    public static function sampleGroupFunctions(): ?array
    {
        return [
            static function (Job $job) {
                return $job->sample_code;
            },
            static function (Job $job) {
                $output = $job->getOutput('harmonizedFile');

                return $job->absoluteJobPath($output['path']);
            },
            static function (Job $job) {
                $output = $job->getOutput('outputFile');

                return $job->absoluteJobPath($output['path']);
            },
            static function (Job $job) {
                $output = $job->getOutput('harmonizedTranscriptsFile');
                if ($output === null) {
                    return null;
                }

                return $job->absoluteJobPath($output['path']);
            },
            static function (Job $job) {
                $algorithm = $job->getParameter('algorithm', self::SALMON);
                $countingAlgorithm = $job->getParameter('countingAlgorithm', self::FEATURECOUNTS_COUNTS);
                $transcriptome = $job->getParameter('transcriptome', config('rnadetector.human_transcriptome_name'));
                $annotation = $job->getParameter('annotation', config('rnadetector.human_rna_annotation_name'));

                return ($algorithm === self::SALMON || $countingAlgorithm === self::SALMON) ?
                    Reference::whereName($transcriptome)->firstOrFail()->map_path :
                    Annotation::whereName($annotation)->firstOrFail()->map_path;
            },
        ];
    }

    /**
     * @inheritDoc
     */
    public static function displayName(): string
    {
        return 'SmallRNA-seq Analysis';
    }
}
