import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

describe('p5ss CLI', () => {
  const fixturesDir = path.join(__dirname, 'fixtures');
  const outputDir = path.join(__dirname, 'output');
  const inputFile = path.join(fixturesDir, 'simple-sketch.js');
  const outputFile = path.join(outputDir, 'test-screenshot.png');
  const cliPath = path.join(__dirname, '..', 'bin', 'p5ss.js');

  beforeEach(() => {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
  });

  afterEach(() => {
    if (fs.existsSync(outputFile)) {
      fs.unlinkSync(outputFile);
    }
  });

  it('should create a screenshot file from a simple p5.js sketch', async () => {
    await execAsync(`node ${cliPath} -i ${inputFile} -o ${outputFile}`);

    expect(fs.existsSync(outputFile)).toBe(true);

    const stats = fs.statSync(outputFile);
    expect(stats.size).toBeGreaterThan(0);
  });

  it('should create a screenshot with custom frame count', async () => {
    await execAsync(`node ${cliPath} -i ${inputFile} -o ${outputFile} -f 5`);

    expect(fs.existsSync(outputFile)).toBe(true);

    const stats = fs.statSync(outputFile);
    expect(stats.size).toBeGreaterThan(0);
  });

  it('should fail when input file does not exist', async () => {
    const nonExistentFile = path.join(fixturesDir, 'non-existent.js');

    await expect(
      execAsync(`node ${cliPath} -i ${nonExistentFile} -o ${outputFile}`)
    ).rejects.toThrow();
  });
});
