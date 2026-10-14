import {currentUser,verifyPassword,hashPassword,endSession} from '../../../../lib/auth';
import {database,transaction} from '../../../../lib/db';
import {fail,serverError,jsonBody} from '../../../../lib/http';
import {NextResponse} from 'next/server';
export async function POST(req:Request){try{
 const user=await currentUser();if(!user)return fail('Sign in required',401);
 const b=await jsonBody(req);const oldPassword=String(b.currentPassword||''),newPassword=String(b.newPassword||'');
 if(newPassword.length<12||newPassword.length>128)return fail('New password must be 12–128 characters');
 if(oldPassword===newPassword)return fail('Choose a different password');
 const result=await database().query('SELECT password_hash FROM users WHERE id=$1',[user.id]);
 if(!result.rows.length||!(await verifyPassword(oldPassword,result.rows[0].password_hash)))return fail('Current password is incorrect',403);
 const hashed=await hashPassword(newPassword);
 await transaction(async c=>{await c.query('UPDATE users SET password_hash=$1 WHERE id=$2',[hashed,user.id]);await c.query('DELETE FROM sessions WHERE user_id=$1',[user.id]);});
 const {cookies}=await import('next/headers');(await cookies()).delete('multi_ai_session');
 return NextResponse.json({ok:true,message:'Password changed. Sign in again.'});
 }catch(e){return serverError(e);}}
