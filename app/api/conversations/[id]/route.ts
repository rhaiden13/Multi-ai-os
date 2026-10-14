import {NextResponse} from 'next/server';
import {currentUser} from '../../../../lib/auth';
import {database} from '../../../../lib/db';
import {fail,serverError,jsonBody} from '../../../../lib/http';
export async function PATCH(req:Request,context:{params:Promise<{id:string}>}){
 try {const user=await currentUser();if(!user)return fail('Sign in required',401);
 const {id}=await context.params;
 if(!/^[0-9a-f-]{36}$/i.test(id))return fail('Invalid conversation ID');
 const body=await jsonBody(req);
 if(typeof body.title!=='string'||body.title.trim().length<1||body.title.trim().length>100)return fail('Title must be 1–100 characters');
 const result=await database().query('UPDATE conversations SET title=$1,updated_at=now() WHERE id=$2 AND user_id=$3 RETURNING id,title',[body.title.trim(),id,user.id]);
 if(!result.rowCount)return fail('Conversation not found',404);
 return NextResponse.json({conversation:result.rows[0]});
 }catch(err){return serverError(err);}
}
