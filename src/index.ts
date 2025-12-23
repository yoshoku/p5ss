#!/usr/bin/env node

import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';
import packageJson from '../package.json';

async function takeScreenshot(
  inputFile: string,
  outputFile: string,
  frames: number = 1
): Promise<void> {
  const sketchCode = fs.readFileSync(inputFile, 'utf-8');
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <script src="https://cdn.jsdelivr.net/npm/p5@1.11.11/lib/p5.min.js"></script>
  <style>
    * { margin: 0; padding: 0; }
    body { display: flex; justify-content: center; align-items: center;
      min-height: 100vh; background: #fff;}
  </style>
</head>
<body>
  <script>
    ${sketchCode}

    window.p5FrameCount = 0;
    window.p5Ready = false;
    if (typeof draw !== 'undefined') {
      const originalDraw = draw;
      draw = function() {
        originalDraw();
        window.p5FrameCount++;
        if (window.p5FrameCount >= ${frames}) {
          window.p5Ready = true;
        }
      };
    } else {
      const originalSetup = typeof setup !== 'undefined' ? setup : function() {};
      setup = function() {
        originalSetup();
        window.p5Ready = true;
      };
    }
  </script>
</body>
</html>
  `;

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();

    await page.setViewport({ width: 1024, height: 768 });
    await page.setContent(html);
    await page.waitForFunction('typeof p5 !== "undefined"', { timeout: 10000 });
    await page.waitForSelector('canvas', { timeout: 10000 });
    await page.waitForFunction('window.p5Ready === true', { timeout: 30000 });
    const canvas = await page.$('canvas');
    if (!canvas) {
      throw new Error('Canvas element not found');
    }
    const boundingBox = await canvas.boundingBox();
    if (!boundingBox) {
      throw new Error('Failed to get canvas bounding box');
    }

    await canvas.screenshot({
      path: outputFile,
      type: 'png',
    });

    console.log(`Screenshot saved to: ${outputFile}`);
    console.log(
      `Canvas size: ${Math.round(boundingBox.width)}x${Math.round(boundingBox.height)}px`
    );
    console.log(`Frames rendered: ${frames}`);
  } finally {
    await browser.close();
  }
}

interface CliOptions {
  input: string;
  output: string;
  frames: string;
}

export function main(): void {
  const program = new Command();
  program
    .name('p5ss')
    .description('p5.js screenshot tool')
    .version(packageJson.version)
    .requiredOption('-i, --input <file>', 'Input p5.js sketch file')
    .option('-o, --output <file>', 'Output screenshot file', 'screenshot.png')
    .option('-f, --frames <number>', 'Number of frames to render before taking screenshot', '1')
    .action(async (options: CliOptions) => {
      const inputFile = path.resolve(options.input);
      const outputFile = path.resolve(options.output);
      const frames = parseInt(options.frames, 10);

      if (!fs.existsSync(inputFile)) {
        console.error(`Input file does not exist: ${inputFile}`);
        process.exit(1);
      }
      const outputDir = path.dirname(outputFile);
      if (outputDir && outputDir !== '.' && !fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      try {
        await takeScreenshot(inputFile, outputFile, frames);
      } catch (error) {
        console.error(`Error: ${(error as Error).message}`);
        process.exit(1);
      }
    })
    .showHelpAfterError()
    .parse();
}

main();
