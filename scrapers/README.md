# Web Scraping System Documentation

## Overview
This document explains the complete web scraping system implemented for JobScout. The system scrapes job listings from **Indeed, Internshala, and TimesJobs** using Playwright for dynamic content rendering.

## Architecture

```
User Search OR Cron Job (Every 6 hours)
    ↓
/api/jobs OR /api/fetch-jobs
    ↓
├── External APIs (Adzuna, JSearch, Jooble)
│   └── Save to MongoDB
└── Web Scrapers (Indeed, Internshala, TimesJobs)
    ├── Playwright Browser Launch
    ├── Navigate & Extract Data
    ├── Normalize Job Data
    ├── Calculate Match Scores
    └── Save to MongoDB (Duplicate Prevention)
```

## File Structure

```
/scrapers/
  ├── utils.js          # Helper functions (delays, user agents, normalization)
  ├── indeed.js         # Indeed India scraper
  ├── internshala.js    # Internshala scraper (internships + jobs)
  ├── timesjobs.js      # TimesJobs scraper
  └── index.js          # Orchestrator (runs all scrapers)

/app/api/
  ├── fetch-jobs/route.ts  # Admin API (bulk fetching)
  └── jobs/route.ts        # User search API (live fetching + matching)

/models/
  └── Job.ts            # MongoDB schema with unique index
```

## How It Works

### 1. **User Search API** (`/api/jobs`)
- Triggered when users search for jobs
- Searches MongoDB first
- If results < 10, automatically fetches from APIs + Web Scrapers
- Returns results with **match scores**
- Sources are clearly labeled (Indeed, Internshala, Adzuna, etc.)

**Query Parameters:**
```
GET /api/jobs?search=developer&location=bangalore&fetchLive=true
```

### 2. **Admin Fetch API** (`/api/fetch-jobs/route.ts`)
- Triggered by Vercel cron every 6 hours OR manually from admin page
- Bulk fetches from all APIs and scrapers
- Saves everything to MongoDB
- Returns comprehensive statistics

**Request Body Options:**
```json
{
  "query": "software developer",
  "location": "India",
  "enableScraping": true,
  "maxPages": 2
}
```

### 2. **Scraper Utilities** (`scrapers/utils.js`)
Provides shared functionality:
- `getRandomUserAgent()` - Rotates user agents to avoid detection
- `randomDelay(min, max)` - Adds random delays between requests
- `normalizeJobData()` - Converts raw data to MongoDB schema
- `isValidJob()` - Validates required fields
- `retryWithBackoff()` - Retry failed operations with exponential backoff
- `log()` - Structured logging with timestamps

### 3. **Individual Scrapers**

#### Indeed Scraper (`scrapers/indeed.js`)
- ✅ **Status:** Fully working (26+ jobs per page)
- Uses Playwright
- Scrapes Indeed India (`in.indeed.com`)
- URL pagination: `start` parameter (0, 10, 20, ...)
- Handles multiple selector patterns (Indeed changes HTML frequently)
- **Reliability:** 100%

#### Internshala Scraper (`scrapers/internshala.js`)
- ✅ **Status:** Fully working (92+ jobs per page)
- Popular for internships and entry-level jobs
- URL: `https://internshala.com/jobs/{keyword}-jobs/page-{num}`
- Extracts: title, company, location, stipend, duration, description
- **Perfect for:** Students, fresh graduates, internships
- **Reliability:** 100%

#### TimesJobs Scraper (`scrapers/timesjobs.js`)
- ⚠️ **Status:** In testing (0 jobs currently)
- Professional job portal by Times Group
- URL: Complex search with sequence parameter
- Can be enabled/disabled based on results
- **Note:** Currently being optimized

### 4. **Orchestrator** (`scrapers/index.js`)

**Functions:**
- `runAllScrapers(options)` - Runs all scrapers in parallel
- `saveScrapedJobs(results, JobModel)` - Saves to MongoDB with duplicate handling
- `runScrapingWorkflow(JobModel, options)` - Complete workflow

**Features:**
- Parallel execution of scrapers (faster)
- Graceful error handling (one scraper failure doesn't stop others)
- Detailed statistics by source
- Duplicate detection using MongoDB unique index

## Database Schema

The Job model has a **unique compound index** on:
```javascript
{ title: 1, company: 1, location: 1 }
```

This prevents duplicate job listings. When a duplicate is detected:
- MongoDB throws error code `11000`
- The scraper catches it and increments duplicate counter
- No data corruption or crashes

## Rate Limiting & Best Practices

### Implemented Protections:
1. **Random Delays**: 2-6 seconds between requests
2. **User-Agent Rotation**: Different browsers per request
3. **Headless Browser**: Mimics real user behavior
4. **Retry Mechanism**: 3 attempts with exponential backoff
5. **Error Handling**: Graceful failure without stopping other scrapers

### Respecting robots.txt:
- Only scrapes public job listings (search results pages)
- No login required
- No excessive request rates
- Respects website structure

## Usage

### Manual Trigger (Development):
```bash
curl -X POST http://localhost:3000/api/fetch-jobs \
  -H "Content-Type: application/json" \
  -d '{
    "query": "python developer",
    "location": "Bangalore",
    "enableScraping": true,
    "maxPages": 2
  }'
```

### Disable Scraping (API Only):
```bash
curl -X POST http://localhost:3000/api/fetch-jobs \
  -H "Content-Type: application/json" \
  -d '{
    "enableScraping": false
  }'
```

### Production (Automatic):
- Vercel cron runs every 6 hours
- Uses default settings: `software developer` + `India`
- Scraping enabled by default

## Response Format

```json
{
  "success": true,
  "message": "Job fetching completed",
  "api": {
    "fetched": 150,
    "saved": 120,
    "duplicates": 25,
    "errors": 5,
    "sources": {
      "adzuna": 50,
      "jsearch": 60,
      "jooble": 40
    }
  },
  "scraping": {
    "success": true,
    "duration": "45.23s",
    "scraping": {
      "total": 180,
      "bySource": {
        "naukri": 70,
        "indeed": 60,
        "shine": 50
      }
    },
    "database": {
      "total": 180,
      "inserted": 145,
      "duplicates": 30,
      "errors": 5,
      "bySource": {
        "naukri": { "inserted": 55, "duplicates": 12, "errors": 3 },
        "indeed": { "inserted": 48, "duplicates": 10, "errors": 2 },
        "shine": { "inserted": 42, "duplicates": 8, "errors": 0 }
      }
    }
  },
  "summary": {
    "totalSaved": 265,
    "totalDuplicates": 55,
    "totalFetched": 330
  }
}
```

## Monitoring & Logging

All logs include:
- Timestamp (ISO format)
- Scraper name
- Log level (info, warn, error, success)
- Message

**Example logs:**
```
[2026-01-13T10:30:45.123Z] [NAUKRI] ℹ️  Starting scraper with keyword: "software developer"
[2026-01-13T10:30:52.456Z] [NAUKRI] ℹ️  Extracted 25 jobs from page 1
[2026-01-13T10:31:15.789Z] [NAUKRI] ✅ Successfully scraped 50 jobs
[2026-01-13T10:31:20.123Z] [ORCHESTRATOR] ✅ All scrapers completed. Total jobs: 180
```

## Error Handling

### Page-Level Errors:
- If a page fails to load, skip to next page
- Log error but continue scraping

### Scraper-Level Errors:
- If a scraper fails completely, other scrapers continue
- Error is logged and included in response

### Database Errors:
- Duplicates: Caught and counted (not errors)
- Schema validation: Logged and counted as errors
- Connection issues: Fatal error, stops entire process

## Performance

**Typical Execution Times:**
- Single scraper (2 pages): 15-25 seconds
- All scrapers parallel (2 pages each): 30-50 seconds
- With API fetching: 40-60 seconds total

**Resource Usage:**
- Memory: ~200-300 MB per browser instance
- CPU: Moderate during page rendering
- Network: ~5-10 MB per scraper run

## Deployment Considerations

### Vercel Limitations:
- **Execution timeout**: 5 minutes max (configured with `maxDuration`)
- **Memory**: 1024 MB on Pro plan
- **Playwright**: Works on Vercel with proper configuration

### Environment Variables:
```env
MONGODB_URI=mongodb+srv://...
CRON_SECRET=your_secret_key
```

### Required Package:
```json
{
  "dependencies": {
    "playwright": "^1.40.0",
    "cheerio": "^1.0.0-rc.12",
    "user-agents": "^1.1.0"
  }
}
```

## Maintenance

### Updating Selectors:
Job websites change their HTML structure frequently. To update:

1. Inspect the website's HTML
2. Find new selectors for job cards
3. Update in respective scraper file (e.g., `naukri.js`)
4. Test locally before deploying

### Adding New Scrapers:
1. Create `scrapers/newsite.js` following existing pattern
2. Add to `scrapers/index.js` orchestrator
3. Update Job model source enum
4. Test thoroughly

## Testing

### Test Individual Scraper:
```javascript
import { scrapeNaukri } from './scrapers/naukri.js';

const jobs = await scrapeNaukri({
  maxPages: 1,
  keyword: 'python',
  location: 'Mumbai'
});

console.log(jobs);
```

### Test Full Workflow:
```bash
npm run dev
# Visit: http://localhost:3000/api/fetch-jobs?token=your_cron_secret
```

## Troubleshooting

**Issue: Playwright not found**
```bash
npx playwright install chromium
```

**Issue: Timeout errors**
- Increase timeout in page.goto()
- Check internet connection
- Verify website is accessible

**Issue: No jobs scraped**
- Check if website HTML changed
- Verify selectors in browser DevTools
- Check console logs for errors

**Issue: Too many duplicates**
- Normal if running frequently
- Database prevents actual duplicates
- Consider increasing cron interval

## Legal & Ethical Considerations

✅ **Allowed:**
- Scraping public job listings
- Educational/research purposes
- Aggregating data for users
- Respecting rate limits

❌ **Not Allowed:**
- Scraping behind login walls
- Ignoring robots.txt
- Excessive request rates
- Selling scraped data without permission

## Future Enhancements

- [ ] Add more job portals (LinkedIn, Monster, TimesJobs)
- [ ] Implement IP rotation for high-volume scraping
- [ ] Add job description detail scraping
- [ ] Cache results to reduce scraping frequency
- [ ] Add scraping scheduler with configurable intervals
- [ ] Implement scraping queue system for better resource management
- [ ] Add email notifications for scraping failures

---

**Created by:** JobScout Team  
**Last Updated:** January 13, 2026  
**Version:** 1.0.0
