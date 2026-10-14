import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const pkg=JSON.parse(readFileSync('package.json','utf8'));
const railway=JSON.parse(readFileSync('railway.json','utf8'));
test('Railway boot initializes schema before serving',()=>{assert.match(pkg.scripts['start:railway'],/init-db/);assert.equal(railway.deploy.startCommand,'npm run start:railway');});
test('Health endpoint checks database tables and returns 503 on failure',()=>{const src=readFileSync('app/api/health/route.ts','utf8');assert.match(src,/to_regclass/);assert.match(src,/status:503/);});
test('CI workflow runs tests, types and build',()=>{const src=readFileSync('.github/workflows/ci.yml','utf8');assert.match(src,/npm test/);assert.match(src,/npm run lint/);assert.match(src,/npm run build/);});
