import {currentUser} from '../../../lib/auth';
import {database} from '../../../lib/db';
import {fail,serverError} from '../../../lib/http';
import {NextResponse} from 'next/server';
export async function GET(){try{const user=await currentUser();if(!user)return fail('Sign in required',401);
 const q=await database().query(`SELECT c.id,c.title,c.model,c.updated_at,COALESCE(json_agg(json_build_object('role',m.role,'text',m.content) ORDER BY m.created_at,m.id) FILTER (WHERE m.id IS NOT NULL),'[]') AS messages FROM conversations c LEFT JOIN messages m ON m.conversation_id=c.id WHERE c.user_id=$1 GROUP BY c.id ORDER BY c.updated_at DESC LIMIT 100`,[user.id]);return NextResponse.json({conversations:q.rows});
 }catch(e){return serverError(e);}}
export async function DELETE(req:Request){try{const user=await currentUser();if(!user)return fail('Sign in required',401);const id=new URL(req.url).searchParams.get('id');if(!id||!/^[0-9a-f-]{36}$/i.test(id))return fail('Invalid conversation ID');await database().query('DELETE FROM conversations WHERE id=$1 AND user_id=$2',[id,user.id]);return NextResponse.json({ok:true});}catch(e){return serverError(e);}}
