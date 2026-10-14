import {randomUUID} from 'node:crypto';
import {transaction} from './db';
export async function reserveRequest(userId:string,quantity=1){
 const max=Math.max(1,Number(process.env.DAILY_REQUEST_LIMIT||30));
 return transaction(async client=>{
  await client.query('SELECT id FROM users WHERE id=$1 FOR UPDATE',[userId]);
  const q=await client.query("SELECT count(*)::int AS n FROM request_reservations WHERE user_id=$1 AND created_at>=date_trunc('day',now())",[userId]);
  if(q.rows[0].n+quantity>max)return false;
  for(let i=0;i<quantity;i++)await client.query('INSERT INTO request_reservations(id,user_id) VALUES($1,$2)',[randomUUID(),userId]);
  return true;
 });
}
