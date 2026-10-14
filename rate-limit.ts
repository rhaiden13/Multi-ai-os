import {createHash} from 'node:crypto';
import {database} from './db';
// Shared PostgreSQL counter: works across horizontally scaled instances.
export async function checkAuthRateLimit(req:Request,identifier:string,kind:'login'|'register'){
 const source=(req.headers.get('x-forwarded-for')||'unknown').split(',')[0].trim();
 const key=createHash('sha256').update(`${kind}:${source}:${identifier.slice(0,254).toLowerCase()}`).digest('hex');
 const max=kind==='login'?8:4;
 const query=await database().query(`INSERT INTO auth_attempts(key,window_start,count) VALUES($1,now(),1)
 ON CONFLICT(key) DO UPDATE SET
 count=CASE WHEN auth_attempts.window_start < now()-interval '15 minutes' THEN 1 ELSE auth_attempts.count+1 END,
 window_start=CASE WHEN auth_attempts.window_start < now()-interval '15 minutes' THEN now() ELSE auth_attempts.window_start END
 RETURNING count`,[key]);
 return Number(query.rows[0].count)<=max;
}
