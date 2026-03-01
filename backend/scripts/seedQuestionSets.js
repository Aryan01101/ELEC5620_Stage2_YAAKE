/* eslint-disable no-console */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const db = require('../services/db.service');
const InterviewQuestionSet = require('../models/interviewQuestionSetModel');
const User = require('../models/userModel');

const questionSetTemplates = [
  {
    jobTitle: 'Software Engineer',
    companyName: 'Atlassian',
    jobDescription: 'Join Atlassian to design, build, and maintain product services on Atlassian Cloud.',
    requiredSkills: ['Java', 'Kotlin', 'React', 'TypeScript', 'AWS', 'Distributed Systems'],
    experienceLevel: 'mid-level',
    visibility: 'company_template',
    questions: [
      {
        questionText: 'Can you explain how you would design a scalable notification system for a product like Jira?',
        category: 'technical',
        suggestedAnswer: 'A strong answer would discuss message queuing, event-driven architecture, scalability considerations, and fault tolerance.',
        evaluationCriteria: ['Mentions distributed systems concepts', 'Considers scalability', 'Discusses fault tolerance', 'Explains trade-offs'],
        isCustom: false
      },
      {
        questionText: 'Tell me about a time when you had to optimize a slow-performing feature. What was your approach?',
        category: 'behavioral',
        suggestedAnswer: 'Look for structured problem-solving approach, use of profiling tools, data-driven decisions, and measurable improvements.',
        evaluationCriteria: ['Describes systematic approach', 'Uses metrics', 'Explains optimization techniques', 'Mentions impact'],
        isCustom: false
      },
      {
        questionText: 'How would you implement real-time collaboration features similar to Google Docs?',
        category: 'problem-solving',
        suggestedAnswer: 'Strong candidates will mention operational transformation, CRDTs, WebSockets, conflict resolution, and consistency models.',
        evaluationCriteria: ['Understands real-time systems', 'Mentions conflict resolution', 'Discusses data consistency', 'Considers user experience'],
        isCustom: false
      },
      {
        questionText: 'What does "Don\'t #@!% the customer" mean to you in the context of software engineering?',
        category: 'culture-fit',
        suggestedAnswer: 'Should reflect understanding of customer-first values, quality, reliability, and ethical considerations in product decisions.',
        evaluationCriteria: ['Shows customer empathy', 'Values quality', 'Discusses ethics', 'Aligns with company values'],
        isCustom: false
      }
    ]
  },
  {
    jobTitle: 'Frontend Engineer',
    companyName: 'Canva',
    jobDescription: 'Build scalable web applications using React and TypeScript for Canva\'s design platform.',
    requiredSkills: ['React', 'TypeScript', 'JavaScript', 'CSS', 'API Design'],
    experienceLevel: 'senior',
    visibility: 'company_template',
    questions: [
      {
        questionText: 'How would you optimize the rendering performance of a complex canvas-based design editor?',
        category: 'technical',
        suggestedAnswer: 'Discuss virtual DOM optimization, canvas rendering techniques, requestAnimationFrame, web workers, and memoization.',
        evaluationCriteria: ['Mentions performance techniques', 'Understands browser rendering', 'Discusses trade-offs', 'Shows deep knowledge'],
        isCustom: false
      },
      {
        questionText: 'Describe a situation where you had to balance technical debt with feature development.',
        category: 'behavioral',
        suggestedAnswer: 'Look for strategic thinking, stakeholder communication, risk assessment, and long-term vision.',
        evaluationCriteria: ['Shows strategic thinking', 'Balances priorities', 'Communicates effectively', 'Considers long-term impact'],
        isCustom: false
      },
      {
        questionText: 'Design a system for managing undo/redo functionality in a complex design editor.',
        category: 'problem-solving',
        suggestedAnswer: 'Should mention command pattern, state management, memory considerations, and handling complex operations.',
        evaluationCriteria: ['Uses design patterns', 'Handles edge cases', 'Considers performance', 'Explains thoroughly'],
        isCustom: false
      },
      {
        questionText: 'Canva\'s mission is to empower everyone to design. How does this resonate with you?',
        category: 'culture-fit',
        suggestedAnswer: 'Look for passion for democratizing design, inclusivity, user empowerment, and alignment with mission.',
        evaluationCriteria: ['Shows genuine interest', 'Values accessibility', 'Mission alignment', 'Demonstrates empathy'],
        isCustom: false
      }
    ]
  },
  {
    jobTitle: 'Graduate Software Engineer',
    companyName: 'Google',
    jobDescription: 'Entry-level software engineer role working on Google\'s products and infrastructure.',
    requiredSkills: ['Python', 'Java', 'C++', 'Data Structures', 'Algorithms'],
    experienceLevel: 'junior',
    visibility: 'public_sample',
    questions: [
      {
        questionText: 'Write a function to find the longest substring without repeating characters.',
        category: 'technical',
        suggestedAnswer: 'Should use sliding window approach with hash map, O(n) time complexity, handles edge cases.',
        evaluationCriteria: ['Correct algorithm', 'Optimal complexity', 'Handles edge cases', 'Clean code'],
        isCustom: false
      },
      {
        questionText: 'Tell me about a challenging academic project and how you overcame obstacles.',
        category: 'behavioral',
        suggestedAnswer: 'Look for problem-solving, perseverance, collaboration, and learning from challenges.',
        evaluationCriteria: ['Shows resilience', 'Problem-solving approach', 'Teamwork', 'Learning mindset'],
        isCustom: false
      },
      {
        questionText: 'How would you design a URL shortener like bit.ly?',
        category: 'problem-solving',
        suggestedAnswer: 'Should discuss hashing, database design, collision handling, scalability, and analytics.',
        evaluationCriteria: ['System design basics', 'Database knowledge', 'Scalability thinking', 'Complete solution'],
        isCustom: false
      },
      {
        questionText: 'What excites you about working on products that billions of people use daily?',
        category: 'culture-fit',
        suggestedAnswer: 'Look for genuine excitement about impact, innovation, learning, and making a difference at scale.',
        evaluationCriteria: ['Shows enthusiasm', 'Values impact', 'Growth mindset', 'Aligns with values'],
        isCustom: false
      }
    ]
  },
  {
    jobTitle: 'Data Platform Engineer',
    companyName: 'Canva',
    jobDescription: 'Build scalable data infrastructure powering insights for millions of users.',
    requiredSkills: ['Python', 'SQL', 'Distributed Systems', 'ETL', 'AWS', 'Spark'],
    experienceLevel: 'mid-level',
    visibility: 'private',
    questions: [
      {
        questionText: 'Explain how you would design a real-time data pipeline that processes millions of events per second.',
        category: 'technical',
        suggestedAnswer: 'Should discuss Kafka/Kinesis, stream processing, partitioning strategies, fault tolerance, and monitoring.',
        evaluationCriteria: ['Understands streaming', 'Scalability focus', 'Fault tolerance', 'Monitoring considerations'],
        isCustom: false
      },
      {
        questionText: 'Describe a time when you had to debug a complex data quality issue in production.',
        category: 'behavioral',
        suggestedAnswer: 'Look for systematic debugging, data analysis skills, collaboration, and preventing future issues.',
        evaluationCriteria: ['Systematic approach', 'Data analysis skills', 'Collaboration', 'Prevention mindset'],
        isCustom: false
      },
      {
        questionText: 'How would you handle schema evolution in a large-scale data warehouse?',
        category: 'problem-solving',
        suggestedAnswer: 'Should discuss backward compatibility, versioning, migration strategies, and impact on downstream consumers.',
        evaluationCriteria: ['Understands schema design', 'Migration strategies', 'Considers dependencies', 'Risk management'],
        isCustom: false
      }
    ]
  },
  {
    jobTitle: 'Cyber Security Analyst',
    companyName: 'Commonwealth Bank',
    jobDescription: 'Monitor and respond to security threats and incidents for Australia\'s largest bank.',
    requiredSkills: ['Security Frameworks', 'Threat Detection', 'Incident Response', 'Python', 'SIEM'],
    experienceLevel: 'junior',
    visibility: 'private',
    questions: [
      {
        questionText: 'Explain the OWASP Top 10 and how you would prevent SQL injection attacks.',
        category: 'technical',
        suggestedAnswer: 'Should demonstrate knowledge of common vulnerabilities and use of parameterized queries, input validation, and ORMs.',
        evaluationCriteria: ['Security knowledge', 'Prevention techniques', 'Best practices', 'Comprehensive answer'],
        isCustom: false
      },
      {
        questionText: 'Tell me about a time you identified a security vulnerability. What steps did you take?',
        category: 'behavioral',
        suggestedAnswer: 'Look for responsible disclosure, systematic approach, communication, and follow-through.',
        evaluationCriteria: ['Responsible disclosure', 'Systematic approach', 'Communication', 'Follow-through'],
        isCustom: false
      },
      {
        questionText: 'How would you respond to a suspected data breach involving customer information?',
        category: 'problem-solving',
        suggestedAnswer: 'Should cover incident response procedures, containment, investigation, notification, and remediation.',
        evaluationCriteria: ['Incident response knowledge', 'Prioritization', 'Compliance awareness', 'Complete process'],
        isCustom: false
      }
    ]
  },
  {
    jobTitle: 'DevOps Engineer',
    companyName: 'Atlassian',
    jobDescription: 'Build and maintain cloud infrastructure and CI/CD pipelines for Atlassian Cloud.',
    requiredSkills: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD', 'Python'],
    experienceLevel: 'mid-level',
    visibility: 'company_template',
    questions: [
      {
        questionText: 'How would you implement blue-green deployment for a microservices architecture?',
        category: 'technical',
        suggestedAnswer: 'Discuss load balancer configuration, health checks, rollback strategies, and monitoring.',
        evaluationCriteria: ['Understands deployment patterns', 'Risk mitigation', 'Monitoring', 'Practical approach'],
        isCustom: false
      },
      {
        questionText: 'Describe a situation where you had to troubleshoot a production outage.',
        category: 'behavioral',
        suggestedAnswer: 'Look for calm under pressure, systematic troubleshooting, communication, and post-mortem learning.',
        evaluationCriteria: ['Stays calm', 'Systematic approach', 'Communication', 'Learning from incidents'],
        isCustom: false
      },
      {
        questionText: 'Design a monitoring and alerting strategy for a distributed system.',
        category: 'problem-solving',
        suggestedAnswer: 'Should cover metrics, logging, tracing, alert thresholds, on-call procedures, and reducing alert fatigue.',
        evaluationCriteria: ['Comprehensive monitoring', 'Alert design', 'Observability', 'Practical considerations'],
        isCustom: false
      }
    ]
  },
  {
    jobTitle: 'Graduate Consultant',
    companyName: 'Accenture',
    jobDescription: 'Join Accenture\'s graduate program to work on strategy and consulting engagements.',
    requiredSkills: ['Problem Solving', 'Communication', 'Analysis', 'Python', 'Excel'],
    experienceLevel: 'junior',
    visibility: 'public_sample',
    questions: [
      {
        questionText: 'Estimate how many coffee shops there are in Sydney.',
        category: 'problem-solving',
        suggestedAnswer: 'Look for structured approach, reasonable assumptions, clear calculations, and sanity checking.',
        evaluationCriteria: ['Structured thinking', 'Reasonable assumptions', 'Clear logic', 'Sanity checks'],
        isCustom: false
      },
      {
        questionText: 'Tell me about a time you had to analyze complex data to make a recommendation.',
        category: 'behavioral',
        suggestedAnswer: 'Look for analytical skills, data-driven decision making, clear communication, and business impact.',
        evaluationCriteria: ['Analytical thinking', 'Data analysis', 'Communication', 'Business acumen'],
        isCustom: false
      },
      {
        questionText: 'How would you help a retail client improve their customer experience?',
        category: 'problem-solving',
        suggestedAnswer: 'Should show framework thinking, customer understanding, data analysis, and actionable recommendations.',
        evaluationCriteria: ['Framework approach', 'Customer focus', 'Actionable ideas', 'Business understanding'],
        isCustom: false
      },
      {
        questionText: 'Why consulting, and why Accenture specifically?',
        category: 'culture-fit',
        suggestedAnswer: 'Look for genuine interest in consulting, knowledge of Accenture, career goals, and value alignment.',
        evaluationCriteria: ['Genuine interest', 'Company knowledge', 'Career clarity', 'Value alignment'],
        isCustom: false
      }
    ]
  },
  {
    jobTitle: 'Full Stack Developer',
    companyName: 'Capgemini Australia',
    jobDescription: 'Develop full stack solutions for enterprise clients across various industries.',
    requiredSkills: ['React', 'Node.js', 'MongoDB', 'SQL', 'REST APIs', 'Cloud'],
    experienceLevel: 'mid-level',
    visibility: 'private',
    questions: [
      {
        questionText: 'How would you design a RESTful API for an e-commerce platform?',
        category: 'technical',
        suggestedAnswer: 'Should cover resource design, HTTP methods, authentication, versioning, error handling, and documentation.',
        evaluationCriteria: ['REST principles', 'API design best practices', 'Security', 'Documentation'],
        isCustom: false
      },
      {
        questionText: 'Tell me about a project where you had to work with difficult stakeholders.',
        category: 'behavioral',
        suggestedAnswer: 'Look for communication skills, empathy, conflict resolution, and achieving positive outcomes.',
        evaluationCriteria: ['Communication skills', 'Stakeholder management', 'Conflict resolution', 'Positive outcome'],
        isCustom: false
      },
      {
        questionText: 'Design a system for handling file uploads and processing for millions of users.',
        category: 'problem-solving',
        suggestedAnswer: 'Should discuss cloud storage, asynchronous processing, queuing, security, and scalability.',
        evaluationCriteria: ['Scalable design', 'Security considerations', 'Async processing', 'Complete solution'],
        isCustom: false
      }
    ]
  },
  {
    jobTitle: 'Mobile Engineer',
    companyName: 'Atlassian',
    jobDescription: 'Build mobile applications for Jira and Confluence on iOS and Android.',
    requiredSkills: ['React Native', 'Swift', 'Kotlin', 'Mobile Architecture', 'REST APIs'],
    experienceLevel: 'senior',
    visibility: 'company_template',
    questions: [
      {
        questionText: 'How do you handle offline functionality in mobile apps with data synchronization?',
        category: 'technical',
        suggestedAnswer: 'Should discuss local storage, conflict resolution, sync strategies, and handling network transitions.',
        evaluationCriteria: ['Offline-first design', 'Sync strategies', 'Conflict handling', 'User experience'],
        isCustom: false
      },
      {
        questionText: 'Describe how you approach mobile app performance optimization.',
        category: 'behavioral',
        suggestedAnswer: 'Look for systematic approach, profiling tools, specific optimizations, and measurable results.',
        evaluationCriteria: ['Systematic approach', 'Uses profiling', 'Specific techniques', 'Measures impact'],
        isCustom: false
      },
      {
        questionText: 'Design the architecture for a real-time chat feature in a mobile app.',
        category: 'problem-solving',
        suggestedAnswer: 'Should cover WebSockets, push notifications, message queuing, persistence, and battery optimization.',
        evaluationCriteria: ['Real-time tech', 'Mobile constraints', 'Battery awareness', 'Scalable design'],
        isCustom: false
      }
    ]
  },
  {
    jobTitle: 'Machine Learning Engineer',
    companyName: 'Google',
    jobDescription: 'Develop and deploy ML models for Google products at scale.',
    requiredSkills: ['Python', 'TensorFlow', 'PyTorch', 'ML Algorithms', 'Data Engineering', 'Cloud'],
    experienceLevel: 'senior',
    visibility: 'private',
    questions: [
      {
        questionText: 'Explain how you would deploy a machine learning model to production at scale.',
        category: 'technical',
        suggestedAnswer: 'Should discuss model serving, A/B testing, monitoring, versioning, and handling model drift.',
        evaluationCriteria: ['Production ML knowledge', 'Monitoring', 'MLOps practices', 'Scale considerations'],
        isCustom: false
      },
      {
        questionText: 'Tell me about a time when your ML model performed poorly in production. How did you handle it?',
        category: 'behavioral',
        suggestedAnswer: 'Look for debugging skills, data analysis, model improvement, and learning from failure.',
        evaluationCriteria: ['Problem diagnosis', 'Data analysis', 'Model improvement', 'Learning mindset'],
        isCustom: false
      },
      {
        questionText: 'Design a recommendation system for YouTube videos.',
        category: 'problem-solving',
        suggestedAnswer: 'Should discuss collaborative filtering, content-based filtering, cold start, real-time updates, and evaluation metrics.',
        evaluationCriteria: ['ML system design', 'Algorithm choice', 'Scale considerations', 'Evaluation strategy'],
        isCustom: false
      }
    ]
  }
];

async function seedQuestionSets() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await db.connect();

    console.log('🔍 Finding recruiters...');
    const recruiters = await User.find({ role: 'recruiter' });

    if (recruiters.length === 0) {
      console.error('⚠️  No recruiters found! Please run seedRecruiters.js first.');
      process.exit(1);
    }

    console.log(`✅ Found ${recruiters.length} recruiter(s)`);

    // Create a mapping of company names to recruiter IDs
    const companyToRecruiter = {};
    recruiters.forEach(recruiter => {
      if (!companyToRecruiter[recruiter.companyName]) {
        companyToRecruiter[recruiter.companyName] = [];
      }
      companyToRecruiter[recruiter.companyName].push(recruiter);
    });

    console.log('🗑️  Clearing existing question sets...');
    const deleteResult = await InterviewQuestionSet.deleteMany({});
    console.log(`   Deleted ${deleteResult.deletedCount} existing question set(s)`);

    console.log('📝 Creating interview question sets...');
    const questionSets = questionSetTemplates.map(template => {
      const companyRecruiters = companyToRecruiter[template.companyName];
      let recruiterId;

      if (companyRecruiters && companyRecruiters.length > 0) {
        // Pick a random recruiter from the company
        recruiterId = companyRecruiters[Math.floor(Math.random() * companyRecruiters.length)]._id;
      } else {
        // Fallback to first recruiter
        console.warn(`   ⚠️  No recruiter found for ${template.companyName}, using fallback`);
        recruiterId = recruiters[0]._id;
      }

      return {
        ...template,
        recruiterId,
        aiGenerationMetadata: {
          model: 'gpt-4',
          generatedAt: new Date(),
          promptVersion: 'v1.0'
        },
        usageCount: Math.floor(Math.random() * 10), // Random usage count for realism
        lastUsedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random date within last 30 days
      };
    });

    const insertedQuestionSets = await InterviewQuestionSet.insertMany(questionSets);
    console.log(`✅ Successfully created ${insertedQuestionSets.length} question sets`);

    console.log('\n📊 Summary by Company:');
    const companyCounts = {};
    insertedQuestionSets.forEach(set => {
      companyCounts[set.companyName] = (companyCounts[set.companyName] || 0) + 1;
    });

    Object.entries(companyCounts).forEach(([company, count]) => {
      console.log(`   ${company}: ${count} question set(s)`);
    });

    console.log('\n📊 Summary by Experience Level:');
    const levelCounts = {};
    insertedQuestionSets.forEach(set => {
      levelCounts[set.experienceLevel] = (levelCounts[set.experienceLevel] || 0) + 1;
    });

    Object.entries(levelCounts).forEach(([level, count]) => {
      console.log(`   ${level}: ${count} question set(s)`);
    });

    console.log('\n📊 Summary by Visibility:');
    const visibilityCounts = {};
    insertedQuestionSets.forEach(set => {
      visibilityCounts[set.visibility] = (visibilityCounts[set.visibility] || 0) + 1;
    });

    Object.entries(visibilityCounts).forEach(([visibility, count]) => {
      console.log(`   ${visibility}: ${count} question set(s)`);
    });

    console.log('\n✨ Question sets seeding complete!');

    return insertedQuestionSets;
  } catch (error) {
    console.error('❌ Error seeding question sets:', error);
    process.exit(1);
  } finally {
    await db.disconnect();
    process.exit(0);
  }
}

// Run if executed directly
if (require.main === module) {
  seedQuestionSets();
}

module.exports = seedQuestionSets;
