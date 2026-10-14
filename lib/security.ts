import {NextResponse} from 'next/server';
// Require same-origin browser writes; host comparisons respect reverse proxies only via configured APP_URL.
export function verifyWriteOrigin(request:Request):NextResponse|null {
 const origin=request.headers.get('origin');
 if(!origin)return NextResponse.json({error:'Origin header required'},{status:403});
 let expected:string;
 try {expected=new URL(process.env.APP_URL||request.url).origin;} catch {return NextResponse.json({error:'Server origin not configured'},{status:503});}
 if(origin!==expected)return NextResponse.json({error:'Cross-origin request blocked'},{status:403});
 return null;
}
export function securityHeaders(){return {
 'X-Content-Type-Options':'nosniff',
 'Referrer-Policy':'strict-origin-when-cross-origin',
 'X-Frame-Options':'DENY',
 'Permissions-Policy':'camera=(), microphone=(), geolocation=()',
 'Cross-Origin-Resource-Policy':'same-origin',
 'Cache-Control':'no-store'
};}
