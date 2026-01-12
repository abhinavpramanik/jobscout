# Cloudinary File Upload Implementation - Summary

## ✅ What Was Implemented

### 1. Cloudinary Configuration (`lib/cloudinary.ts`)
- Configured Cloudinary SDK with environment variables
- Created `uploadToCloudinary()` utility function
- Created `deleteFromCloudinary()` utility function  
- Created `getPublicIdFromUrl()` helper for extraction
- Supports both images (`image` type) and PDFs (`raw` type)
- Built-in file size limits (5MB images, 10MB PDFs)

### 2. User Model Updates (`models/User.ts`)
**Changed fields:**
- ~~`image`~~ → `profilePicUrl` (string | undefined)
- ~~`resume`~~ → `resumeUrl` (string | undefined)

**Why:** More descriptive names that clearly indicate these store URLs, not file data

### 3. Upload API Route (`app/api/upload-profile/route.ts`)
**POST /api/upload-profile**
- Accepts `multipart/form-data` with fields: `profilePic`, `resume`
- Validates file types (images: jpg/png/webp, resume: pdf only)
- Validates file sizes (5MB for images, 10MB for PDFs)
- Uploads to Cloudinary folders: `jobscout/profile-pictures` and `jobscout/resumes`
- Automatically deletes old files before uploading new ones
- Updates MongoDB user document with new URLs
- Returns Cloudinary secure URLs (HTTPS)

**DELETE /api/upload-profile?type={profilePic|resume}**
- Deletes file from Cloudinary
- Removes URL from MongoDB user document
- Query param specifies which file to delete

### 4. Profile API Updates (`app/api/user/profile/route.ts`)
**GET /api/user/profile**
- Now returns `profilePicUrl` and `resumeUrl` instead of `image` and `resume`

**POST /api/user/profile**
- Now accepts `profilePicUrl` and `resumeUrl` for manual updates (if needed)

### 5. FileUpload Component (`components/FileUpload.tsx`)
**Reusable component with:**
- Drag-and-drop file upload
- File type validation (client-side)
- File size validation (client-side)
- Image preview for profile pictures
- PDF file name display for resumes
- Upload progress indicators
- Success/error messaging
- Delete functionality
- Current file display
- Loading states

**Props:**
```typescript
{
  type: 'profilePic' | 'resume';
  currentUrl?: string | null;
  onUploadSuccess: (url: string) => void;
  onDelete?: () => void;
}
```

### 6. Profile Page Updates (`app/profile/page.tsx`)
**Changes:**
- Added upload modal with both profile picture and resume upload
- Profile picture shows Cloudinary URL with Next.js Image optimization
- Resume section links to Cloudinary PDF URL
- Click camera icon or upload button to open modal
- Auto-refreshes profile data after successful upload
- Removed old FileReader/data URL logic

**Modal features:**
- Two separate upload sections (profile pic + resume)
- Individual file management
- Close button
- Full-screen overlay

## 📁 Files Created

```
lib/
  cloudinary.ts                      # NEW: Cloudinary configuration
  
app/api/
  upload-profile/
    route.ts                         # NEW: Upload/delete endpoint
    
components/
  FileUpload.tsx                     # NEW: Reusable upload component
  
examples/
  mongodb-document-example.js        # NEW: MongoDB structure examples
  
CLOUDINARY_SETUP.md                  # NEW: Complete documentation
.env.example                         # UPDATED: Added Cloudinary vars
```

## 📝 Files Modified

```
models/User.ts                       # Updated field names
app/api/user/profile/route.ts        # Updated to use new field names
app/profile/page.tsx                 # Integrated FileUpload component
```

## 🔐 Environment Variables Required

Add to `.env.local`:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Get these from: https://cloudinary.com/console

## 🎯 Key Features

✅ **No Base64 Storage** - Only URLs stored in MongoDB  
✅ **Automatic File Deletion** - Old files removed when uploading new ones  
✅ **File Validation** - Type and size checks on both client and server  
✅ **Cloud Storage** - Files stored in Cloudinary with CDN delivery  
✅ **Secure URLs** - All files served over HTTPS  
✅ **Organized Storage** - Files organized in folders by type  
✅ **Image Optimization** - Next.js Image component with automatic optimization  
✅ **Error Handling** - Comprehensive error messages for users  
✅ **Loading States** - Visual feedback during uploads  
✅ **Authentication** - All endpoints require valid session  
✅ **TypeScript** - Full type safety throughout  

## 📊 Storage Comparison

**Before (Base64 in MongoDB):**
- 5MB image → ~6.7MB in database
- Slow queries
- No CDN
- No transformations

**After (Cloudinary URLs):**
- 5MB image → ~200 bytes in database (URL only)
- Fast queries  
- Global CDN delivery
- Built-in transformations available

**Space saved:** 99.99% reduction in database size

## 🚀 How to Use

### For Users:
1. Navigate to `/profile`
2. Click camera icon (for profile pic) or "Upload Resume" button
3. Select file from your computer
4. Click "Upload" button
5. File uploads to Cloudinary
6. URL saved in your profile
7. File immediately visible in profile

### For Developers:
```typescript
// Use FileUpload component anywhere
import FileUpload from '@/components/FileUpload';

<FileUpload
  type="profilePic"
  currentUrl={user.profilePicUrl}
  onUploadSuccess={(url) => {
    console.log('New URL:', url);
    // Refresh user data
  }}
  onDelete={() => {
    console.log('File deleted');
    // Refresh user data
  }}
/>
```

## 🔧 API Usage Examples

### Upload Profile Picture
```typescript
const formData = new FormData();
formData.append('profilePic', file);

const response = await fetch('/api/upload-profile', {
  method: 'POST',
  body: formData,
});

const data = await response.json();
console.log(data.data.profilePicUrl);
```

### Upload Resume
```typescript
const formData = new FormData();
formData.append('resume', pdfFile);

const response = await fetch('/api/upload-profile', {
  method: 'POST',
  body: formData,
});

const data = await response.json();
console.log(data.data.resumeUrl);
```

### Delete File
```typescript
const response = await fetch('/api/upload-profile?type=profilePic', {
  method: 'DELETE',
});
```

## 🧪 Testing Checklist

- [ ] Sign up/login to application
- [ ] Navigate to profile page
- [ ] Upload profile picture (JPG/PNG)
- [ ] Verify image appears in profile
- [ ] Upload resume (PDF)
- [ ] Verify resume download link works
- [ ] Delete profile picture
- [ ] Upload new profile picture (should replace)
- [ ] Try uploading wrong file types (should show error)
- [ ] Try uploading oversized files (should show error)
- [ ] Check Cloudinary Media Library for uploaded files
- [ ] Verify MongoDB only contains URLs, not file data

## 📦 Dependencies Installed

```json
{
  "cloudinary": "^2.8.0"
}
```

**Note:** Originally tried to install `multer` and `multer-storage-cloudinary`, but removed them as they're not needed. Next.js 15 App Router handles multipart/form-data natively via `req.formData()`.

## 🎨 UI/UX Features

- **Drag & Drop** - Users can drag files onto upload area
- **Preview** - Profile pictures show preview before upload
- **Progress Indicators** - Loading spinners during upload
- **Success Messages** - Green checkmark with success text
- **Error Messages** - Red alert with specific error details
- **Current File Display** - Shows currently uploaded file
- **Delete Confirmation** - Visual feedback when deleting
- **Responsive Design** - Works on all screen sizes
- **Dark Mode Support** - Full dark mode styling
- **Accessibility** - Proper ARIA labels and keyboard navigation

## 🔒 Security Measures

1. **Authentication Required** - All endpoints check for valid session
2. **File Type Whitelist** - Only specific file types allowed
3. **File Size Limits** - Prevents large file uploads
4. **Server-Side Validation** - All validation happens on backend
5. **Secure URLs** - HTTPS only from Cloudinary
6. **Environment Variables** - API keys never exposed to client
7. **Error Sanitization** - No sensitive data in error messages

## 📈 Performance Benefits

- **Faster Page Loads** - Images served from Cloudinary CDN
- **Smaller Database** - Only URLs stored, not file data
- **Auto-Optimization** - Cloudinary optimizes images automatically
- **Global CDN** - Files served from nearest edge location
- **Lazy Loading** - Next.js Image component lazy loads images
- **Caching** - Browser and CDN caching for faster subsequent loads

## 🌐 Production Deployment

Before deploying:

1. Set environment variables in production (Vercel, Railway, etc.)
2. Verify Cloudinary account has sufficient quota
3. Configure Cloudinary upload presets (optional)
4. Set up monitoring/alerts for failed uploads
5. Test file uploads in production environment
6. Verify CORS settings if needed
7. Set up backup/disaster recovery plan

## 🆘 Troubleshooting

**Upload fails with 401 Unauthorized:**
- Check if user is logged in
- Verify session is valid

**Upload fails with 400 Invalid file:**
- Check file type matches allowed formats
- Check file size is within limits

**Upload fails with 500 Server error:**
- Verify Cloudinary credentials in .env.local
- Check server logs for detailed error
- Verify MongoDB connection

**Images not displaying:**
- Check browser console for errors
- Verify URL is accessible (copy/paste in browser)
- Check Cloudinary Media Library for file

## 📚 Additional Resources

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Next.js Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)
- [Next.js Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [MongoDB Best Practices](https://www.mongodb.com/docs/manual/administration/production-notes/)

## ✨ Future Enhancements

Possible improvements:
- [ ] Add image cropping tool
- [ ] Support multiple file formats for resume (DOCX, TXT)
- [ ] Add file compression before upload
- [ ] Implement progress bars for large files
- [ ] Add batch upload support
- [ ] Implement image transformations (thumbnails, etc.)
- [ ] Add file versioning/history
- [ ] Implement direct browser-to-Cloudinary upload (bypass server)
- [ ] Add file scan for viruses
- [ ] Implement signed URLs for private files

---

**Implementation Status:** ✅ Complete and ready for testing

**Last Updated:** January 12, 2026
