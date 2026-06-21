#!/usr/bin/env node
/*
 * Node-safe unit-test runner.
 *
 * The `mocha` CLI fails under newer Node (>=22ish): its bundled yargs shim does
 * `require('./build/index.cjs')` from a file Node now resolves as ESM, throwing
 * "require is not defined in ES module scope" before any test loads. This runner
 * uses Mocha's programmatic API instead, which never touches yargs.
 *
 * It runs ONLY the offline unit specs under test/unit. Integration specs (which
 * hit the live API and need TEST_KEY / TEST_APP_ID) live under test/integration
 * and are run via `npm test`.
 *
 * Usage: node test/run-unit.js   (or: npm run test:unit)
 */
require('ts-node/register');
const fs = require('fs');
const path = require('path');
const Mocha = require('mocha');

const UNIT_DIR = path.resolve(__dirname, 'unit');

function findSpecs(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...findSpecs(full));
    } else if (entry.name.endsWith('.spec.ts')) {
      out.push(full);
    }
  }
  return out;
}

const mocha = new Mocha({ timeout: 10000 });
findSpecs(UNIT_DIR).sort().forEach((f) => mocha.addFile(f));
mocha.run((failures) => {
  process.exitCode = failures ? 1 : 0;
});
