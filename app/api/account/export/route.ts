import {NextResponse} from 'next/server';
import {currentUser} from '../../../../lib/auth';
import {database} from '../../../../lib/db';
import {fail,serverError} from '../../../../lib/http';
export async function GET(){try{
 const user=await currentUser();if(!user)return fail('Sign in required',401);
 const db=database();
 const conversations=await db.query(`SELECT c.id,c.title,c.model,c.created_at,c.updated_at,
 COALESCE(json_agg(json_build_object('role',m.role,'content',m.content,'model',m.model,'createdAt',m.created_at) ORDER BY m.created_at,m.id)
 FILTER(WHERE m.id IS NOT NULL),'[]') AS messages
 FROM conversations c LEFT JOIN messages m ON m.conversation_id=c.id WHERE c.user_id=$1
 GROUP BY c.id ORDER BY c.created_at`,[user.id]);
 const payload={exportedAt:new Date().toISOString(),user,conversations:conversations.rows};
 return new NextResponse(JSON.stringify(payload,null,2),{headers:{'Content-Type':'application/json; charset=utf-8','Content-Disposition':'attachment; filename="multi-ai-os-export.json"','Cache-Control':'no-store'}});
 }catch(err){return serverError(err);}}
