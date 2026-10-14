import {randomBytes,createHash,scrypt as scryptCallback,timingSafeEqual} from 'node:crypto';
import {promisify} from 'node:util';
import {cookies} from 'next/headers';
import {database} from './db';
const scrypt=promisify(scryptCallback);
export const COOKIE='multi_ai_session';
export async function hashPassword(password:string){const salt=randomBytes(16).toString('hex');const derived=await scrypt(password,salt,64) as Buffer;return `scrypt:${salt}:${derived.toString('hex')}`;}
export async function verifyPassword(password:string,stored:string){const [kind,salt,hex]=stored.split(':');if(kind!=='scrypt'||!salt||!hex)return false;const expected=Buffer.from(hex,'hex');if(expected.length!==64)return false;const actual=await scrypt(password,salt,64) as Buffer;return timingSafeEqual(expected,actual);}
export function tokenHash(token:string){return createHash('sha256').update(token).digest('hex');}
export type User={id:string;email:string;name:string;role:'user'|'admin'};
export async function currentUser():Promise<User|null>{
 const cookieStore=await cookies();const token=cookieStore.get(COOKIE)?.value;if(!token||!/^[0-9a-f]{64}$/.test(token))return null;
 const result=await database().query('SELECT u.id,u.email,u.name,u.role FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=$1 AND s.expires_at>now()',[tokenHash(token)]);
 return result.rows[0]||null;
}
export async function createSession(userId:string){const token=randomBytes(32).toString('hex');await database().query("INSERT INTO sessions(token_hash,user_id,expires_at) VALUES($1,$2,now()+interval '14 days')",[tokenHash(token),userId]);(await cookies()).set(COOKIE,token,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:14*86400});}
export async function endSession(){const jar=await cookies();const token=jar.get(COOKIE)?.value;if(token)await database().query('DELETE FROM sessions WHERE token_hash=$1',[tokenHash(token)]);jar.delete(COOKIE);}
