import {Pool, type PoolClient} from 'pg';
const g=globalThis as unknown as {__multiAiPool?:Pool};
export function database(){
 if(!process.env.DATABASE_URL) throw new Error('DATABASE_URL not configured');
 if(!g.__multiAiPool) g.__multiAiPool=new Pool({connectionString:process.env.DATABASE_URL,max:8,ssl:process.env.DATABASE_SSL==='true'?{rejectUnauthorized:true}:undefined});
 return g.__multiAiPool;
}
export async function transaction<T>(fn:(client:PoolClient)=>Promise<T>):Promise<T>{
 const client=await database().connect();try{await client.query('BEGIN');const value=await fn(client);await client.query('COMMIT');return value;}catch(e){await client.query('ROLLBACK');throw e;}finally{client.release();}
}
