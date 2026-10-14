import {NextResponse} from 'next/server';
export function fail(message:string,status=400){return NextResponse.json({error:message},{status,headers:{'Cache-Control':'no-store'}});}
export function serverError(error:unknown){console.error('Server request failed',error instanceof Error?error.message:'unknown');return fail('Service unavailable. Please try again.',503);}
export async function jsonBody(req:Request):Promise<Record<string,unknown>>{
 const contentType=req.headers.get('content-type')||'';
 if(!contentType.toLowerCase().startsWith('application/json'))throw new Error('Expected application/json');
 const length=Number(req.headers.get('content-length')||0);
 if(length>100_000)return Promise.reject(new Error('Payload too large'));
 const reader=req.body?.getReader();if(!reader)return {};
 const chunks:Uint8Array[]=[];let size=0;
 try {while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>100_000)throw new Error('Payload too large');chunks.push(value);}}
 finally{reader.releaseLock();}
 const joined=new Uint8Array(size);let at=0;for(const c of chunks){joined.set(c,at);at+=c.length;}
 const parsed=JSON.parse(new TextDecoder().decode(joined));
 if(!parsed||Array.isArray(parsed)||typeof parsed!=='object')throw new Error('Expected JSON object');
 return parsed as Record<string,unknown>;
}
