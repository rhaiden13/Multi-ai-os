import {checkAuthRateLimit} from '../../../../lib/rate-limit';
import {randomUUID} from 'node:crypto';
import {database} from '../../../../lib/db';
import {createSession,hashPassword} from '../../../../lib/auth';
import {fail,serverError,jsonBody} from '../../../../lib/http';
import {NextResponse} from 'next/server';
export async function POST(req:Request){try{
 const body=await jsonBody(req);const email=String(body.email||'').trim().toLowerCase(),name=String(body.name||'').trim(),password=String(body.password||'');
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254)return fail('Enter a valid email address');
 if(name.length<2||name.length>60)return fail('Name must be 2–60 characters');
 if(password.length<12||password.length>128)return fail('Password must be 12–128 characters');
 if(!await checkAuthRateLimit(req,email,'register'))return fail('Too many attempts. Try again later.',429);
 const id=randomUUID(),hash=await hashPassword(password);
 await database().query('INSERT INTO users(id,email,name,password_hash) VALUES($1,$2,$3,$4)',[id,email,name,hash]);await createSession(id);
 return NextResponse.json({user:{id,email,name,role:'user'}},{status:201});
 }catch(e){if((e as {code?:string}).code==='23505')return fail('An account with this email already exists',409);return serverError(e);}}
