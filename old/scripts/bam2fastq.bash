#!/bin/bash

##############################################################################
# Options:
# 	-b INPUT BAM
# 	-f FIRST OUTPUT FILE
#   -s SECOND OUTPUT FILE (only for paired)
##############################################################################
while getopts ":b:f:s:" opt; do
  case $opt in
  b) INPUT=$OPTARG ;;
  f) OUTPUT=$OPTARG ;;
  s) OUTPUT_2=$OPTARG ;;
  \?)
    echo "Invalid option: -$OPTARG"
    exit 1
    ;;
  :)
    echo "Option -$OPTARG requires an argument."
    exit 2
    ;;
  esac
done

#### Check parameters ####
# Check input files
if [ -z "$INPUT" ] || [ ! -f "$INPUT" ]; then
  echo "Input file does not exist!"
  exit 3
fi
# Check output
if [ -z "$OUTPUT" ]; then
  echo "Output file must be specified!"
  exit 4
fi

# Check if output directory is writable
if [ ! -w "$(dirname "$OUTPUT")" ]; then
  echo "Output directory is not writable!"
  exit 5
fi

if [ -z "$OUTPUT_2" ]; then
  PAIRED=false
else
  PAIRED=true
fi

# Check if output directory is writable
if [ ! -w "$(dirname "$OUTPUT_2")" ]; then
  echo "Output directory for second output is not writable!"
  exit 6
fi

#### Conversion from BAM to FASTQ ####
if [ $PAIRED = "true" ]; then
  if ! samtools fastq "$INPUT" -1 "$OUTPUT" -2 "$OUTPUT_2"; then
    echo "An error occurred during samtools execution!"
    exit 7
  fi
  chmod 777 "$OUTPUT_2"
else
  if ! samtools fastq "$INPUT" >"$OUTPUT"; then
    echo "An error occurred during samtools execution!"
    exit 7
  fi
fi
chmod 777 "$OUTPUT"
