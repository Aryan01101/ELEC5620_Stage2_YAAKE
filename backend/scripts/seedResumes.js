/* eslint-disable no-console */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const db = require('../services/db.service');
const Resume = require('../models/resumeModel');
const User = require('../models/userModel');

const resumeTemplates = [
  {
    title: 'Software Engineer - Full Stack',
    summary: 'Passionate full-stack developer with 3 years of experience building scalable web applications using React, Node.js, and cloud technologies. Strong problem-solver with a focus on clean code and user experience.',
    tags: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'AWS', 'Full Stack'],
    visibility: 'private',
    source: 'manual',
    sections: [
      {
        type: 'education',
        title: 'Education',
        entries: [
          {
            institution: 'University of Sydney',
            degree: 'Bachelor of Computer Science',
            startDate: '2018',
            endDate: '2021',
            gpa: '3.7/4.0',
            highlights: ['Dean\'s List', 'Software Engineering Prize']
          }
        ]
      },
      {
        type: 'experience',
        title: 'Work Experience',
        entries: [
          {
            company: 'TechStart Solutions',
            position: 'Full Stack Developer',
            startDate: 'Jan 2022',
            endDate: 'Present',
            location: 'Sydney, NSW',
            achievements: [
              'Developed and deployed 5+ full-stack web applications using MERN stack',
              'Improved application performance by 40% through code optimization',
              'Led migration of legacy systems to modern cloud infrastructure',
              'Mentored 2 junior developers in best practices and code review'
            ]
          },
          {
            company: 'Innovation Labs',
            position: 'Junior Developer',
            startDate: 'Jul 2021',
            endDate: 'Dec 2021',
            location: 'Sydney, NSW',
            achievements: [
              'Built responsive front-end components using React and TypeScript',
              'Collaborated with design team to implement pixel-perfect UIs',
              'Participated in agile ceremonies and code reviews'
            ]
          }
        ]
      },
      {
        type: 'skills',
        title: 'Technical Skills',
        categories: [
          { name: 'Frontend', skills: ['React', 'TypeScript', 'HTML5', 'CSS3', 'Tailwind CSS'] },
          { name: 'Backend', skills: ['Node.js', 'Express', 'Python', 'REST APIs'] },
          { name: 'Database', skills: ['MongoDB', 'PostgreSQL', 'Redis'] },
          { name: 'DevOps', skills: ['AWS', 'Docker', 'CI/CD', 'Git'] }
        ]
      }
    ]
  },
  {
    title: 'Data Engineer - Python & Cloud',
    summary: 'Results-driven data engineer with expertise in building ETL pipelines and data infrastructure. Experienced with Python, SQL, Spark, and AWS. Passionate about transforming data into actionable insights.',
    tags: ['Python', 'SQL', 'AWS', 'Spark', 'ETL', 'Data Engineering'],
    visibility: 'private',
    source: 'manual',
    sections: [
      {
        type: 'education',
        title: 'Education',
        entries: [
          {
            institution: 'UNSW Sydney',
            degree: 'Master of Data Science',
            startDate: '2020',
            endDate: '2022',
            gpa: '3.8/4.0'
          },
          {
            institution: 'University of Melbourne',
            degree: 'Bachelor of Computer Science',
            startDate: '2016',
            endDate: '2019',
            gpa: '3.6/4.0'
          }
        ]
      },
      {
        type: 'experience',
        title: 'Work Experience',
        entries: [
          {
            company: 'DataFlow Analytics',
            position: 'Data Engineer',
            startDate: 'Mar 2022',
            endDate: 'Present',
            location: 'Melbourne, VIC',
            achievements: [
              'Designed and implemented scalable ETL pipelines processing 10TB+ data daily',
              'Built real-time streaming data pipeline using Kafka and Spark',
              'Optimized data warehouse queries reducing query time by 60%',
              'Automated data quality checks improving data accuracy by 95%'
            ]
          }
        ]
      },
      {
        type: 'skills',
        title: 'Technical Skills',
        categories: [
          { name: 'Programming', skills: ['Python', 'SQL', 'Scala', 'Bash'] },
          { name: 'Data Tools', skills: ['Apache Spark', 'Kafka', 'Airflow', 'dbt'] },
          { name: 'Cloud', skills: ['AWS (S3, Redshift, EMR, Lambda)', 'Databricks'] },
          { name: 'Databases', skills: ['PostgreSQL', 'MongoDB', 'Snowflake'] }
        ]
      }
    ]
  },
  {
    title: 'Graduate Software Developer',
    summary: 'Recent computer science graduate with strong foundation in algorithms, data structures, and software development. Completed multiple internships and academic projects in web development and mobile apps.',
    tags: ['Graduate', 'Java', 'Python', 'React', 'Entry Level'],
    visibility: 'private',
    source: 'manual',
    sections: [
      {
        type: 'education',
        title: 'Education',
        entries: [
          {
            institution: 'Queensland University of Technology',
            degree: 'Bachelor of Information Technology',
            startDate: '2021',
            endDate: '2024',
            gpa: '3.5/4.0',
            highlights: ['Academic Excellence Award', 'Student Representative']
          }
        ]
      },
      {
        type: 'experience',
        title: 'Experience',
        entries: [
          {
            company: 'TechCorp',
            position: 'Software Engineering Intern',
            startDate: 'Nov 2023',
            endDate: 'Feb 2024',
            location: 'Brisbane, QLD',
            achievements: [
              'Developed features for customer portal using React and Spring Boot',
              'Wrote unit tests achieving 85% code coverage',
              'Participated in agile sprint planning and daily standups'
            ]
          }
        ]
      },
      {
        type: 'projects',
        title: 'Projects',
        entries: [
          {
            name: 'Task Management App',
            description: 'Full-stack web application with React frontend and Node.js backend',
            technologies: ['React', 'Node.js', 'MongoDB', 'Express'],
            highlights: ['User authentication', 'Real-time updates', 'Responsive design']
          },
          {
            name: 'Weather Prediction Model',
            description: 'Machine learning model using Python to predict weather patterns',
            technologies: ['Python', 'scikit-learn', 'pandas', 'Flask'],
            highlights: ['85% accuracy', 'REST API deployment']
          }
        ]
      },
      {
        type: 'skills',
        title: 'Technical Skills',
        categories: [
          { name: 'Languages', skills: ['Java', 'Python', 'JavaScript', 'C++'] },
          { name: 'Frameworks', skills: ['React', 'Spring Boot', 'Node.js'] },
          { name: 'Tools', skills: ['Git', 'Docker', 'Postman', 'Jira'] }
        ]
      }
    ]
  },
  {
    title: 'Frontend Developer - React Specialist',
    summary: 'Creative frontend developer specializing in React and modern JavaScript. 4 years of experience crafting beautiful, performant user interfaces. Strong eye for design and user experience.',
    tags: ['React', 'TypeScript', 'Frontend', 'UI/UX', 'JavaScript'],
    visibility: 'private',
    source: 'manual',
    sections: [
      {
        type: 'education',
        title: 'Education',
        entries: [
          {
            institution: 'Monash University',
            degree: 'Bachelor of Software Engineering',
            startDate: '2016',
            endDate: '2019',
            gpa: '3.4/4.0'
          }
        ]
      },
      {
        type: 'experience',
        title: 'Work Experience',
        entries: [
          {
            company: 'DesignTech Studios',
            position: 'Senior Frontend Developer',
            startDate: 'Jun 2021',
            endDate: 'Present',
            location: 'Melbourne, VIC',
            achievements: [
              'Led frontend architecture for e-commerce platform serving 1M+ users',
              'Improved page load time by 50% through code splitting and lazy loading',
              'Implemented comprehensive component library with Storybook',
              'Mentored team of 3 junior frontend developers'
            ]
          },
          {
            company: 'WebFlow Agency',
            position: 'Frontend Developer',
            startDate: 'Jan 2020',
            endDate: 'May 2021',
            location: 'Melbourne, VIC',
            achievements: [
              'Built 10+ responsive websites using React and Next.js',
              'Collaborated with designers to implement pixel-perfect interfaces',
              'Optimized SEO achieving top 3 Google rankings for clients'
            ]
          }
        ]
      },
      {
        type: 'skills',
        title: 'Technical Skills',
        categories: [
          { name: 'Frontend', skills: ['React', 'TypeScript', 'Next.js', 'Vue.js'] },
          { name: 'Styling', skills: ['CSS3', 'Tailwind CSS', 'styled-components', 'SASS'] },
          { name: 'Testing', skills: ['Jest', 'React Testing Library', 'Cypress'] },
          { name: 'Tools', skills: ['Webpack', 'Vite', 'Storybook', 'Figma'] }
        ]
      }
    ]
  },
  {
    title: 'DevOps Engineer - Cloud & Automation',
    summary: 'DevOps engineer with 5 years of experience automating infrastructure and building CI/CD pipelines. Expert in AWS, Docker, Kubernetes, and Infrastructure as Code. Passionate about reliability and efficiency.',
    tags: ['DevOps', 'AWS', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD'],
    visibility: 'private',
    source: 'manual',
    sections: [
      {
        type: 'education',
        title: 'Education',
        entries: [
          {
            institution: 'University of Adelaide',
            degree: 'Bachelor of Computer Engineering',
            startDate: '2014',
            endDate: '2017',
            gpa: '3.6/4.0'
          }
        ]
      },
      {
        type: 'experience',
        title: 'Work Experience',
        entries: [
          {
            company: 'CloudOps Solutions',
            position: 'Senior DevOps Engineer',
            startDate: 'Mar 2020',
            endDate: 'Present',
            location: 'Adelaide, SA',
            achievements: [
              'Architected and deployed microservices infrastructure on AWS EKS',
              'Reduced deployment time by 80% through CI/CD automation',
              'Implemented Infrastructure as Code using Terraform managing 200+ resources',
              'Achieved 99.95% uptime through monitoring and incident response'
            ]
          },
          {
            company: 'TechOps Inc',
            position: 'DevOps Engineer',
            startDate: 'Jul 2017',
            endDate: 'Feb 2020',
            location: 'Adelaide, SA',
            achievements: [
              'Containerized 15+ applications using Docker',
              'Built Jenkins CI/CD pipelines for automated testing and deployment',
              'Managed AWS infrastructure including EC2, RDS, S3, and CloudFront'
            ]
          }
        ]
      },
      {
        type: 'certifications',
        title: 'Certifications',
        entries: [
          'AWS Certified Solutions Architect - Professional',
          'Certified Kubernetes Administrator (CKA)',
          'HashiCorp Certified: Terraform Associate'
        ]
      },
      {
        type: 'skills',
        title: 'Technical Skills',
        categories: [
          { name: 'Cloud', skills: ['AWS', 'Azure', 'GCP'] },
          { name: 'Containers', skills: ['Docker', 'Kubernetes', 'Helm', 'EKS'] },
          { name: 'IaC', skills: ['Terraform', 'CloudFormation', 'Ansible'] },
          { name: 'CI/CD', skills: ['Jenkins', 'GitLab CI', 'GitHub Actions', 'ArgoCD'] },
          { name: 'Monitoring', skills: ['Prometheus', 'Grafana', 'ELK Stack', 'Datadog'] }
        ]
      }
    ]
  },
  {
    title: 'Backend Developer - Python & Microservices',
    summary: 'Backend developer with expertise in Python, microservices architecture, and distributed systems. 4 years of experience building scalable APIs and services. Strong focus on performance and reliability.',
    tags: ['Python', 'Backend', 'Microservices', 'APIs', 'Distributed Systems'],
    visibility: 'private',
    source: 'manual',
    sections: [
      {
        type: 'education',
        title: 'Education',
        entries: [
          {
            institution: 'University of Technology Sydney',
            degree: 'Bachelor of Computer Science',
            startDate: '2016',
            endDate: '2019',
            gpa: '3.7/4.0'
          }
        ]
      },
      {
        type: 'experience',
        title: 'Work Experience',
        entries: [
          {
            company: 'Microservices Co',
            position: 'Senior Backend Engineer',
            startDate: 'Jan 2021',
            endDate: 'Present',
            location: 'Sydney, NSW',
            achievements: [
              'Designed and implemented 10+ microservices using Python and FastAPI',
              'Built event-driven architecture using RabbitMQ and Redis',
              'Optimized database queries reducing response time by 70%',
              'Implemented distributed tracing and monitoring for microservices'
            ]
          },
          {
            company: 'API Solutions',
            position: 'Backend Developer',
            startDate: 'Jul 2019',
            endDate: 'Dec 2020',
            location: 'Sydney, NSW',
            achievements: [
              'Developed RESTful APIs serving 1M+ requests daily',
              'Implemented authentication and authorization using JWT',
              'Created comprehensive API documentation using Swagger'
            ]
          }
        ]
      },
      {
        type: 'skills',
        title: 'Technical Skills',
        categories: [
          { name: 'Languages', skills: ['Python', 'Go', 'JavaScript'] },
          { name: 'Frameworks', skills: ['FastAPI', 'Django', 'Flask', 'Express'] },
          { name: 'Databases', skills: ['PostgreSQL', 'MongoDB', 'Redis', 'Elasticsearch'] },
          { name: 'Message Queues', skills: ['RabbitMQ', 'Kafka', 'AWS SQS'] },
          { name: 'Tools', skills: ['Docker', 'Kubernetes', 'Git', 'Postman'] }
        ]
      }
    ]
  },
  {
    title: 'Cyber Security Analyst',
    summary: 'Cybersecurity professional with 2 years of experience in threat detection, incident response, and security monitoring. Strong knowledge of security frameworks and compliance requirements.',
    tags: ['Cybersecurity', 'Security', 'Threat Detection', 'SIEM', 'Incident Response'],
    visibility: 'private',
    source: 'manual',
    sections: [
      {
        type: 'education',
        title: 'Education',
        entries: [
          {
            institution: 'Macquarie University',
            degree: 'Bachelor of Cybersecurity',
            startDate: '2019',
            endDate: '2022',
            gpa: '3.6/4.0',
            highlights: ['Cybersecurity Excellence Award']
          }
        ]
      },
      {
        type: 'experience',
        title: 'Work Experience',
        entries: [
          {
            company: 'SecureBank',
            position: 'Security Analyst',
            startDate: 'Feb 2022',
            endDate: 'Present',
            location: 'Sydney, NSW',
            achievements: [
              'Monitor security events using SIEM tools (Splunk)',
              'Conducted 20+ security assessments identifying critical vulnerabilities',
              'Responded to 50+ security incidents with average resolution time of 4 hours',
              'Implemented security controls reducing attack surface by 30%'
            ]
          }
        ]
      },
      {
        type: 'certifications',
        title: 'Certifications',
        entries: [
          'CompTIA Security+',
          'Certified Ethical Hacker (CEH)',
          'GIAC Security Essentials (GSEC)'
        ]
      },
      {
        type: 'skills',
        title: 'Technical Skills',
        categories: [
          { name: 'Security Tools', skills: ['Splunk', 'Wireshark', 'Nmap', 'Metasploit'] },
          { name: 'Frameworks', skills: ['NIST', 'ISO 27001', 'OWASP'] },
          { name: 'Languages', skills: ['Python', 'Bash', 'PowerShell'] },
          { name: 'Cloud Security', skills: ['AWS Security', 'Azure Security'] }
        ]
      }
    ]
  },
  {
    title: 'Mobile Developer - React Native',
    summary: 'Mobile developer specializing in cross-platform development with React Native. 3 years of experience building iOS and Android applications. Passionate about creating smooth, native-feeling mobile experiences.',
    tags: ['React Native', 'Mobile Development', 'iOS', 'Android', 'JavaScript'],
    visibility: 'private',
    source: 'manual',
    sections: [
      {
        type: 'education',
        title: 'Education',
        entries: [
          {
            institution: 'RMIT University',
            degree: 'Bachelor of Software Engineering',
            startDate: '2017',
            endDate: '2020',
            gpa: '3.5/4.0'
          }
        ]
      },
      {
        type: 'experience',
        title: 'Work Experience',
        entries: [
          {
            company: 'Mobile Innovations',
            position: 'Mobile Developer',
            startDate: 'Mar 2021',
            endDate: 'Present',
            location: 'Melbourne, VIC',
            achievements: [
              'Developed 5+ production mobile apps using React Native',
              'Integrated native modules for camera, GPS, and push notifications',
              'Reduced app bundle size by 40% improving download rates',
              'Implemented offline-first architecture with local database sync'
            ]
          },
          {
            company: 'AppStudio',
            position: 'Junior Mobile Developer',
            startDate: 'Jul 2020',
            endDate: 'Feb 2021',
            location: 'Melbourne, VIC',
            achievements: [
              'Built mobile UI components following design specs',
              'Fixed 100+ bugs improving app stability',
              'Participated in code reviews and testing'
            ]
          }
        ]
      },
      {
        type: 'skills',
        title: 'Technical Skills',
        categories: [
          { name: 'Mobile', skills: ['React Native', 'Expo', 'Swift', 'Kotlin'] },
          { name: 'Frontend', skills: ['React', 'TypeScript', 'JavaScript'] },
          { name: 'State Management', skills: ['Redux', 'MobX', 'React Query'] },
          { name: 'Tools', skills: ['Xcode', 'Android Studio', 'Fastlane', 'Firebase'] }
        ]
      }
    ]
  },
  {
    title: 'Machine Learning Engineer',
    summary: 'ML engineer with strong background in deep learning, NLP, and computer vision. 3 years of experience building and deploying ML models in production. Proficient in Python, TensorFlow, and cloud platforms.',
    tags: ['Machine Learning', 'Python', 'TensorFlow', 'Deep Learning', 'AI'],
    visibility: 'private',
    source: 'manual',
    sections: [
      {
        type: 'education',
        title: 'Education',
        entries: [
          {
            institution: 'Australian National University',
            degree: 'Master of Machine Learning',
            startDate: '2019',
            endDate: '2021',
            gpa: '3.9/4.0'
          },
          {
            institution: 'University of Sydney',
            degree: 'Bachelor of Mathematics',
            startDate: '2015',
            endDate: '2018',
            gpa: '3.7/4.0'
          }
        ]
      },
      {
        type: 'experience',
        title: 'Work Experience',
        entries: [
          {
            company: 'AI Solutions Lab',
            position: 'Machine Learning Engineer',
            startDate: 'Mar 2021',
            endDate: 'Present',
            location: 'Canberra, ACT',
            achievements: [
              'Built NLP model for sentiment analysis with 92% accuracy',
              'Deployed computer vision model for object detection processing 1000+ images/sec',
              'Implemented MLOps pipeline for model training and deployment',
              'Reduced model inference time by 60% through optimization'
            ]
          }
        ]
      },
      {
        type: 'skills',
        title: 'Technical Skills',
        categories: [
          { name: 'ML/AI', skills: ['TensorFlow', 'PyTorch', 'scikit-learn', 'Keras'] },
          { name: 'Languages', skills: ['Python', 'R', 'SQL'] },
          { name: 'ML Ops', skills: ['MLflow', 'Kubeflow', 'Docker', 'AWS SageMaker'] },
          { name: 'Specialties', skills: ['NLP', 'Computer Vision', 'Deep Learning', 'Time Series'] }
        ]
      }
    ]
  },
  {
    title: 'QA Engineer - Automation',
    summary: 'Quality assurance engineer specializing in test automation. 3 years of experience building test frameworks and ensuring software quality. Proficient in Selenium, Cypress, and CI/CD integration.',
    tags: ['QA', 'Test Automation', 'Selenium', 'Cypress', 'Testing'],
    visibility: 'private',
    source: 'manual',
    sections: [
      {
        type: 'education',
        title: 'Education',
        entries: [
          {
            institution: 'Swinburne University',
            degree: 'Bachelor of Software Testing',
            startDate: '2018',
            endDate: '2021',
            gpa: '3.4/4.0'
          }
        ]
      },
      {
        type: 'experience',
        title: 'Work Experience',
        entries: [
          {
            company: 'QualityFirst Tech',
            position: 'Senior QA Engineer',
            startDate: 'Feb 2022',
            endDate: 'Present',
            location: 'Perth, WA',
            achievements: [
              'Built comprehensive test automation framework using Cypress',
              'Automated 200+ test cases reducing manual testing effort by 70%',
              'Integrated automated tests into CI/CD pipeline',
              'Mentored junior QA engineers in automation best practices'
            ]
          },
          {
            company: 'TestLab Solutions',
            position: 'QA Engineer',
            startDate: 'Jul 2021',
            endDate: 'Jan 2022',
            location: 'Perth, WA',
            achievements: [
              'Performed manual and automated testing for web applications',
              'Created test plans and test cases',
              'Reported and tracked 500+ bugs to resolution'
            ]
          }
        ]
      },
      {
        type: 'skills',
        title: 'Technical Skills',
        categories: [
          { name: 'Test Automation', skills: ['Selenium', 'Cypress', 'Jest', 'Playwright'] },
          { name: 'Languages', skills: ['JavaScript', 'Python', 'Java'] },
          { name: 'Tools', skills: ['Postman', 'JMeter', 'Git', 'Jira'] },
          { name: 'Methodologies', skills: ['Agile', 'BDD', 'TDD'] }
        ]
      }
    ]
  }
];

async function seedResumes() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await db.connect();

    console.log('🔍 Finding applicants...');
    const applicants = await User.find({ role: 'applicant' });

    if (applicants.length === 0) {
      console.error('⚠️  No applicants found! Please run seedApplicants.js first.');
      process.exit(1);
    }

    console.log(`✅ Found ${applicants.length} applicant(s)`);

    console.log('🗑️  Clearing existing resumes...');
    const deleteResult = await Resume.deleteMany({});
    console.log(`   Deleted ${deleteResult.deletedCount} existing resume(s)`);

    console.log('📄 Creating resumes for applicants...');
    const resumes = [];

    // Assign resumes to applicants (some applicants may get multiple resumes)
    for (let i = 0; i < resumeTemplates.length && i < applicants.length; i++) {
      const template = resumeTemplates[i];
      const applicant = applicants[i];

      resumes.push({
        owner: applicant._id,
        title: template.title,
        summary: template.summary,
        content: `${template.summary}\n\nFull resume available upon request.`,
        sections: template.sections,
        tags: template.tags,
        visibility: template.visibility,
        source: template.source
      });
    }

    const insertedResumes = await Resume.insertMany(resumes);
    console.log(`✅ Successfully created ${insertedResumes.length} resumes`);

    console.log('\n📊 Resume Summary:');
    console.log(`   Total resumes: ${insertedResumes.length}`);
    console.log(`   Applicants with resumes: ${new Set(insertedResumes.map(r => r.owner.toString())).size}`);

    console.log('\n📋 Resume Titles:');
    const titleCounts = {};
    insertedResumes.forEach(resume => {
      const category = resume.tags[resume.tags.length - 1] || 'Other';
      titleCounts[category] = (titleCounts[category] || 0) + 1;
    });

    Object.entries(titleCounts).forEach(([category, count]) => {
      console.log(`   ${category}: ${count} resume(s)`);
    });

    console.log('\n✨ Resume seeding complete!');

    return insertedResumes;
  } catch (error) {
    console.error('❌ Error seeding resumes:', error);
    process.exit(1);
  } finally {
    await db.disconnect();
    process.exit(0);
  }
}

// Run if executed directly
if (require.main === module) {
  seedResumes();
}

module.exports = seedResumes;
