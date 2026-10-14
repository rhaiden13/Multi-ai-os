
import { NextResponse } from 'next/server';
import { database } from '../../../lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const result = await database().query(
      "SELECT to_regclass('public.users') AS users_table, to_regclass('public.sessions') AS sessions_table, to_regclass('public.projects') AS projects_table"
    );

    const data = result.rows[0];

    if (
      !data?.users_table ||
      !data?.sessions_table ||
      !data?.projects_table
    ) {
      throw new Error('Missing database tables');
    }

    return NextResponse.json(
      { status: 'ok', database: 'ready' },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch {
    return NextResponse.json(
      { status: 'unavailable' },
      {
        status: 503,
        headers: { 'Cache-Control': 'no-store' }
      }
    );
  }
}
