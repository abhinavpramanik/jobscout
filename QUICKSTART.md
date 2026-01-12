# Quick Start Guide - Cloudinary File Upload

## 🚀 5-Minute Setup

### Step 1: Install Dependencies (Already Done ✅)
```bash
npm install cloudinary
```

### Step 2: Get Cloudinary Credentials

1. Go to https://cloudinary.com/users/register_free
2. Create a free account
3. Go to Dashboard: https://cloudinary.com/console
4. Copy your credentials:
   - **Cloud Name** (e.g., `dxxxxxx`)
   - **API Key** (e.g., `123456789012345`)
   - **API Secret** (click to reveal)

### Step 3: Add Environment Variables

Create/edit `.env.local`:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

**Important:** Replace the placeholder values with your actual Cloudinary credentials!

### Step 4: Start Development Server

```bash
npm run dev
```

### Step 5: Test the Upload

1. Open http://localhost:3000
2. Sign in to your account
3. Go to Profile page
4. Click the camera icon or "Upload Resume" button
5. Upload a test image (JPG/PNG, max 5MB) or PDF (max 10MB)
6. ✅ Success! File is now on Cloudinary

### Step 6: Verify Upload

**In your browser:**
- Profile picture should display immediately
- Resume download link should work

**In Cloudinary:**
1. Go to https://cloudinary.com/console/media_library
2. Navigate to `jobscout/profile-pictures` or `jobscout/resumes` folder
3. Your files should be there!

**In MongoDB:**
```javascript
// Query your user document
db.users.findOne({ email: "your-email@example.com" })

// Should see something like:
{
  profilePicUrl: "https://res.cloudinary.com/.../picture.jpg",
  resumeUrl: "https://res.cloudinary.com/.../resume.pdf"
}
```

## ✅ That's it! You're ready to go!

---

## 📝 File Validation Rules

### Profile Picture
- **Allowed:** JPG, PNG, WEBP
- **Max Size:** 5MB
- **Stored in:** `jobscout/profile-pictures/` folder

### Resume
- **Allowed:** PDF only
- **Max Size:** 10MB
- **Stored in:** `jobscout/resumes/` folder

---

## 🐛 Common Issues

### "Upload failed" error
**Solution:** Check these in order:
1. Are environment variables set correctly in `.env.local`?
2. Did you restart the dev server after adding env vars?
3. Is your Cloudinary account active?
4. Copy error from browser console and check error message

### "Unauthorized" error
**Solution:** Make sure you're logged in. Go to `/auth/signin`

### Images not showing
**Solution:** 
1. Open the image URL directly in browser
2. If it loads, issue is with Next.js Image component
3. If it doesn't load, check Cloudinary Media Library

### File too large
**Solution:** 
- Images: Max 5MB - compress your image
- PDFs: Max 10MB - reduce PDF size

---

## 📞 Need Help?

**Check documentation:**
- `CLOUDINARY_SETUP.md` - Full setup guide
- `IMPLEMENTATION_SUMMARY.md` - Technical details
- `examples/mongodb-document-example.js` - Database examples

**Still stuck?**
1. Check browser console for errors (F12)
2. Check terminal for server errors
3. Verify all environment variables are set
4. Ensure Cloudinary credentials are correct

---

## 🎉 Quick Test Checklist

- [ ] `.env.local` has Cloudinary credentials
- [ ] Dev server is running (`npm run dev`)
- [ ] Logged in to the application
- [ ] Can access profile page
- [ ] Upload modal opens when clicking camera/upload button
- [ ] Profile picture upload works
- [ ] Image displays in profile
- [ ] Resume upload works
- [ ] Resume download link works
- [ ] Delete functionality works
- [ ] Files visible in Cloudinary Media Library
- [ ] MongoDB shows URLs (not base64 data)

---

**Time to complete:** ~5 minutes  
**Difficulty:** Easy  
**Prerequisites:** Cloudinary account (free)
