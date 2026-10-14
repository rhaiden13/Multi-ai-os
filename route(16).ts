import {randomUUID} from 'node:crypto';import {NextResponse} from 'next/server';
import {currentUser} from '../../../lib/auth';import {database} from '../../../lib/db';import {fail,serverError,jsonBody} from '../../../lib/http';import {models,type ModelId} from '../../../lib/models';import {reserveRequest} from '../../../lib/limits';import {generate} from '../../../lib/providers';
export async function POST(req:Request){try{const u=await currentUser();if(!u)return fail('Sign in required',401);const b=await jsonBody(req);const prompt=String(b.prompt||'').trim();const ids=(Array.isArray(b.models)?b.models:[]) as ModelId[];
 if(prompt.length<1||prompt.length>8000)return fail('Prompt must be 1–8000 characters');
 if(ids.length<2||ids.length>4||new Set(ids).size!==ids.length||ids.some(id=>!models.some(m=>m.id===id)))return fail('Select 2–4 distinct supported models');
 if(!await reserveRequest(u.id,ids.length))return fail('Daily AI request limit reached',429);
 const results=await Promise.all(ids.map(async id=>{try{const out=await generate(id,[{role:'user',content:prompt}]);await database().query('INSERT INTO usage_events(id,user_id,model,status,input_tokens,output_tokens) VALUES($1,$2,$3,$4,$5,$6)',[randomUUID(),u.id,id,'completed',out.inputTokens,out.outputTokens]);return {id,reply:out.text,model:out.model};}catch(e){console.error('Comparison provider error',id,e instanceof Error?e.message:'unknown');await database().query('INSERT INTO usage_events(id,user_id,model,status) VALUES($1,$2,$3,$4)',[randomUUID(),u.id,id,'failed']);return {id,error:'Model unavailable. Check provider configuration.'};}}));
 return NextResponse.json({results});
 }catch(e){return serverError(e);}}
