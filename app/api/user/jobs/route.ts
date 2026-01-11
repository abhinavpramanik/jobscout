import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Job from '@/models/Job';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
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

    // Fetch saved jobs
    const savedJobs = await Job.find({
      _id: { $in: user.savedJobs },
    }).lean();

    // Fetch applied jobs
    const appliedJobs = await Job.find({
      _id: { $in: user.appliedJobs },
    }).lean();

    return NextResponse.json({
      savedJobs,
      appliedJobs,
    });
  } catch (error) {
    console.error('Error fetching user jobs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
