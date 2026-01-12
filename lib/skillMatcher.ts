import { expandSkillVariations, extractSkillsFromText } from './skillsDatabase';

export interface SkillMatchResult {
  matchScore: number; // Percentage 0-100
  matchedSkills: string[];
  missingSkills: string[];
  totalRequired: number;
  totalMatched: number;
}

/**
 * Calculate skill match score between user skills and job requirements
 * @param userSkills - Array of user's skills from resume
 * @param jobSkills - Array of skills required by the job
 * @returns Match score and detailed breakdown
 */
export function calculateSkillMatch(
  userSkills: string[],
  jobSkills: string[]
): SkillMatchResult {
  if (!jobSkills || jobSkills.length === 0) {
    return {
      matchScore: 0,
      matchedSkills: [],
      missingSkills: [],
      totalRequired: 0,
      totalMatched: 0,
    };
  }

  if (!userSkills || userSkills.length === 0) {
    return {
      matchScore: 0,
      matchedSkills: [],
      missingSkills: jobSkills,
      totalRequired: jobSkills.length,
      totalMatched: 0,
    };
  }

  // Normalize and expand skills for better matching
  const normalizedUserSkills = new Set(
    expandSkillVariations(userSkills).map(s => s.toLowerCase().trim())
  );
  
  const normalizedJobSkills = jobSkills.map(s => s.toLowerCase().trim());
  
  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  // Check each job skill against user skills
  jobSkills.forEach((jobSkill, index) => {
    const normalizedJobSkill = normalizedJobSkills[index];
    
    // Check if user has this skill (exact or variation match)
    const hasSkill = normalizedUserSkills.has(normalizedJobSkill);
    
    if (hasSkill) {
      matchedSkills.push(jobSkill);
    } else {
      missingSkills.push(jobSkill);
    }
  });

  const totalRequired = jobSkills.length;
  const totalMatched = matchedSkills.length;
  
  // Calculate match score (0-100%)
  const matchScore = Math.round((totalMatched / totalRequired) * 100);

  return {
    matchScore,
    matchedSkills,
    missingSkills,
    totalRequired,
    totalMatched,
  };
}

/**
 * Calculate match score from job description text
 * @param userSkills - Array of user's skills
 * @param jobDescription - Full job description text
 * @returns Match score percentage
 */
export function calculateMatchFromDescription(
  userSkills: string[],
  jobDescription: string
): number {
  // Extract skills from job description
  const jobSkills = extractSkillsFromText(jobDescription);
  
  // Calculate match
  const result = calculateSkillMatch(userSkills, jobSkills);
  
  return result.matchScore;
}

/**
 * Get match level based on score
 * @param score - Match score (0-100)
 * @returns Match level string
 */
export function getMatchLevel(score: number): string {
  if (score >= 80) return 'Excellent Match';
  if (score >= 60) return 'Good Match';
  if (score >= 40) return 'Fair Match';
  if (score >= 20) return 'Partial Match';
  return 'Low Match';
}

/**
 * Get match color based on score (for UI)
 * @param score - Match score (0-100)
 * @returns Tailwind color class
 */
export function getMatchColor(score: number): string {
  if (score >= 80) return 'green';
  if (score >= 60) return 'blue';
  if (score >= 40) return 'yellow';
  if (score >= 20) return 'orange';
  return 'red';
}
