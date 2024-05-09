#!/usr/bin/env bash
set -e
echo "Installing Miniforge..."
wget --no-verbose --show-progress --progress=bar:force:noscroll \
  "https://github.com/conda-forge/miniforge/releases/latest/download/Miniforge3-$(uname)-$(uname -m).sh" \
  -O "/rnadetector/miniforge/miniforge.sh"
bash "/rnadetector/miniforge/miniforge.sh" -b -f -p "/rnadetector/miniforge"
rm "/rnadetector/miniforge/miniforge.sh"
source "/home/rnadetector/.bashrc"
echo "Installing Snakemake..."
mamba create -q -y -c conda-forge -c bioconda -n snakemake snakemake snakedeploy
