import {readFileSync} from 'node:fs';import pg from 'pg';
if(!process.env.DATABASE_URL){console.error('Set DATABASE_URL before running db:init');process.exit(1)}
const client=new pg.Client({connectionString:process.env.DATABASE_URL,ssl:process.env.DATABASE_SSL==='true'?{rejectUnauthorized:true}:undefined});
try{await client.connect();await client.query(readFileSync(new URL('../db/schema.sql',import.meta.url),'utf8'));console.log('Database schema initialized successfully.')}catch(e){console.error('Database initialization failed:',e.message);process.exitCode=1;}finally{await client.end()}
