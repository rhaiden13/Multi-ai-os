import {currentUser} from '../../../../lib/auth';
import {serverError} from '../../../../lib/http';
import {NextResponse} from 'next/server';
export async function GET(){try{return NextResponse.json({user:await currentUser()});}catch(e){return serverError(e);}}
