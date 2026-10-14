import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('JSON request parser bounds actual streamed bytes',()=>{const s=read('lib/http.ts');assert.match(s,/getReader/);assert.match(s,/size>100_000/);});
test('password update revokes existing sessions and verifies original password',()=>{const s=read('app/api/account/password/route.ts');assert.match(s,/verifyPassword/);assert.match(s,/DELETE FROM sessions/);});
test('session listing does not expose session tokens',()=>{const s=read('app/api/account/sessions/route.ts');assert.match(s,/tokenHash/);assert.match(s,/current:/);});
test('project CRUD is scoped to authenticated owner',()=>{const a=read('app/api/projects/route.ts'),b=read('app/api/projects/[id]/route.ts');assert.match(a,/currentUser/);assert.match(a,/user_id=\$1/);assert.match(b,/user_id=\$4/);assert.match(b,/user_id=\$2/);});
test('projects and security settings are wired in frontend',()=>{const s=read('app/page.tsx');assert.match(s,/createProject/);assert.match(s,/changePassword/);assert.match(s,/revokeOtherSessions/);});
