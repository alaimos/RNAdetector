#!/bin/bash

##############################################################################
# Options:
# 	-a FILE GTF
# 	-g BWA INDEXED REFERENCE GENOME FOLDER WITH PREFIX
# 	-t NUMBER OF THREADS
# 	-f FIRST INPUT FASTQ (trimmed FASTQ file)
# 	-s OPTIONAL SECOND INPUT FASTQ (FOR PAIRED) (trimmed FASTQ file)
# 	-o OUTPUT SAM FILE
##############################################################################
while getopts ":a:g:t:f:s:o:" opt; do
  case $opt in
  a) GTF_FILE=$OPTARG ;;
  g) REF_GENOME=$OPTARG ;;
  t) THREADS=$OPTARG ;;
  f) INPUT_1=$OPTARG ;;
  s) INPUT_2=$OPTARG ;;
  o) OUTPUT=$OPTARG ;;
  \?)
    echo "Invalid option: -$OPTARG" >&2
    exit 1
    ;;
  :)
    echo "Option -$OPTARG requires an argument." >&2
    exit 2
    ;;
  esac
done

#### Check parameters ####

# Check GTF annotation files
if [ -z "$GTF_FILE" ] || [ ! -f "$GTF_FILE" ]; then
  echo "Annotation file does not exist!"
  exit 3
fi

# Check input files
if [ -z "$INPUT_1" ] || [ ! -f "$INPUT_1" ]; then
  echo "Input file does not exist!" >&2
  exit 4
fi

# Control sequencing strategy "single end" o "paired end"
if [ -z "$INPUT_2" ]; then
  PAIRED=false
elif [ ! -f "$INPUT_2" ]; then
  echo "Second input file does not exist!" >&2
  exit 5
else
  PAIRED=true
fi

# Check number of threads and set 1 as default value
if [ -z "$THREADS" ]; then
  THREADS=1
fi

# Check output
if [ -z "$OUTPUT" ]; then
  echo "Output file must be specified!" >&2
  exit 6
fi

# Check if output directory is writable
if [ ! -w "$(dirname "$OUTPUT")" ]; then
  echo "Output directory is not writable!" >&2
  exit 7
fi

#### Alignment ####
if [ $PAIRED = "true" ]; then
  bwa mem -t "$THREADS" "$REF_GENOME" "$INPUT_1" "$INPUT_2" >"$OUTPUT"
else
  bwa mem -t "$THREADS" "$REF_GENOME" "$INPUT_1" >"$OUTPUT"
fi

#Check SAM file
if [ ! -f "$OUTPUT" ]; then
  echo "Unable to find bwa output file!" >&2
  exit 8
fi

chmod 777 "$OUTPUT"
