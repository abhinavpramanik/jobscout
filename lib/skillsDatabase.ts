/**
 * Comprehensive Skills Database
 * Contains common technical skills, soft skills, and industry-specific skills
 */

export const TECHNICAL_SKILLS = [
  // Programming Languages
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Ruby', 'PHP', 'Go', 'Rust',
  'Swift', 'Kotlin', 'Scala', 'R', 'MATLAB', 'Perl', 'Dart', 'Objective-C', 'Shell', 'Bash',
  
  // Web Technologies
  'HTML', 'CSS', 'React', 'Angular', 'Vue.js', 'Next.js', 'Nuxt.js', 'Node.js', 'Express.js',
  'Svelte', 'jQuery', 'Bootstrap', 'Tailwind CSS', 'Material UI', 'Sass', 'Less', 'Webpack',
  'Vite', 'Redux', 'MobX', 'GraphQL', 'REST API', 'WebSockets', 'PWA',
  
  // Backend & Frameworks
  'Django', 'Flask', 'FastAPI', 'Spring Boot', 'Spring', 'ASP.NET', '.NET Core', 'Laravel',
  'Ruby on Rails', 'Express', 'NestJS', 'Gin', 'Echo', 'Fiber',
  
  // Databases
  'MongoDB', 'MySQL', 'PostgreSQL', 'SQLite', 'Oracle', 'SQL Server', 'Redis', 'Cassandra',
  'DynamoDB', 'Firebase', 'Firestore', 'Elasticsearch', 'Neo4j', 'MariaDB', 'CouchDB',
  
  // Cloud & DevOps
  'AWS', 'Azure', 'Google Cloud', 'GCP', 'Docker', 'Kubernetes', 'Jenkins', 'GitLab CI',
  'GitHub Actions', 'CircleCI', 'Terraform', 'Ansible', 'Chef', 'Puppet', 'CloudFormation',
  'Heroku', 'Netlify', 'Vercel', 'DigitalOcean', 'Linode',
  
  // Mobile Development
  'React Native', 'Flutter', 'iOS', 'Android', 'Xamarin', 'Ionic', 'Cordova', 'SwiftUI',
  
  // Data Science & ML
  'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'Keras', 'Scikit-learn',
  'Pandas', 'NumPy', 'Matplotlib', 'Seaborn', 'NLP', 'Computer Vision', 'Data Analysis',
  'Data Mining', 'Statistical Analysis', 'Big Data', 'Hadoop', 'Spark', 'Tableau', 'Power BI',
  
  // Testing
  'Jest', 'Mocha', 'Chai', 'Cypress', 'Selenium', 'Playwright', 'JUnit', 'PyTest', 'TestNG',
  'Unit Testing', 'Integration Testing', 'E2E Testing', 'TDD', 'BDD',
  
  // Version Control & Collaboration
  'Git', 'GitHub', 'GitLab', 'Bitbucket', 'SVN', 'Mercurial',
  
  // Other Technologies
  'Microservices', 'Serverless', 'API Development', 'WebRTC', 'Blockchain', 'Smart Contracts',
  'Solidity', 'Web3', 'CI/CD', 'Agile', 'Scrum', 'Linux', 'Unix', 'Windows Server',
  'Nginx', 'Apache', 'Socket.io', 'RabbitMQ', 'Kafka', 'gRPC', 'OAuth', 'JWT', 'SAML',
];

export const SOFT_SKILLS = [
  'Communication', 'Leadership', 'Teamwork', 'Problem Solving', 'Critical Thinking',
  'Time Management', 'Adaptability', 'Creativity', 'Collaboration', 'Attention to Detail',
  'Project Management', 'Analytical Skills', 'Decision Making', 'Conflict Resolution',
  'Emotional Intelligence', 'Negotiation', 'Presentation', 'Public Speaking', 'Mentoring',
  'Strategic Thinking', 'Innovation', 'Customer Service', 'Interpersonal Skills',
];

export const INDUSTRY_SKILLS = [
  // Business & Management
  'Business Analysis', 'Product Management', 'Project Management', 'Stakeholder Management',
  'Agile Methodologies', 'Waterfall', 'Six Sigma', 'Lean', 'PMP', 'SAFe', 'Kanban',
  
  // Design
  'UI/UX Design', 'Graphic Design', 'Figma', 'Adobe XD', 'Sketch', 'InVision', 'Photoshop',
  'Illustrator', 'After Effects', 'Wireframing', 'Prototyping', 'User Research',
  
  // Marketing & Sales
  'Digital Marketing', 'SEO', 'SEM', 'Content Marketing', 'Social Media Marketing',
  'Email Marketing', 'Google Analytics', 'Facebook Ads', 'Google Ads', 'Marketing Automation',
  
  // Finance & Accounting
  'Financial Analysis', 'Accounting', 'Bookkeeping', 'QuickBooks', 'SAP', 'Oracle Financials',
  'Financial Modeling', 'Excel', 'VBA', 'Financial Reporting',
  
  // HR & Recruitment
  'Recruitment', 'Talent Acquisition', 'HR Management', 'Employee Relations', 'Onboarding',
  'Performance Management', 'Compensation', 'Benefits Administration',
];

// Combine all skills
export const ALL_SKILLS = [
  ...TECHNICAL_SKILLS,
  ...SOFT_SKILLS,
  ...INDUSTRY_SKILLS,
];

// Normalize skills for better matching (lowercase without special chars)
export const NORMALIZED_SKILLS = ALL_SKILLS.map(skill => ({
  original: skill,
  normalized: skill.toLowerCase().replace(/[^a-z0-9\s]/g, ''),
}));

/**
 * Find matching skills from text
 * @param text - The text to search for skills
 * @returns Array of matched skills
 */
export function extractSkillsFromText(text: string): string[] {
  const normalizedText = text.toLowerCase();
  const foundSkills = new Set<string>();

  NORMALIZED_SKILLS.forEach(({ original, normalized }) => {
    // Check for exact match or word boundary match
    const regex = new RegExp(`\\b${normalized}\\b`, 'i');
    if (regex.test(normalizedText)) {
      foundSkills.add(original);
    }
  });

  return Array.from(foundSkills);
}

/**
 * Get skill variations for better matching
 */
export const SKILL_VARIATIONS: Record<string, string[]> = {
  'JavaScript': ['JS', 'Javascript', 'ECMAScript', 'ES6', 'ES2015'],
  'TypeScript': ['TS', 'Typescript'],
  'React': ['ReactJS', 'React.js'],
  'Node.js': ['Node', 'NodeJS', 'Node JS'],
  'MongoDB': ['Mongo', 'Mongo DB'],
  'PostgreSQL': ['Postgres', 'PSQL'],
  'AWS': ['Amazon Web Services', 'Amazon AWS'],
  'Azure': ['Microsoft Azure', 'MS Azure'],
  'Google Cloud': ['GCP', 'Google Cloud Platform'],
  'Machine Learning': ['ML'],
  'Deep Learning': ['DL'],
  'Natural Language Processing': ['NLP'],
  'UI/UX': ['UI', 'UX', 'User Interface', 'User Experience'],
  'API': ['REST', 'RESTful', 'Web Services'],
};

/**
 * Expand skills with variations
 */
export function expandSkillVariations(skills: string[]): string[] {
  const expanded = new Set(skills);
  
  skills.forEach(skill => {
    const variations = SKILL_VARIATIONS[skill];
    if (variations) {
      variations.forEach(v => expanded.add(v));
    }
    
    // Also check reverse lookup
    Object.entries(SKILL_VARIATIONS).forEach(([key, vars]) => {
      if (vars.some(v => v.toLowerCase() === skill.toLowerCase())) {
        expanded.add(key);
      }
    });
  });
  
  return Array.from(expanded);
}
