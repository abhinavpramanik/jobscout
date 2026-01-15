/**
 * Quick integration test
 * Tests the complete flow: User search → API fetch → Scraping → DB save
 */

async function testIntegration() {
  console.log('🧪 Testing Complete Integration\n');
  console.log('=' .repeat(60));

  // Test 1: Search with live fetching
  console.log('\n📋 Test 1: User Search with Live Fetching');
  console.log('-'.repeat(60));
  
  try {
    const searchResponse = await fetch(
      'http://localhost:3000/api/jobs?search=react&location=bangalore&fetchLive=true'
    );
    const searchData = await searchResponse.json();
    
    console.log('✅ Search API Response:');
    console.log(`   Total jobs: ${searchData.pagination?.total || 0}`);
    console.log(`   Live jobs fetched: ${searchData.meta?.liveJobsFetched || 0}`);
    console.log(`   Scraped jobs: ${searchData.meta?.scrapedJobsFetched || 0}`);
    console.log(`   Sources: ${searchData.meta?.sources?.join(', ') || 'N/A'}`);
    
    if (searchData.data && searchData.data.length > 0) {
      console.log('\n   Sample job:');
      const sample = searchData.data[0];
      console.log(`   - Title: ${sample.title}`);
      console.log(`   - Company: ${sample.company}`);
      console.log(`   - Source: ${sample.source}`);
      console.log(`   - Match Score: ${sample.matchScore || 'N/A'}`);
      console.log(`   - Location: ${sample.location}`);
    }
  } catch (error) {
    console.log('❌ Search test failed:', error.message);
  }

  // Test 2: Admin bulk fetch
  console.log('\n\n📋 Test 2: Admin Bulk Fetch');
  console.log('-'.repeat(60));
  
  try {
    const fetchResponse = await fetch('http://localhost:3000/api/fetch-jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: 'developer',
        location: 'India',
        enableScraping: true,
        maxPages: 1,
      }),
    });
    const fetchData = await fetchResponse.json();
    
    console.log('✅ Admin Fetch Response:');
    console.log(`   API jobs saved: ${fetchData.api?.saved || 0}`);
    console.log(`   API duplicates: ${fetchData.api?.duplicates || 0}`);
    console.log(`   Scraping total: ${fetchData.scraping?.scraping?.total || 0}`);
    console.log(`   Scraping sources: ${JSON.stringify(fetchData.scraping?.scraping?.bySource || {})}`);
    console.log(`   DB inserted: ${fetchData.scraping?.database?.inserted || 0}`);
    console.log(`   DB duplicates: ${fetchData.scraping?.database?.duplicates || 0}`);
  } catch (error) {
    console.log('❌ Admin fetch test failed:', error.message);
  }

  // Test 3: Check database sources
  console.log('\n\n📋 Test 3: Verify Database Sources');
  console.log('-'.repeat(60));
  
  try {
    const sourcesResponse = await fetch(
      'http://localhost:3000/api/jobs?limit=100'
    );
    const sourcesData = await sourcesResponse.json();
    
    // Count by source
    const sourceCounts = {};
    sourcesData.data?.forEach(job => {
      sourceCounts[job.source] = (sourceCounts[job.source] || 0) + 1;
    });
    
    console.log('✅ Jobs by Source:');
    Object.entries(sourceCounts).forEach(([source, count]) => {
      console.log(`   ${source}: ${count} jobs`);
    });
  } catch (error) {
    console.log('❌ Source check failed:', error.message);
  }

  console.log('\n' + '='.repeat(60));
  console.log('🎉 Integration test complete!\n');
}

// Run test
testIntegration().catch(console.error);
