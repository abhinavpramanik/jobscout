import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export const runtime = 'nodejs';

/**
 * POST /api/user/jobs/save
 * Save a job to user's saved jobs
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { jobId } = await request.json();

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
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if already saved
    if (user.savedJobs.includes(jobId)) {
      return NextResponse.json(
        { message: 'Job already saved', saved: true },
        { status: 200 }
      );
    }

    // Add to saved jobs
    user.savedJobs.push(jobId);
    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Job saved successfully',
      saved: true,
    });
  } catch (error) {
    console.error('Error saving job:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/user/jobs/save
 * Remove a job from user's saved jobs
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { jobId } = await request.json();

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
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Remove from saved jobs
    user.savedJobs = user.savedJobs.filter(
      (id: any) => id.toString() !== jobId
    );
    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Job removed from saved',
      saved: false,
    });
  } catch (error) {
    console.error('Error removing saved job:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
