# JobScout – Job Aggregation Platform

JobScout is a modern job aggregation web platform that collects job listings from multiple job portals and displays them in a single unified dashboard with authentication. It works like **Trivago for job portals**, allowing users to search once and explore jobs from multiple sources.

---

## 🚀 Features

- **Unified Job Search** - Search across Adzuna, JSearch, and Jooble APIs
- **User Authentication** - Google OAuth and email/password sign in with NextAuth
- **User Profiles** - Save favorite jobs and track applications
- **Advanced Filtering** - Filter by location, job type, salary, and source
- **Duplicate Free** - Smart filtering removes duplicate listings
- **Dark/Light Theme** - Beautiful UI with theme toggle
- **Real-time Updates** - Automated job fetching every 6 hours via cron
- **Global Reach** - Support for India, US, UK, Canada, Australia, and more
- **Modern UI** - Glassmorphic design with gradients and animations
- **Responsive** - Works seamlessly on desktop and mobile
- **SEO Friendly** - Optimized job pages for search engines

---

## 🧠 Problem Statement

Job seekers must search the same job on multiple job portals like LinkedIn, Indeed, Naukri, and Glassdoor. This process is repetitive and time consuming.

JobScout solves this by aggregating job data from multiple sources and presenting it in a standardized and searchable format with user profiles to track saved and applied jobs.

---

## 🎯 Objectives

- Aggregate jobs from multiple platforms using APIs
- Normalize job data into a common format
- Provide fast search and filtering with text indexing
- Enable user authentication and job tracking
- Redirect users to original job portals for applications
- Automatically update job listings via Vercel cron

---

## 🛠 Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **React 18** - UI library with Server Components
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Modern component library
- **next-themes** - Dark/light mode support
- **lucide-react** - Beautiful icons

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **NextAuth v5** - Authentication with Google OAuth + Credentials
- **Node.js** - JavaScript runtime
- **Axios** - HTTP client for API calls

### Database
- **MongoDB Atlas** - Cloud database
- **Mongoose** - ODM with schema validation
- **MongoDB Adapter** - For NextAuth sessions

### Automation
- **Vercel Cron** - Scheduled job fetching (every 6 hours)

### Hosting
- **Vercel** - Frontend and API hosting
- **MongoDB Atlas** - Database hosting

### External APIs
- **Adzuna API** - Job listings (free tier)
- **JSearch API** - RapidAPI job search
- **Jooble API** - Job aggregation

---

## 🏗 System Architecture

```
User → Next.js Frontend → Next.js API Routes → External Job APIs → MongoDB Database
                                              ↓
                                    NextAuth Authentication
                                              ↓
                                      User Session & Profile
```

---

## 📦 Database Schemas

### Job Schema
```typescript
{
  title: "Software Developer",
  company: "ABC Pvt Ltd",
  location: "Bangalore",
  salary: "Not disclosed",
  experience: "2-4 years",
  jobType: "Full-time",
  source: "Jooble",
  applyLink: "https://jobportal.com/job/123",
  description: "Job description text",
  postedDate: "2025-01-10",
  createdAt: "2025-01-10"
}
```

**Indexes:**
- Compound unique index on `(title, company, location)` to prevent duplicates
- Text index on `(title, description, company)` for search functionality

### User Schema
```typescript
{
  name: "John Doe",
  email: "john@example.com",
  password: "hashed_password", // bcrypt hashed
  image?: "profile_url",
  savedJobs: [ObjectId], // Array of saved job IDs
  appliedJobs: [ObjectId], // Array of applied job IDs
  role: "user" | "admin",
  createdAt: "2025-01-10"
}
```

---

## 🔄 Working Flow

1. **Job Aggregation**
   - Vercel cron triggers job fetching every 6 hours
   - API integrations (Adzuna, JSearch, Jooble) are called with location parameters
   - Data is normalized into common format with source attribution
   - Duplicate detection using compound unique index
   - Jobs stored in MongoDB with timestamps

2. **User Experience**
   - Landing page explains platform features
   - Users can browse jobs without authentication
   - Sign up/Sign in with email or Google OAuth
   - Authenticated users can save jobs and track applications
   - Advanced filtering and text search
   - Click apply to redirect to original job portal

3. **Authentication Flow**
   - NextAuth handles session management
   - Credentials provider with bcrypt password hashing
   - Google OAuth integration (optional)
   - Protected routes via middleware
   - User profiles with saved/applied jobs tracking

---

## 📁 Folder Structure

```
jobscout/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth]/route.ts  # NextAuth handlers
│   │   │   └── register/route.ts        # User registration
│   │   ├── fetch-jobs/route.ts          # Job fetching from APIs
│   │   ├── jobs/
│   │   │   ├── route.ts                 # List jobs with filters
│   │   │   └── [id]/route.ts            # Single job details
│   │   ├── user/jobs/route.ts           # User's saved/applied jobs
│   │   └── clean-duplicates/route.ts    # Duplicate removal
│   ├── auth/
│   │   ├── signin/page.tsx              # Sign in page
│   │   └── signup/page.tsx              # Sign up page
│   ├── jobs/
│   │   ├── page.tsx                     # Job listings page
│   │   └── [id]/page.tsx                # Job detail page
│   ├── profile/page.tsx                 # User profile dashboard
│   ├── admin/page.tsx                   # Admin job fetch panel
│   ├── page.tsx                         # Landing page
│   ├── layout.tsx                       # Root layout with providers
│   └── globals.css                      # Global styles & animations
├── components/
│   ├── ui/                              # shadcn components
│   ├── JobCard.tsx                      # Job listing card
│   ├── Filters.tsx                      # Search & filter form
│   ├── Pagination.tsx                   # Page navigation
│   ├── theme-provider.tsx               # Theme context
│   └── theme-toggle.tsx                 # Dark/light mode toggle
├── lib/
│   ├── db.ts                            # MongoDB connection
│   ├── mongodb-client.ts                # MongoClient for NextAuth
│   └── jobApis/
│       ├── adzuna.ts                    # Adzuna integration
│       ├── jsearch.ts                   # JSearch integration
│       ├── jooble.ts                    # Jooble integration
│       └── index.ts                     # Job aggregator
├── models/
│   ├── Job.ts                           # Job schema
│   └── User.ts                          # User schema
├── types/
│   └── job.ts                           # TypeScript interfaces
├── auth.ts                              # NextAuth configuration
├── middleware.ts                        # Route protection
├── .env.local.example                   # Environment template
└── vercel.json                          # Cron configuration
```

---

## 🔗 API Endpoints

### Public Endpoints
- `GET /api/jobs` - List jobs with pagination and filters
  - Query params: `search`, `location`, `jobType`, `source`, `page`, `limit`
- `GET /api/jobs/[id]` - Get single job details

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/[...nextauth]` - NextAuth handlers (signin, callback, etc.)

### Protected Endpoints (Require Authentication)
- `GET /api/user/jobs` - Get user's saved and applied jobs
- `POST /api/fetch-jobs` - Manually trigger job fetching (admin or cron)
- `GET /api/clean-duplicates` - Check duplicate statistics
- `DELETE /api/clean-duplicates` - Remove duplicate jobs

---

## 🔍 Search & Filters

- **Text Search** - Search in job title, description, company name
- **Location Filter** - Filter by city/country
- **Job Type Filter** - Full-time, Part-time, Contract, Internship
- **Source Filter** - Adzuna, JSearch, Jooble
- **Pagination** - 20 jobs per page with navigation

---

## ⏰ Automated Updates

Vercel Cron configuration in `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/fetch-jobs",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

Jobs are automatically fetched every 6 hours for India, US, UK locations.

---

## 🎨 UI Features

- **Glassmorphism** - Backdrop blur effects on cards
- **Gradients** - Modern gradient backgrounds and text
- **Animations** - Blob animations, gradient animations, hover effects
- **Dark Mode** - Seamless theme switching with next-themes
- **Responsive** - Mobile-first design with Tailwind CSS
- **Icons** - lucide-react icon library
- **Components** - shadcn/ui for consistent design

---

## 🔐 Security & Best Practices

- **API Keys** - Stored securely in environment variables
- **Password Hashing** - bcrypt with salt rounds
- **Session Management** - JWT strategy with NextAuth
- **Protected Routes** - Middleware for authentication checks
- **Input Validation** - Server-side validation on all inputs
- **CORS** - Proper CORS configuration for API routes
- **Rate Limiting** - Prevents API abuse (to be implemented)
- **Data Privacy** - Only permitted APIs used, no scraping
- **Attribution** - Jobs link back to original sources

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- MongoDB Atlas account (free tier works)
- API keys for job portals (see below)

### API Key Setup

1. **Adzuna API** (Free)
   - Sign up at https://developer.adzuna.com/
   - Create an app to get App ID and API Key

2. **JSearch API** (RapidAPI)
   - Sign up at https://rapidapi.com/
   - Subscribe to JSearch API (free tier available)
   - Get your RapidAPI key

3. **Jooble API** (Free)
   - Sign up at https://jooble.org/api/about
   - Request API key

4. **Google OAuth** (Optional for Google Sign In)
   - Go to Google Cloud Console
   - Create a new project
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd jobscout
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Edit `.env.local` and add your credentials:
   ```env
   # MongoDB Connection
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/jobscout
   
   # Job API Keys
   ADZUNA_APP_ID=your_adzuna_app_id
   ADZUNA_API_KEY=your_adzuna_api_key
   JSEARCH_API_KEY=your_jsearch_rapidapi_key
   JOOBLE_API_KEY=your_jooble_api_key
   
   # Vercel Cron Secret
   CRON_SECRET=your_random_secret
   
   # NextAuth Configuration
   NEXTAUTH_SECRET=generate_with_openssl_rand_base64_32
   NEXTAUTH_URL=http://localhost:3000
   
   # Google OAuth (optional)
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```

4. **Generate NextAuth secret**
   ```bash
   openssl rand -base64 32
   ```
   Copy the output to `NEXTAUTH_SECRET` in `.env.local`

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to http://localhost:3000

7. **Initial job fetch**
   - Go to http://localhost:3000/admin
   - Click "Fetch Jobs Now" to populate database
   - Or wait for cron to run automatically

### MongoDB Setup

1. Create a free MongoDB Atlas account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster (free M0 tier)
3. Go to Database Access → Add New Database User
4. Go to Network Access → Add IP Address (allow from anywhere: 0.0.0.0/0 for development)
5. Go to Databases → Connect → Connect your application
6. Copy the connection string and replace `<password>` with your database user password
7. Add the connection string to `MONGODB_URI` in `.env.local`

---

## 📱 Usage

### For Users
1. **Browse Jobs** - Visit homepage and click "Browse Jobs"
2. **Search** - Use search bar to find jobs by keywords
3. **Filter** - Apply location, job type, and source filters
4. **Sign Up** - Create account with email or Google
5. **Save Jobs** - Click save icon on job cards (coming soon)
6. **Track Applications** - Mark jobs as applied in profile (coming soon)

### For Admins
1. Visit `/admin` page (protected route)
2. Select location from dropdown
3. Click "Fetch Jobs Now" to manually fetch jobs
4. View duplicate statistics at `/api/clean-duplicates`

---

## 🔮 Future Enhancements

- ✅ User authentication (Completed)
- ✅ Landing page (Completed)
- ✅ Profile dashboard (Completed)
- ✅ Dark/light theme (Completed)
- 🔄 Save job functionality (In Progress)
- 🔄 Track applications (In Progress)
- ⏳ AI-based job recommendations
- ⏳ Resume matching score
- ⏳ Job alerts via email/SMS
- ⏳ Advanced user profiles with resume upload
- ⏳ Admin analytics dashboard
- ⏳ Job market insights and trends
- ⏳ Company reviews and ratings
- ⏳ Salary insights and negotiation tips

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is for educational purposes as part of a college project.

---

## 📌 Conclusion

JobScout is a scalable and modern job aggregation platform that simplifies job searching by providing a single access point to multiple job portals with user authentication, job tracking, and a beautiful modern UI.

---

## 👨‍💻 Author

**Abhinav Pramanik**  
B.Tech Computer Science Engineering  
College Project – JobScout  

---

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- shadcn for the beautiful UI components
- Vercel for hosting and cron jobs
- MongoDB for the database
- All the job API providers (Adzuna, JSearch, Jooble)
