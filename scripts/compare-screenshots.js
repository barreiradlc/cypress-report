/**
 * compare-screenshots.js
 *
 * Compares runtime screenshots (cypress/screenshots/) against committed
 * baselines (cypress/baselines/images/) using pixelmatch.
 *
 * Exit codes:
 *   0 - no differences (or baselines missing, first run)
 *   1 - visual differences detected
 *
 * Environment variables:
 *   UPDATE_BASELINES=1   copy new screenshots over baselines (maintainer only)
 *   THRESHOLD            max allowed pixel mismatch ratio (default 0.00 = exact match)
 */

import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

const ROOT = process.cwd();
const SCREENSHOTS_DIR = path.join(ROOT, 'cypress', 'screenshots', 'visual.cy.js');
const BASELINES_DIR = path.join(ROOT, 'cypress', 'baselines', 'images');
const DIFFS_DIR = path.join(ROOT, 'cypress', 'reports', 'diffs');
const THRESHOLD = parseFloat(process.env.THRESHOLD || '0');
const UPDATE_BASELINES = process.env.UPDATE_BASELINES === '1';

function readPng(file) {
  return PNG.sync.read(fs.readFileSync(file));
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function listPngs(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.toLowerCase().endsWith('.png'))
    .sort();
}

async function main() {
  ensureDir(DIFFS_DIR);

  const newFiles = listPngs(SCREENSHOTS_DIR);
  if (newFiles.length === 0) {
    console.log('[compare-screenshots] No new screenshots found in', SCREENSHOTS_DIR);
    process.exit(0);
  }

  let hasDifferences = 0;
  const results = [];

  for (const file of newFiles) {
    const newPath = path.join(SCREENSHOTS_DIR, file);
    const baselinePath = path.join(BASELINES_DIR, file);
    const diffPath = path.join(DIFFS_DIR, file);

    // No baseline yet: first run or new screen. Save as baseline if approved,
    // otherwise just record it as new (no diff possible).
    if (!fs.existsSync(baselinePath)) {
      console.log(`[compare-screenshots] NEW (no baseline): ${file}`);
      if (UPDATE_BASELINES) {
        fs.copyFileSync(newPath, baselinePath);
        console.log(`[compare-screenshots]   -> promoted to baseline`);
      } else {
        results.push({ file, status: 'new', message: 'no baseline to compare' });
      }
      continue;
    }

    const img1 = readPng(newPath);
    const img2 = readPng(baselinePath);

    if (
      img1.width !== img2.width ||
      img1.height !== img2.height
    ) {
      console.log(
        `[compare-screenshots] SIZE MISMATCH: ${file} ` +
          `(${img1.width}x${img1.height} vs ${img2.width}x${img2.height})`
      );
      // Write a side-by-side diff placeholder so reviewers can see the mismatch.
      fs.copyFileSync(newPath, diffPath);
      hasDifferences = 1;
      results.push({ file, status: 'size-mismatch', diffPath });
      continue;
    }

    const diff = new PNG({ width: img1.width, height: img1.height });
    const mismatchedPixels = pixelmatch(
      img1.data,
      img2.data,
      diff.data,
      img1.width,
      img1.height,
      { threshold: THRESHOLD }
    );
    const ratio = mismatchedPixels / (img1.width * img1.height);

    if (ratio > THRESHOLD) {
      console.log(
        `[compare-screenshots] DIFF: ${file} ` +
          `${(ratio * 100).toFixed(2)}% pixels changed (${mismatchedPixels} px)`
      );
      PNG.sync.write(diff, fs.createWriteStream(diffPath));
      hasDifferences = 1;
      results.push({ file, status: 'diff', ratio, mismatchedPixels, diffPath });
    } else {
      console.log(
        `[compare-screenshots] OK: ${file} ` +
          `${(ratio * 100).toFixed(4)}% pixels changed`
      );
      results.push({ file, status: 'ok', ratio });
    }
  }

  // Summary report
  const summaryPath = path.join(DIFFS_DIR, 'comparison-report.json');
  fs.writeFileSync(
    summaryPath,
    JSON.stringify(
      {
        comparedAt: new Date().toISOString(),
        threshold: THRESHOLD,
        total: newFiles.length,
        differences: hasDifferences,
        results,
      },
      null,
      2
    )
  );

  if (UPDATE_BASELINES) {
    console.log('\n[compare-screenshots] Baselines updated. Commit the changes in cypress/baselines/images/');
  }

  if (hasDifferences && !UPDATE_BASELINES) {
    console.log(
      `\n[compare-screenshots] ${hasDifferences} visual difference(s) detected. ` +
        'Review diffs in cypress/reports/diffs/ and approve via PR.'
    );
    process.exit(1);
  }

  console.log('\n[compare-screenshots] All screenshots match baselines.');
  process.exit(0);
}

main().catch((err) => {
  console.error('[compare-screenshots] Fatal error:', err);
  process.exit(2);
});
