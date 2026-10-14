import {NextResponse} from 'next/server';
import {currentUser} from '../../../../lib/auth';import {database} from '../../../../lib/db';import {fail,serverError,jsonBody} from '../../../../lib/http';
type Params={params:Promise<{id:string}>};
export async function PATCH(req:Request,{params}:Params){try{const u=await currentUser();if(!u)return fail('Sign in required',401);
 const {id}=await params;if(!/^[0-9a-f-]{36}$/i.test(id))return fail('Invalid project ID');
 const b=await jsonBody(req);const name=String(b.name||'').trim(),description=String(b.description||'').trim();
 if(name.length<1||name.length>100||description.length>1000)return fail('Invalid project details');
 const r=await database().query('UPDATE projects SET name=$1,description=$2,updated_at=now() WHERE id=$3 AND user_id=$4 RETURNING id,name,description,updated_at',[name,description,id,u.id]);
 if(!r.rows.length)return fail('Project not found',404);return NextResponse.json({project:r.rows[0]});
 }catch(e){return serverError(e);}}
export async function DELETE(_req:Request,{params}:Params){try{const u=await currentUser();if(!u)return fail('Sign in required',401);
 const {id}=await params;if(!/^[0-9a-f-]{36}$/i.test(id))return fail('Invalid project ID');
 const r=await database().query('DELETE FROM projects WHERE id=$1 AND user_id=$2',[id,u.id]);
 if(!r.rowCount)return fail('Project not found',404);return NextResponse.json({ok:true});
 }catch(e){return serverError(e);}}
