# JobScout – Job Aggregation Platform

JobScout is a job aggregation web platform that collects job listings from multiple job portals (Adzuna, JSearch, Jooble) and displays them in a single unified dashboard. It works like **Trivago for job portals**, allowing users to search once and explore jobs from multiple sources.

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## 🚀 Features

- **Unified Job Search** - Search across multiple job portals simultaneously
- **Smart Filtering** - Filter by location, job type, company, and source
- **Duplicate Prevention** - Automatic duplicate detection using compound unique index
- **Real-time Updates** - Automated job fetching via cron jobs every 6 hours
- **Responsive UI** - Fast and mobile-friendly interface built with Tailwind CSS
- **SEO Friendly** - Server-side rendering for better search engine visibility
- **External Application** - Direct redirect to original job portals for applying

---

## 🛠 Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **React 18** - UI library
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **Node.js** - Runtime environment
- **Axios** - HTTP client for API calls

### Database
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling

### Job APIs
- **Adzuna API** - Free job listings API
- **JSearch API** - RapidAPI job search
- **Jooble API** - Job aggregation API

### Automation
- **Vercel Cron** - Scheduled job fetching

### Hosting
- **Vercel** - Frontend and API hosting
- **MongoDB Atlas** - Cloud database

---

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- MongoDB (local or Atlas)
- API keys for job sources

### Steps

1. **Clone the repository**
```bash
git clone <repository-url>
cd jobscout
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**

Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:
```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/jobscout
# or for Atlas: mongodb+srv://username:password@cluster.mongodb.net/jobscout

# API Keys
ADZUNA_APP_ID=your_adzuna_app_id
ADZUNA_APP_KEY=your_adzuna_app_key
RAPID_API_KEY=your_rapidapi_key
JOOBLE_API_KEY=your_jooble_api_key

# Cron Secret (generate a random string)
CRON_SECRET=your_random_secret_key
```

4. **Get API Keys**

- **Adzuna**: Sign up at [https://developer.adzuna.com/](https://developer.adzuna.com/)
- **JSearch**: Subscribe at [https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch](https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch)
- **Jooble**: Apply at [https://jooble.org/api/about](https://jooble.org/api/about)

5. **Run development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔗 API Endpoints

### Job Management
- `GET /api/jobs` - Fetch jobs with filtering and pagination
- `GET /api/jobs/[id]` - Get single job details
- `POST /api/fetch-jobs` - Fetch jobs from external APIs (protected)
- `DELETE /api/clean-duplicates` - Remove duplicate jobs (protected)

### Query Parameters for `/api/jobs`
- `search` - Text search across title, company, location, description
- `location` - Filter by location
- `company` - Filter by company name
- `jobType` - Filter by job type (Full-time, Part-time, etc.)
- `source` - Filter by source (Adzuna, JSearch, Jooble)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)
- `sort` - Sort field (default: -createdAt)

---

## 📊 Database Schema

```typescript
{
  title: string;           // Job title
  company: string;         // Company name
  location: string;        // Job location
  salary: string;          // Salary range or "Not disclosed"
  experience: string;      // Required experience
  jobType: string;         // Full-time, Part-time, etc.
  source: string;          // Adzuna, JSearch, Jooble
  applyLink: string;       // Original job posting URL
  description: string;     // Job description (HTML/text)
  postedDate: string;      // YYYY-MM-DD format
  createdAt: Date;         // Auto-generated
  updatedAt: Date;         // Auto-generated
}
```

**Indexes:**
- Compound unique index on `(title, company, location)` to prevent duplicates
- Text index on `(title, company, location, description)` for search
- Single indexes on `source`, `jobType`, `createdAt`

---

## 🔄 Workflow

1. **Cron Job Triggers** - Every 6 hours (configured in `vercel.json`)
2. **API Calls** - Fetches jobs from Adzuna, JSearch, and Jooble
3. **Data Normalization** - Transforms different API formats into common schema
4. **Duplicate Prevention** - MongoDB unique index prevents duplicate entries
5. **Database Storage** - Jobs stored in MongoDB Atlas
6. **User Search** - Frontend fetches jobs with filters via API routes
7. **Apply Redirect** - Users redirected to original job portal

---

## ⏰ Automated Job Fetching

Jobs are automatically fetched every 6 hours using Vercel Cron:

**Cron Schedule:** `0 */6 * * *` (Every 6 hours)

Manual trigger:
```bash
curl -X POST http://localhost:3000/api/fetch-jobs \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"query":"software developer","location":"United States"}'
```

---

## 🚀 Deployment

### Deploy to Vercel

1. **Push to GitHub**
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables from `.env.local`
   - Deploy!

3. **Set up MongoDB Atlas**
   - Create free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
   - Get connection string
   - Add to Vercel environment variables

---

## 🔐 Security Features

- ✅ Protected cron endpoints with `CRON_SECRET`
- ✅ Environment variables for sensitive data
- ✅ No user data collection
- ✅ External redirect for job applications
- ✅ Rate limiting consideration for API calls
- ✅ Respects robots.txt and API terms of service

---

## 📁 Project Structure

```
jobscout/
├── app/
│   ├── api/
│   │   ├── fetch-jobs/route.ts      # Fetch jobs from APIs
│   │   ├── jobs/route.ts             # List jobs with filters
│   │   ├── jobs/[id]/route.ts        # Single job details
│   │   └── clean-duplicates/route.ts # Duplicate cleanup
│   ├── jobs/
│   │   └── [id]/page.tsx             # Job detail page
│   ├── layout.tsx                    # Root layout
│   └── page.tsx                      # Home page (job listings)
├── components/
│   ├── JobCard.tsx                   # Job card component
│   ├── Filters.tsx                   # Search filters
│   └── Pagination.tsx                # Pagination component
├── lib/
│   ├── db.ts                         # MongoDB connection
│   └── jobApis/
│       ├── adzuna.ts                 # Adzuna API integration
│       ├── jsearch.ts                # JSearch API integration
│       ├── jooble.ts                 # Jooble API integration
│       ├── types.ts                  # Type definitions
│       └── index.ts                  # API aggregator
├── models/
│   └── Job.ts                        # Mongoose Job model
├── types/
│   └── job.ts                        # TypeScript types
├── .env.local                        # Environment variables (gitignored)
├── .env.example                      # Environment template
├── vercel.json                       # Vercel cron configuration
├── package.json                      # Dependencies
└── README.md                         # Documentation
```

---

## 🔮 Future Enhancements

- [ ] AI-powered job recommendations
- [ ] Resume matching score
- [ ] Email job alerts
- [ ] User authentication and profiles
- [ ] Saved jobs and favorites
- [ ] Admin dashboard with analytics
- [ ] Job market analytics and trends
- [ ] Salary insights and comparisons
- [ ] Company reviews integration
- [ ] Advanced filters (remote, hybrid, salary range)

---

## 🐛 Troubleshooting

### MongoDB Connection Issues
```bash
# Test local MongoDB
mongosh

# For Atlas, check IP whitelist and connection string
```

### API Rate Limits
- Adzuna: 1000 calls/month (free tier)
- JSearch: Varies by RapidAPI plan
- Jooble: Check your API quota

### Cron Not Running
- Verify `CRON_SECRET` is set in Vercel
- Check Vercel Cron logs in dashboard
- Test endpoint manually with curl

---

## 📝 License

MIT License - feel free to use this project for learning or commercial purposes.

---

## 👨‍💻 Author

**Abhinav Pramanik**  
B.Tech Computer Science Engineering  
College Project – JobScout

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📧 Support

For issues or questions, please open an issue on GitHub.

---

**⭐ Star this repo if you find it helpful!**
