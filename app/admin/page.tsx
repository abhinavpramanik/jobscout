'use client';

import { useState } from 'react';

export default function AdminPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [query, setQuery] = useState('software developer');
  const [location, setLocation] = useState('India');

  const handleFetchJobs = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/fetch-jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          location,
        }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        error: 'Failed to fetch jobs',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Admin Panel</h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Fetch Jobs from APIs</h2>
          <p className="text-gray-600 mb-6">
            Click the button below to fetch jobs from Adzuna, JSearch, and Jooble APIs.
          </p>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Query
            </label>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., software developer, data analyst"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="India">India</option>
              <option value="United States">United States</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="Canada">Canada</option>
              <option value="Australia">Australia</option>
              <option value="Singapore">Singapore</option>
              <option value="Germany">Germany</option>
              <option value="France">France</option>
            </select>
          </div>

          <button
            onClick={handleFetchJobs}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            {loading ? 'Fetching Jobs...' : 'Fetch Jobs from APIs'}
          </button>
        </div>

        {result && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4">Results:</h3>
            
            <div className="mb-4">
              <span className="font-medium">Status: </span>
              <span className={result.success ? 'text-green-600' : 'text-red-600'}>
                {result.success ? '✅ Success' : '❌ Failed'}
              </span>
            </div>

            {result.message && (
              <div className="mb-4">
                <span className="font-medium">Message: </span>
                <span>{result.message}</span>
              </div>
            )}

            {result.stats && (
              <div className="mb-4">
                <h4 className="font-medium mb-2">Statistics:</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>Fetched: {result.stats.fetched} jobs</li>
                  <li>Saved: {result.stats.saved} new jobs</li>
                  <li>Duplicates: {result.stats.duplicates}</li>
                  <li>Errors: {result.stats.errors}</li>
                </ul>
              </div>
            )}

            {result.sources && (
              <div>
                <h4 className="font-medium mb-2">Jobs per Source:</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  {Object.entries(result.sources).map(([source, count]) => (
                    <li key={source}>
                      {source}: {count as number} jobs
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.error && (
              <div className="text-red-600">
                <span className="font-medium">Error: </span>
                <span>{result.error}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
