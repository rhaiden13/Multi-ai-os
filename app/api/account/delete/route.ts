import {NextResponse} from 'next/server';
import {currentUser,endSession} from '../../../../lib/auth';
import {database} from '../../../../lib/db';
import {fail,serverError,jsonBody} from '../../../../lib/http';
export async function POST(req:Request){try{
 const user=await currentUser();if(!user)return fail('Sign in required',401);
 const body=await jsonBody(req);
 if(body.confirm!=='DELETE MY ACCOUNT')return fail('Account deletion confirmation required');
 await database().query('DELETE FROM users WHERE id=$1',[user.id]);
 // Cascading FKs remove sessions, conversations, messages, and usage.
 await endSession();
 return NextResponse.json({ok:true});
 }catch(err){return serverError(err);}}
