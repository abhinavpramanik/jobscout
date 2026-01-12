# Resume Parsing & Skill Matching Implementation Guide

## Status: Libraries Installed ✅
- ✅ pdf-parse installed
- ✅ @types/pdf-parse installed
- ✅ lib/skillsDatabase.ts created
- ✅ lib/resumeParser.ts created
- ✅ lib/skillMatcher.ts created

## Files That Need Manual Updates:

### 1. models/User.ts
Add the `skills` field after `resumeUrl`:

```typescript
skills: {
  type: [String],
  default: [],
},
```

And update the interface:
```typescript
export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  profilePicUrl?: string;
  resumeUrl?: string;
  skills: string[];  // ADD THIS LINE
  savedJobs: mongoose.Types.ObjectId[];
  appliedJobs: mongoose.Types.ObjectId[];
  role: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}
```

---

### 2. app/api/upload-profile/route.ts
Add this import at the top:
```typescript
import { parseResume } from '@/lib/resumeParser';
```

Update the `uploadResults` interface (around line 53):
```typescript
const uploadResults: {
  profilePicUrl?: string;
  resumeUrl?: string;
  skills?: string[];  // ADD THIS LINE
} = {};
```

In the resume upload section (around line 107), add resume parsing BEFORE uploading to Cloudinary:
```typescript
// Upload resume
if (resume) {
  if (resume.type !== 'application/pdf') {
    return NextResponse.json(
      { error: 'Invalid resume format. Only PDF files are allowed.' },
      { status: 400 }
    );
  }

  if (resume.size > 10 * 1024 * 1024) {
    return NextResponse.json(
      { error: 'Resume file too large. Maximum size is 10MB.' },
      { status: 400 }
    );
  }

  const bytes = await resume.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // NEW: Parse resume and extract skills BEFORE uploading
  try {
    const parsedResume = await parseResume(buffer);
    user.skills = parsedResume.skills;
    uploadResults.skills = parsedResume.skills;
    
    console.log(`✅ Extracted ${parsedResume.skills.length} skills from resume:`, parsedResume.skills);
  } catch (parseError) {
    console.error('❌ Error parsing resume:', parseError);
    // Continue with upload even if parsing fails
  }

  // Rest of the upload code...
  if (user.resumeUrl) {
    try {
      const publicId = getPublicIdFromUrl(user.resumeUrl);
      await deleteFromCloudinary(publicId, 'raw');
    } catch (error) {
      console.error('Error deleting old resume:', error);
    }
  }

  const result = await uploadToCloudinary(
    buffer,
    'jobscout/resumes',
    'raw',
    ['pdf']
  ) as { secure_url: string };

  uploadResults.resumeUrl = result.secure_url;
  user.resumeUrl = result.secure_url;
}
```

Update the success response (around line 148):
```typescript
return NextResponse.json(
  {
    message: 'Files uploaded successfully.',
    data: {
      profilePicUrl: user.profilePicUrl,
      resumeUrl: user.resumeUrl,
      skills: user.skills,           // ADD THIS
      skillsCount: user.skills?.length || 0,  // ADD THIS
    },
  },
  { status: 200 }
);
```

In the DELETE function, when deleting resume (around line 217), also clear skills:
```typescript
else if (type === 'resume' && user.resumeUrl) {
  const publicId = getPublicIdFromUrl(user.resumeUrl);
  await deleteFromCloudinary(publicId, 'raw');
  user.resumeUrl = undefined;
  user.skills = [];  // ADD THIS LINE to clear skills
}
```

---

### 3. types/job.ts
Add the `matchScore` field:

```typescript
export interface Job {
  _id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  experience: string;
  jobType: string;
  source: string;
  applyLink: string;
  description: string;
  postedDate: string;
  createdAt: string;
  updatedAt: string;
  matchScore?: number; // ADD THIS LINE
}
```

---

### 4. components/JobCard.tsx
Add imports at the top:
```typescript
import { MapPin, DollarSign, Briefcase, Calendar, Bookmark, Award } from 'lucide-react'; // Add Award
import { getMatchColor } from '@/lib/skillMatcher'; // ADD THIS
```

Add the date formatter function before the return statement:
```typescript
// Format date as dd/mm/yyyy
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

// Get match badge color
const getMatchBadgeColor = (score: number): string => {
  const color = getMatchColor(score);
  const colorMap: Record<string, string> = {
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    yellow: 'bg-yellow-500',
    orange: 'bg-orange-500',
    red: 'bg-red-500',
  };
  return colorMap[color] || 'bg-gray-500';
};
```

Update the badge section (around line 73):
```typescript
<div className="flex flex-col gap-2 items-end">
  <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 shadow-lg">
    {job.source}
  </Badge>
  {/* Match Score Badge */}
  {session && job.matchScore !== undefined && job.matchScore > 0 && (
    <Badge className={`${getMatchBadgeColor(job.matchScore)} text-white border-0 shadow-lg flex items-center gap-1`}>
      <Award className="w-3 h-3" />
      {job.matchScore}% Match
    </Badge>
  )}
</div>
```

Update the date display (around line 120):
```typescript
<div className="flex items-center text-xs text-gray-500 dark:text-slate-400">
  <Calendar className="w-3 h-3 mr-1" />
  <span>{formatDate(job.postedDate)}</span>
</div>
```

---

### 5. app/jobs/page.tsx
Add imports at the top:
```typescript
import { calculateSkillMatch } from '@/lib/skillMatcher';
import { extractSkillsFromText } from '@/lib/skillsDatabase';
```

Add state for user skills (around line 30):
```typescript
const [userSkills, setUserSkills] = useState<string[]>([]);
```

Add useEffect to fetch user skills (after other useEffects):
```typescript
// Fetch user skills when logged in
useEffect(() => {
  if (session?.user) {
    fetchUserSkills();
  }
}, [session]);

// Fetch user skills from profile
const fetchUserSkills = async () => {
  try {
    const res = await fetch('/api/user/profile');
    if (res.ok) {
      const data = await res.json();
      setUserSkills(data.user?.skills || []);
      console.log('✅ User skills loaded:', data.user?.skills?.length || 0);
    }
  } catch (error) {
    console.error('Error fetching user skills:', error);
  }
};

// Calculate match score for a job
const calculateJobMatchScore = (job: Job): number => {
  if (!userSkills || userSkills.length === 0) return 0;
  
  // Extract skills from job title and description
  const jobText = `${job.title} ${job.description} ${job.experience}`;
  const jobSkills = extractSkillsFromText(jobText);
  
  if (jobSkills.length === 0) return 0;
  
  // Calculate match
  const matchResult = calculateSkillMatch(userSkills, jobSkills);
  return matchResult.matchScore;
};
```

Update the fetchJobs function to calculate match scores:
```typescript
if (data.success) {
  // Calculate match scores for each job
  const jobsWithScores = data.data.map(job => ({
    ...job,
    matchScore: session?.user ? calculateJobMatchScore(job) : undefined,
  }));

  // Sort by match score if user is logged in and has skills
  if (session?.user && userSkills.length > 0) {
    jobsWithScores.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
  }

  setJobs(jobsWithScores);
  setPagination(data.pagination);
}
```

Update the useEffect dependencies (around line 86):
```typescript
useEffect(() => {
  fetchJobs(currentPage, filters);
}, [currentPage, userSkills]); // Add userSkills here
```

Update the header description (around line 150):
```typescript
<p className="text-gray-700 dark:text-gray-300 mt-2 font-medium">
  Find your dream job across multiple platforms
  {session && userSkills.length > 0 && (
    <span className="ml-2 text-sm text-blue-600 dark:text-blue-400">
      • {userSkills.length} skills detected from your resume
    </span>
  )}
</p>
```

Update the stats section (around line 165):
```typescript
<p className="text-sm font-medium text-slate-600 dark:text-slate-300">
  Showing {jobs.length} of {pagination.total} jobs
  {filters.search && ` for "${filters.search}"`}
  {filters.location && ` in ${filters.location}`}
  {session && userSkills.length > 0 && (
    <span className="text-blue-600 dark:text-blue-400"> (sorted by match score)</span>
  )}
</p>
```

---

### 6. app/api/user/profile/route.ts
Update the GET response to include skills:
```typescript
return NextResponse.json({
  success: true,
  user: {
    name: user.name,
    email: user.email,
    profilePicUrl: user.profilePicUrl,
    resumeUrl: user.resumeUrl,
    skills: user.skills || [],  // ADD THIS LINE
    savedJobsCount: user.savedJobs?.length || 0,
    appliedJobsCount: user.appliedJobs?.length || 0,
  },
});
```

---

## Testing Checklist:

1. ✅ Upload a PDF resume through profile page
2. ✅ Check browser console for "Extracted X skills from resume"
3. ✅ Navigate to jobs page
4. ✅ Verify match score badges appear on job cards
5. ✅ Verify jobs are sorted by match score
6. ✅ Verify dates are formatted as dd/mm/yyyy
7. ✅ Check that skills persist in user profile

---

## How It Works:

1. **Upload Resume** → PDF parsed → Skills extracted → Saved to User model
2. **Browse Jobs** → User skills fetched → Match calculated for each job → Jobs sorted
3. **Match Score** = (Matched Skills / Required Skills) × 100%
4. **Color Coding**:
   - 80-100%: Green (Excellent)
   - 60-79%: Blue (Good)
   - 40-59%: Yellow (Fair)
   - 20-39%: Orange (Partial)
   - 0-19%: Red (Low)

---

## Files Created:
✅ lib/skillsDatabase.ts (200+ skills)
✅ lib/resumeParser.ts (PDF parsing)
✅ lib/skillMatcher.ts (Match algorithm)

## Files Need Manual Update:
📝 models/User.ts
📝 app/api/upload-profile/route.ts
📝 types/job.ts
📝 components/JobCard.tsx
📝 app/jobs/page.tsx
📝 app/api/user/profile/route.ts

All code snippets are provided above. Copy and paste into the appropriate locations!
