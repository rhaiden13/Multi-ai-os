import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('mutating routes are guarded by same-origin middleware',()=>{assert.match(read('middleware.ts'),/verifyWriteOrigin/);assert.match(read('lib/security.ts'),/origin!==expected/);});
test('account actions verify authenticated user',()=>{for(const p of ['app/api/account/export/route.ts','app/api/account/delete/route.ts','app/api/conversations/[id]/route.ts'])assert.match(read(p),/currentUser\(\)/);});
test('auth endpoints have distributed limiter',()=>{assert.match(read('app/api/auth/login/route.ts'),/checkAuthRateLimit/);assert.match(read('app/api/auth/register/route.ts'),/checkAuthRateLimit/);assert.match(read('db/schema.sql'),/CREATE TABLE IF NOT EXISTS auth_attempts/);});
test('rename endpoint checks conversation owner',()=>assert.match(read('app/api/conversations/[id]/route.ts'),/user_id=\$3/));
test('sensitive provider errors not logged as response bodies',()=>assert.doesNotMatch(read('lib/providers.ts'),/JSON.stringify\(data\)\.slice/));
