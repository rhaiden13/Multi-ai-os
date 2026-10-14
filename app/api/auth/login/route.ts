import {checkAuthRateLimit} from '../../../../lib/rate-limit';
import {database} from '../../../../lib/db';
import {createSession,verifyPassword} from '../../../../lib/auth';
import {fail,serverError,jsonBody} from '../../../../lib/http';
import {NextResponse} from 'next/server';
export async function POST(req:Request){try{
 const body=await jsonBody(req);const email=String(body.email||'').trim().toLowerCase(),password=String(body.password||'');
 if(!email||!password)return fail('Email and password are required');
 if(!await checkAuthRateLimit(req,email,'login'))return fail('Too many attempts. Try again later.',429);
 const q=await database().query('SELECT id,email,name,role,password_hash FROM users WHERE email=$1',[email]);
 if(!q.rows.length||!(await verifyPassword(password,q.rows[0].password_hash)))return fail('Invalid email or password',401);
 const {id,name,role}=q.rows[0];await createSession(id);return NextResponse.json({user:{id,email,name,role}});
 }catch(e){return serverError(e);}}
