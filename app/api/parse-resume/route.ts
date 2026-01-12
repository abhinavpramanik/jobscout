import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { parseResumeFromUrl } from '@/lib/resumeParser';

export const runtime = 'nodejs';

/**
 * POST /api/parse-resume
 * Parse an existing resume URL and extract skills
 */
export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { resumeUrl } = body;

    if (!resumeUrl) {
      return NextResponse.json(
        { error: 'Resume URL is required.' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find user
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found.' },
        { status: 404 }
      );
    }

    // Parse resume from URL
    const parsedResume = await parseResumeFromUrl(resumeUrl);
    
    // Update user skills
    user.skills = parsedResume.skills;
    await user.save();

    return NextResponse.json(
      {
        message: 'Resume parsed successfully.',
        skills: parsedResume.skills,
        skillsCount: parsedResume.skills.length,
        email: parsedResume.email,
        phone: parsedResume.phone,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to parse resume.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
