#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { Worker } from 'worker_threads';
import { program } from 'commander';
import cliProgress from 'cli-progress';

program
  .requiredOption('-i, --input <folder>', 'Input folder path')
  .requiredOption('-o, --output <folder>', 'Output folder path')
  .option('-q, --quality <number>', 'JPEG quality (1-100)', '70')
  .option('-t, --threads <number>', 'Max concurrent threads', '16');

program.parse(process.argv);
const { input, output, quality, threads } = program.opts();
const qualityVal = parseInt(quality);
const maxThreads = parseInt(threads);

if (!fs.existsSync(output)) fs.mkdirSync(output, { recursive: true });

const supportedExtensions = ['.jpg', '.jpeg', '.png'];
const allFiles = fs.readdirSync(input).filter(file =>
  supportedExtensions.includes(path.extname(file).toLowerCase())
);

console.log(`🖼️ Found ${allFiles.length} image(s) in "${input}"`);
console.log(`🧵 Using max ${maxThreads} threads`);

const progress = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
progress.start(allFiles.length, 0);

let completed = 0;
let activeThreads = 0;
const queue = [...allFiles];

function runNext() {
  if (queue.length === 0 && activeThreads === 0) {
    progress.stop();
    console.log('✅ All files compressed!');
    return;
  }

  while (activeThreads < maxThreads && queue.length > 0) {
    const file = queue.shift();
    activeThreads++;

    const worker = new Worker('./worker.js', {
      workerData: {
        inputDir: input,
        outputDir: output,
        fileName: file,
        quality: qualityVal
      }
    });

    worker.on('message', () => {
      completed++;
      activeThreads--;
      progress.update(completed);
      runNext(); // launch another task
    });

    worker.on('error', err => {
      console.error(`❌ Worker error on file ${file}:`, err.message);
      activeThreads--;
      runNext(); // even on error, continue
    });
  }
}

runNext();
