import {currentUser,tokenHash,COOKIE} from '../../../../lib/auth';
import {database} from '../../../../lib/db';
import {cookies} from 'next/headers';
import {NextResponse} from 'next/server';
import {fail,serverError} from '../../../../lib/http';
export async function GET(){try{const user=await currentUser();if(!user)return fail('Sign in required',401);
 const sessionToken=(await cookies()).get(COOKIE)?.value;
 const result=await database().query('SELECT created_at,expires_at,token_hash FROM sessions WHERE user_id=$1 AND expires_at>now() ORDER BY created_at DESC',[user.id]);
 return NextResponse.json({sessions:result.rows.map((s:{created_at:string;expires_at:string;token_hash:string})=>({createdAt:s.created_at,expiresAt:s.expires_at,current:sessionToken?tokenHash(sessionToken)===s.token_hash:false}))});
 }catch(e){return serverError(e);}}
export async function DELETE(){try{const user=await currentUser();if(!user)return fail('Sign in required',401);
 const token=(await cookies()).get(COOKIE)?.value;if(!token)return fail('Session missing',401);
 const result=await database().query('DELETE FROM sessions WHERE user_id=$1 AND token_hash<>$2',[user.id,tokenHash(token)]);
 return NextResponse.json({ok:true,revoked:result.rowCount});
 }catch(e){return serverError(e);}}
