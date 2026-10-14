import {randomUUID} from 'node:crypto';
import {NextResponse} from 'next/server';
import {currentUser} from '../../../lib/auth';import {database} from '../../../lib/db';import {fail,serverError,jsonBody} from '../../../lib/http';
export async function GET(){try{const u=await currentUser();if(!u)return fail('Sign in required',401);
 const r=await database().query('SELECT id,name,description,created_at,updated_at FROM projects WHERE user_id=$1 ORDER BY updated_at DESC LIMIT 100',[u.id]);return NextResponse.json({projects:r.rows});
 }catch(e){return serverError(e);}}
export async function POST(req:Request){try{const u=await currentUser();if(!u)return fail('Sign in required',401);
 const b=await jsonBody(req);const name=String(b.name||'').trim(),description=String(b.description||'').trim();
 if(name.length<1||name.length>100||description.length>1000)return fail('Name must be 1–100 characters; description at most 1000');
 const result=await database().query('INSERT INTO projects(id,user_id,name,description) VALUES($1,$2,$3,$4) RETURNING id,name,description,created_at,updated_at',[randomUUID(),u.id,name,description]);
 return NextResponse.json({project:result.rows[0]},{status:201});
 }catch(e){return serverError(e);}}
