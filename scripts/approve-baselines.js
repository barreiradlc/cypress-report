/**
 * approve-baselines.js
 *
 * Promotes the latest runtime screenshots (cypress/screenshots/visual.cy.js/)
 * to committed baselines (cypress/baselines/images/).
 *
 * Intended for maintainers to run locally after reviewing a visual-regression
 * PR and deciding the new layout is intentional.
 *
 * Usage:
 *   npm run visual:approve
 */

import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const SCREENSHOTS_DIR = path.join(ROOT, 'cypress', 'screenshots', 'visual.cy.js');
const BASELINES_DIR = path.join(ROOT, 'cypress', 'baselines', 'images');

function main() {
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    console.error(`[approve-baselines] Screenshot dir not found: ${SCREENSHOTS_DIR}`);
    console.error('Run `npm run visual:run` first to generate screenshots.');
    process.exit(1);
  }

  const files = fs
    .readdirSync(SCREENSHOTS_DIR)
    .filter((f) => f.toLowerCase().endsWith('.png'))
    .sort();

  if (files.length === 0) {
    console.error('[approve-baselines] No screenshots to approve.');
    process.exit(1);
  }

  fs.mkdirSync(BASELINES_DIR, { recursive: true });

  let copied = 0;
  for (const file of files) {
    fs.copyFileSync(path.join(SCREENSHOTS_DIR, file), path.join(BASELINES_DIR, file));
    console.log(`[approve-baselines] approved: ${file}`);
    copied++;
  }

  console.log(`\n[approve-baselines] ${copied} baseline(s) updated in cypress/baselines/images/`);
  console.log('Commit and open a PR for review before merging to main.');
}

main();
