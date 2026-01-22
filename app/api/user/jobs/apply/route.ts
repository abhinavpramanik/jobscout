import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import mongoose from 'mongoose';

export const runtime = 'nodejs';

/**
 * POST /api/user/jobs/apply
 * Mark a job as applied
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

    // Check if already applied
    if (user.appliedJobs.includes(jobId)) {
      return NextResponse.json(
        { message: 'Job already marked as applied', applied: true },
        { status: 200 }
      );
    }

    // Add to applied jobs
    user.appliedJobs.push(jobId);
    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Job marked as applied',
      applied: true,
    });
  } catch (error) {
    console.error('Error marking job as applied:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/user/jobs/apply
 * Remove a job from applied jobs
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

    // Remove from applied jobs
    user.appliedJobs = user.appliedJobs.filter((id: mongoose.Types.ObjectId) => id.toString() !== jobId);
    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Job removed from applied jobs',
      applied: false,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
