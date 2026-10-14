import {NextResponse,type NextRequest} from 'next/server';
import {securityHeaders,verifyWriteOrigin} from './lib/security';
export function middleware(request:NextRequest){
 if(request.nextUrl.pathname.startsWith('/api/') && !['GET','HEAD','OPTIONS'].includes(request.method)){
  const blocked=verifyWriteOrigin(request);
  if(blocked)return blocked;
 }
 const response=NextResponse.next();
 for(const [key,value] of Object.entries(securityHeaders()))response.headers.set(key,value);
 return response;
}
export const config={matcher:['/((?!_next/static|_next/image|favicon.ico).*)']};
