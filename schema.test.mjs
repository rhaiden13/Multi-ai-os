import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
const schema=readFileSync(new URL('../db/schema.sql',import.meta.url),'utf8');
test('database has essential owned application records',()=>{for(const n of ['users','sessions','conversations','messages','usage_events','request_reservations'])assert.match(schema,new RegExp(`CREATE TABLE IF NOT EXISTS ${n}`));assert.match(schema,/user_id uuid NOT NULL REFERENCES users\(id\)/);});
test('session token stored as hash',()=>assert.match(schema,/token_hash text PRIMARY KEY/));
