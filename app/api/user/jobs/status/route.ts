import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export const runtime = 'nodejs';

/**
 * GET /api/user/jobs/status?jobId=xxx
 * Get save/apply status for a specific job
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { saved: false, applied: false },
        { status: 200 }
      );
    }

    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json(
        { saved: false, applied: false },
        { status: 200 }
      );
    }

    const saved = user.savedJobs.some((id: any) => id.toString() === jobId);
    const applied = user.appliedJobs.some((id: any) => id.toString() === jobId);

    return NextResponse.json({
      saved,
      applied,
    });
  } catch (error) {
    console.error('Error getting job status:', error);
    return NextResponse.json(
      { saved: false, applied: false },
      { status: 200 }
    );
  }
}
