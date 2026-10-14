import {randomUUID} from 'node:crypto';
import {currentUser} from '../../../lib/auth';import {database,transaction} from '../../../lib/db';
import {fail,serverError,jsonBody} from '../../../lib/http';import {models,type ModelId} from '../../../lib/models';import {generate} from '../../../lib/providers';import {reserveRequest} from '../../../lib/limits';
import {NextResponse} from 'next/server';
export async function POST(req:Request){try{
 const user=await currentUser();if(!user)return fail('Sign in required',401);
 const b=await jsonBody(req),model=String(b.model||'') as ModelId,text=String(b.text||'').trim();
 if(!models.some(m=>m.id===model))return fail('Unsupported model');
 if(text.length<1||text.length>8000)return fail('Prompt must be 1–8000 characters');
 const id=b.conversationId?String(b.conversationId):randomUUID();
 let prior:{role:'user'|'assistant';content:string}[]=[];
 if(b.conversationId){const q=await database().query('SELECT id FROM conversations WHERE id=$1 AND user_id=$2',[id,user.id]);if(!q.rows.length)return fail('Conversation not found',404);
 const history=await database().query('SELECT role,content FROM messages WHERE conversation_id=$1 ORDER BY created_at,id DESC LIMIT 20',[id]);prior=history.rows.reverse().slice(-12).map(m=>({...m,content:String(m.content).slice(-3000)}));}
 if(!await reserveRequest(user.id))return fail('Daily AI request limit reached',429);
 const input=[...prior,{role:'user' as const,content:text}];let output;
 try{output=await generate(model,input);}catch(e){console.error('AI provider error',e instanceof Error?e.message:'unknown');await database().query('INSERT INTO usage_events(id,user_id,model,status) VALUES($1,$2,$3,$4)',[randomUUID(),user.id,model,'failed']);return fail('The selected AI provider is unavailable or not configured. Check API credentials and model settings.',502);}
 if(!output.text){await database().query('INSERT INTO usage_events(id,user_id,model,status) VALUES($1,$2,$3,$4)',[randomUUID(),user.id,model,'empty']);return fail('The model returned no text',502);}
 await transaction(async c=>{
  if(!b.conversationId)await c.query('INSERT INTO conversations(id,user_id,title,model) VALUES($1,$2,$3,$4)',[id,user.id,text.slice(0,80),model]);
  await c.query('INSERT INTO messages(id,conversation_id,role,content,model) VALUES($1,$2,$3,$4,$5)',[randomUUID(),id,'user',text,model]);
  await c.query('INSERT INTO messages(id,conversation_id,role,content,model) VALUES($1,$2,$3,$4,$5)',[randomUUID(),id,'assistant',output.text,model]);
  await c.query('UPDATE conversations SET updated_at=now() WHERE id=$1',[id]);
  await c.query('INSERT INTO usage_events(id,user_id,model,status,input_tokens,output_tokens) VALUES($1,$2,$3,$4,$5,$6)',[randomUUID(),user.id,model,'completed',output.inputTokens,output.outputTokens]);
 });
 return NextResponse.json({conversationId:id,reply:output.text,model:output.model,usage:{inputTokens:output.inputTokens,outputTokens:output.outputTokens}});
 }catch(e){return serverError(e);}}
