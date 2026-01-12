# Cloudinary File Upload Setup

## Overview
This implementation uses Cloudinary for cloud storage of profile pictures and resumes, storing only URLs in MongoDB.

## Setup Instructions

### 1. Create Cloudinary Account
1. Go to https://cloudinary.com and sign up for a free account
2. Navigate to Dashboard to get your credentials

### 2. Environment Variables
Add these to your `.env.local` file:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**How to get credentials:**
- Cloud Name: Found in Dashboard (e.g., `dxxxxxxx`)
- API Key: Found in Dashboard -> Account Details
- API Secret: Found in Dashboard -> Account Details (click "API Secret" to reveal)

### 3. Test the Setup
1. Start your development server: `npm run dev`
2. Go to `/profile` page
3. Click the camera icon or "Upload Resume" button
4. Upload a test image (JPG/PNG, max 5MB) or PDF (max 10MB)
5. Check Cloudinary Media Library for uploaded files

## File Structure

```
lib/
  cloudinary.ts              # Cloudinary SDK configuration and utilities
  
app/api/
  upload-profile/
    route.ts                 # File upload endpoint (POST, DELETE)
  user/profile/
    route.ts                 # User profile CRUD operations
    
components/
  FileUpload.tsx             # Reusable file upload component
  
models/
  User.ts                    # User schema with profilePicUrl and resumeUrl
```

## API Endpoints

### POST /api/upload-profile
Upload profile picture and/or resume to Cloudinary.

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Authentication: Required (session)

**Form Fields:**
- `profilePic` (optional): Image file (JPG, PNG, WEBP)
- `resume` (optional): PDF file

**Response:**
```json
{
  "message": "Files uploaded successfully.",
  "data": {
    "profilePicUrl": "https://res.cloudinary.com/...",
    "resumeUrl": "https://res.cloudinary.com/..."
  }
}
```

**Validations:**
- Profile Picture: JPG/PNG/WEBP, max 5MB
- Resume: PDF only, max 10MB
- At least one file required
- Automatically deletes old file before uploading new one

### DELETE /api/upload-profile?type={profilePic|resume}
Delete a file from Cloudinary and user document.

**Request:**
- Method: `DELETE`
- Query Params: `type=profilePic` or `type=resume`
- Authentication: Required (session)

**Response:**
```json
{
  "message": "Profile picture deleted successfully."
}
```

## Database Schema

### User Model (models/User.ts)
```typescript
{
  name: string;
  email: string;
  password?: string;
  profilePicUrl?: string;  // Cloudinary URL
  resumeUrl?: string;      // Cloudinary URL
  savedJobs: ObjectId[];
  appliedJobs: ObjectId[];
  role: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}
```

**Example Document:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john@example.com",
  "profilePicUrl": "https://res.cloudinary.com/demo/image/upload/v1/jobscout/profile-pictures/abc123.jpg",
  "resumeUrl": "https://res.cloudinary.com/demo/raw/upload/v1/jobscout/resumes/xyz456.pdf",
  "savedJobs": [],
  "appliedJobs": [],
  "role": "user",
  "createdAt": "2026-01-12T10:00:00.000Z",
  "updatedAt": "2026-01-12T10:30:00.000Z"
}
```

## Cloudinary Storage Structure

Files are organized in folders:
```
jobscout/
  ├── profile-pictures/    # User profile images
  │   ├── user1_pic.jpg
  │   └── user2_pic.png
  └── resumes/            # User resume PDFs
      ├── user1_resume.pdf
      └── user2_resume.pdf
```

## Frontend Usage

### FileUpload Component
```tsx
import FileUpload from '@/components/FileUpload';

<FileUpload
  type="profilePic"  // or "resume"
  currentUrl={user.profilePicUrl}
  onUploadSuccess={(url) => console.log('Uploaded:', url)}
  onDelete={() => console.log('Deleted')}
/>
```

**Props:**
- `type`: `'profilePic' | 'resume'`
- `currentUrl`: Current file URL (optional)
- `onUploadSuccess`: Callback with uploaded URL
- `onDelete`: Callback for deletion (optional)

**Features:**
- Drag-and-drop support
- File type validation
- File size validation
- Image preview
- Upload progress
- Success/error messages
- Delete functionality

## Security Features

✅ **Authentication**: All endpoints require valid session
✅ **File Type Validation**: Only allowed formats (images/PDF)
✅ **File Size Limits**: 5MB images, 10MB PDFs
✅ **Secure URLs**: Cloudinary secure_url (HTTPS)
✅ **Auto-Cleanup**: Old files deleted before new upload
✅ **Server-Side Processing**: All uploads handled on backend

## Error Handling

Common errors and solutions:

**"Unauthorized. Please sign in."**
- User session expired or invalid
- Solution: Sign in again

**"Invalid profile picture format."**
- Wrong file type uploaded
- Solution: Use JPG, PNG, or WEBP for images

**"Profile picture too large."**
- File exceeds size limit
- Solution: Compress image or use smaller file

**"Invalid resume format."**
- Non-PDF file uploaded
- Solution: Convert to PDF format

**"Failed to upload files."**
- Cloudinary credentials invalid or network error
- Solution: Check environment variables and internet connection

## Production Checklist

- [ ] Cloudinary account created
- [ ] Environment variables set in production
- [ ] File size limits appropriate for your use case
- [ ] CORS configured if needed
- [ ] Cloudinary transformation presets configured (optional)
- [ ] CDN caching configured
- [ ] Backup strategy in place
- [ ] Monitoring/logging enabled
- [ ] Rate limiting configured

## Cost Optimization

Cloudinary free tier includes:
- 25 GB storage
- 25 GB bandwidth/month
- 25,000 transformations/month

**Tips:**
1. Enable auto-format and auto-quality
2. Use responsive images
3. Set up transformation presets
4. Configure caching headers
5. Delete unused files regularly

## Advanced Features (Optional)

### Image Transformations
```typescript
// In cloudinary.ts
const result = await cloudinary.uploader.upload(file, {
  folder: 'jobscout/profile-pictures',
  transformation: [
    { width: 500, height: 500, crop: 'fill' },
    { quality: 'auto' },
    { fetch_format: 'auto' }
  ]
});
```

### Eager Transformations
Pre-generate multiple sizes:
```typescript
eager: [
  { width: 200, height: 200, crop: 'thumb' },
  { width: 500, height: 500, crop: 'fill' }
]
```

### Custom Public IDs
```typescript
public_id: `user_${userId}_profile`,
overwrite: true
```

## Troubleshooting

### Upload fails silently
- Check browser console for errors
- Verify Cloudinary credentials
- Check network tab for failed requests

### Images not displaying
- Verify URL is accessible
- Check image permissions in Cloudinary
- Ensure HTTPS is used

### Slow uploads
- Compress images before upload
- Check internet connection
- Consider using Cloudinary's client-side upload widget

## Support

- Cloudinary Docs: https://cloudinary.com/documentation
- Next.js File Upload: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
- GitHub Issues: [Your repo URL]
