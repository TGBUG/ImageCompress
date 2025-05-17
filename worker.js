import { workerData, parentPort } from 'worker_threads';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

(async () => {
  const { inputDir, outputDir, fileName, quality } = workerData;

  const inputPath = path.join(inputDir, fileName);
  const outputFileName = `${path.parse(fileName).name}.jpg`;
  const outputPath = path.join(outputDir, outputFileName);

  try {
    await sharp(inputPath)
      .jpeg({ quality: quality, mozjpeg: true })
      .toFile(outputPath);
    
    parentPort.postMessage('done');
  } catch (err) {
    parentPort.postMessage('error');
    throw err;
  }
})();
