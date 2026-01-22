import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { uploadToCloudinary, deleteFromCloudinary, getPublicIdFromUrl } from '@/lib/cloudinary';
import { parseResume } from '@/lib/resumeParser';

export const runtime = 'nodejs';

// Disable body parser to handle multipart/form-data
// export const config = {
//   api: {
//     bodyParser: false,
//   },
// };

/**
 * POST /api/upload-profile
 * Upload profile picture and/or resume to Cloudinary
 * Accepts multipart/form-data with fields: profilePic, resume
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

    // Parse FormData
    const formData = await req.formData();
    const profilePic = formData.get('profilePic') as File | null;
    const resume = formData.get('resume') as File | null;

    if (!profilePic && !resume) {
      return NextResponse.json(
        { error: 'No files provided. Please upload at least one file.' },
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

    const uploadResults: {
      profilePicUrl?: string;
      resumeUrl?: string;
      skills?: string[];
    } = {};

    // Upload profile picture
    if (profilePic) {
      // Validate file type
      const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedImageTypes.includes(profilePic.type)) {
        return NextResponse.json(
          { error: 'Invalid profile picture format. Only JPG, PNG, and WEBP are allowed.' },
          { status: 400 }
        );
      }

      // Validate file size (5MB max)
      if (profilePic.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { error: 'Profile picture too large. Maximum size is 5MB.' },
          { status: 400 }
        );
      }

      // Convert File to Buffer
      const bytes = await profilePic.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Delete old profile picture if exists
      if (user.profilePicUrl) {
        try {
          const publicId = getPublicIdFromUrl(user.profilePicUrl);
          await deleteFromCloudinary(publicId, 'image');
        } catch (error) {
          // Ignore deletion errors
        }
      }

      // Upload to Cloudinary
      const result = await uploadToCloudinary(
        buffer,
        'jobscout/profile-pictures',
        'image',
        ['jpg', 'jpeg', 'png', 'webp']
      ) as { secure_url: string };

      uploadResults.profilePicUrl = result.secure_url;
      user.profilePicUrl = result.secure_url;
    }

    // Upload resume
    if (resume) {
      // Validate file type
      if (resume.type !== 'application/pdf') {
        return NextResponse.json(
          { error: 'Invalid resume format. Only PDF files are allowed.' },
          { status: 400 }
        );
      }

      // Validate file size (10MB max)
      if (resume.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { error: 'Resume file too large. Maximum size is 10MB.' },
          { status: 400 }
        );
      }

      // Convert File to Buffer
      const bytes = await resume.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Parse resume and extract skills BEFORE uploading
      try {
        const parsedResume = await parseResume(buffer);
        user.skills = parsedResume.skills;
        uploadResults.skills = parsedResume.skills;
      } catch (parseError) {
        // Continue with upload even if parsing fails
        user.skills = [];
        uploadResults.skills = [];
      }

      // Delete old resume if exists
      if (user.resumeUrl) {
        try {
          const publicId = getPublicIdFromUrl(user.resumeUrl);
          await deleteFromCloudinary(publicId, 'raw');
        } catch (error) {
          // Ignore deletion errors
        }
      }

      // Upload to Cloudinary
      const result = await uploadToCloudinary(
        buffer,
        'jobscout/resumes',
        'raw',
        ['pdf']
      ) as { secure_url: string };

      uploadResults.resumeUrl = result.secure_url;
      user.resumeUrl = result.secure_url;
    }

    // Save user
    await user.save();

    return NextResponse.json(
      {
        message: 'Files uploaded successfully.',
        data: {
          profilePicUrl: user.profilePicUrl,
          resumeUrl: user.resumeUrl,
          skills: user.skills,
          skillsCount: user.skills?.length || 0,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to upload files.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/upload-profile
 * Delete profile picture or resume from Cloudinary
 * Query params: type=profilePic|resume
 */
export async function DELETE(req: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type'); // 'profilePic' or 'resume'

    if (!type || !['profilePic', 'resume'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid type. Use "profilePic" or "resume".' },
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

    // Delete from Cloudinary
    if (type === 'profilePic' && user.profilePicUrl) {
      const publicId = getPublicIdFromUrl(user.profilePicUrl);
      await deleteFromCloudinary(publicId, 'image');
      user.profilePicUrl = undefined;
    } else if (type === 'resume' && user.resumeUrl) {
      const publicId = getPublicIdFromUrl(user.resumeUrl);
      await deleteFromCloudinary(publicId, 'raw');
      user.resumeUrl = undefined;
      user.skills = [];
    } else {
      return NextResponse.json(
        { error: `No ${type} found to delete.` },
        { status: 404 }
      );
    }

    await user.save();

    return NextResponse.json(
      {
        message: `${type === 'profilePic' ? 'Profile picture' : 'Resume'} deleted successfully.`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete file.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
