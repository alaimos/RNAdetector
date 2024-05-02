"use server";
import { ContentPostProcessingFunction } from "@/plugins/_base/plugin-types";
import { createReadStream, existsSync } from "fs";
import unzip from "unzipper";
import { dirname, join } from "path";
import { mkdir } from "fs/promises";
import { spawn } from "child_process";
import { createWriteStream } from "node:fs";

type LogFn = (message: string) => Promise<unknown>;

async function extractZipFile(
  zipFile: string,
  destination: string,
  log: LogFn,
) {
  const zip = createReadStream(zipFile).pipe(
    unzip.Parse({ forceStream: true }),
  );
  for await (const entry of zip) {
    const { path, type } = entry;
    const destinationPath = join(destination, path);
    await log(`  - ${path}`);
    if (type === "Directory") {
      await mkdir(destinationPath, { recursive: true });
      entry.autodrain();
    } else {
      const destinationDir = dirname(destinationPath);
      await mkdir(destinationDir, { recursive: true });
      entry.pipe(createWriteStream(destinationPath));
    }
  }
}

async function extractTarFile(
  tarFile: string,
  destination: string,
  log: LogFn,
) {
  return new Promise<void>((resolve, reject) => {
    const process = spawn("tar", ["-xvf", tarFile, "-C", destination], {
      cwd: destination,
    })
      .on("error", (err) => {
        reject(err);
      })
      .on("close", (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error("Failed to extract archive"));
        }
      });
    process.stdout.on("data", (data) => {
      log(data.toString().trim());
    });
    process.stderr.on("data", (data) => {
      log(data.toString().trim());
    });
  });
}

export const genomeIndexArchiveJob: ContentPostProcessingFunction = async (
  _,
  uploadedFile,
  dataPath,
  job,
) => {
  if (!existsSync(uploadedFile)) {
    throw new Error("File not found");
  }
  if (!existsSync(dataPath)) {
    throw new Error("Data folder not found");
  }
  const extractPath = join(dataPath, "index");
  await job.log(`Extracting index from ${uploadedFile} to ${extractPath}...`);
  if (!existsSync(extractPath)) {
    await mkdir(extractPath, { recursive: true });
  }
  const uploadedFileLower = uploadedFile.toLowerCase();
  if (uploadedFileLower.endsWith(".zip")) {
    await extractZipFile(uploadedFile, extractPath, async (m) => job.log(m));
  } else if (
    uploadedFileLower.endsWith(".tar.gz") ||
    uploadedFileLower.endsWith(".tgz") ||
    uploadedFileLower.endsWith(".tar.bz2") ||
    uploadedFileLower.endsWith(".tar.xz") ||
    uploadedFileLower.endsWith(".tar")
  ) {
    await extractTarFile(uploadedFile, extractPath, async (m) => job.log(m));
  } else {
    throw new Error("Unsupported archive format");
  }
  await job.log("Index extracted!");
  return { index: extractPath };
};
