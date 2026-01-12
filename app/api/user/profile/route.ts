import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export const runtime = 'nodejs';

/**
 * POST /api/user/profile
 * Update user profile (name, image URL, resume URL)
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

    const body = await request.json();
    const { name, profilePicUrl, resumeUrl } = body;

    await dbConnect();

    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Update fields if provided
    if (name) user.name = name;
    if (profilePicUrl !== undefined) user.profilePicUrl = profilePicUrl;
    if (resumeUrl !== undefined) user.resumeUrl = resumeUrl;

    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        name: user.name,
        email: user.email,
        profilePicUrl: user.profilePicUrl,
        resumeUrl: user.resumeUrl,
      },
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/user/profile
 * Get user profile information
 */
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

    const user = await User.findOne({ email: session.user.email }).select('-password');

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        name: user.name,
        email: user.email,
        profilePicUrl: user.profilePicUrl,
        resumeUrl: user.resumeUrl,
        skills: user.skills || [],
        savedJobsCount: user.savedJobs?.length || 0,
        appliedJobsCount: user.appliedJobs?.length || 0,
      },
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
