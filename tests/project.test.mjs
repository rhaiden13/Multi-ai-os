import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync,existsSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('all required API routes exist',()=>{for(const p of ['auth/register','auth/login','auth/logout','auth/me','chat','compare','conversations','models','usage','health','admin/stats'])assert.ok(existsSync(new URL('../app/api/'+p+'/route.ts',import.meta.url)),p);});
test('API keys only accessed in server providers adapter',()=>{const page=read('app/page.tsx');for(const key of ['OPENAI_API_KEY','ANTHROPIC_API_KEY','DEEPSEEK_API_KEY','GEMINI_API_KEY'])assert.ok(!page.includes(key),key);});
test('chat API has authorization and quota checks',()=>{const s=read('app/api/chat/route.ts');assert.match(s,/currentUser\(\)/);assert.match(s,/reserveRequest\(user.id\)/);assert.match(s,/user_id=\$2/);});
test('secrets are ignored from commits',()=>assert.match(read('.gitignore'),/\.env\.local/));
test('public UI labels unfinished tools as roadmap',()=>assert.match(read('app/page.tsx'),/ROADMAP/));
