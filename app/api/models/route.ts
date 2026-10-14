import {enabledModels} from '../../../lib/models';
import {NextResponse} from 'next/server';
export async function GET(){return NextResponse.json({models:enabledModels().map(({env,...m})=>m)},{headers:{'Cache-Control':'no-store'}});}
