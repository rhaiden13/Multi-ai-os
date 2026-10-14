import {endSession} from '../../../../lib/auth';
import {serverError} from '../../../../lib/http';
import {NextResponse} from 'next/server';
export async function POST(){try{await endSession();return NextResponse.json({ok:true});}catch(e){return serverError(e);}}
