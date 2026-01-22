'use client';

import { useState } from 'react';
import { Search, MapPin, Briefcase, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

interface FiltersProps {
  onFilterChange: (filters: FilterState) => void;
  isLoading?: boolean;
}

export interface FilterState {
  search: string;
  location: string;
  jobType: string;
  source: string;
}

const JOB_TYPES = [
  'All Types',
  'Full-time',
  'Part-time',
  'Contract',
  'Internship',
  'Temporary',
  'Freelance',
];

const SOURCES = ['All Sources', 'Adzuna', 'JSearch', 'Jooble', 'Web Scraping'];

export default function Filters({ onFilterChange, isLoading }: FiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    location: '',
    jobType: '',
    source: '',
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const newFilters = {
      ...filters,
      [name]: value === 'All Types' || value === 'All Sources' ? '' : value,
    };
    setFilters(newFilters);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange(filters);
  };

  const handleReset = () => {
    const resetFilters = {
      search: '',
      location: '',
      jobType: '',
      source: '',
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  return (
    <Card className="backdrop-blur-md bg-white/90 dark:bg-slate-900/90 border-white/20 dark:border-slate-700/50 shadow-xl mb-8">
      <CardContent className="p-8">
        <div className="flex items-center gap-2 mb-6">
          <Filter className="w-5 h-5 text-purple-600" />
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            Filter Jobs
          </h2>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search Input */}
            <div className="relative">
              <label htmlFor="search" className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                Search Keywords
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  id="search"
                  name="search"
                  value={filters.search}
                  onChange={handleInputChange}
                  placeholder="Job title, skills, keywords..."
                  className="pl-10"
                />
              </div>
            </div>

            {/* Location Input */}
            <div className="relative">
              <label htmlFor="location" className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  id="location"
                  name="location"
                  value={filters.location}
                  onChange={handleInputChange}
                  placeholder="City, state, country..."
                  className="pl-10"
                />
              </div>
            </div>

          {/* Job Type Select */}
          <div>
            <label htmlFor="jobType" className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
              Job Type
            </label>
            <select
              id="jobType"
              name="jobType"
              value={filters.jobType || 'All Types'}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 transition-colors"
            >
              {JOB_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Source Select */}
          <div>
            <label htmlFor="source" className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
              Source
            </label>
            <select
              id="source"
              name="source"
              value={filters.source || 'All Sources'}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 transition-colors"
            >
              {SOURCES.map((source) => (
                <option key={source} value={source}>
                  {source}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <Button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg text-base py-5"
          >
            {isLoading ? 'Searching...' : 'Apply Filters'}
          </Button>
          <Button
            type="button"
            onClick={handleReset}
            disabled={isLoading}
            variant="outline"
            className="px-8"
          >
            Reset
          </Button>
        </div>
      </form>
      </CardContent>
    </Card>
  );
}
