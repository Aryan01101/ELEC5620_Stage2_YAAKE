# YAAKE Database Seeding Scripts

This directory contains scripts to populate the MongoDB database with realistic sample data for development and testing purposes.

## Overview

The seeding scripts create:
- **10 Recruiter Accounts** from companies like Atlassian, Canva, Google, Accenture, Commonwealth Bank, etc.
- **15 Applicant Accounts** with diverse backgrounds
- **10 Real Job Posts** from actual Australian tech companies with working application links
- **10 Interview Question Sets** with technical, behavioral, and culture-fit questions
- **10 Realistic Resumes** for various tech roles (Full Stack, Data Engineer, DevOps, etc.)
- **20 Training Courses** from platforms like Coursera, Udemy, Pluralsight

## Prerequisites

1. **MongoDB Connection**: Ensure you have a `.env` file in the `backend/` directory with:
   ```env
   MONGO_URI=your_mongodb_connection_string
   ```

2. **Dependencies**: Install required packages:
   ```bash
   npm install
   ```

3. **bcryptjs**: If you encounter any errors, install bcryptjs:
   ```bash
   npm install bcryptjs
   ```

## Quick Start

### Option 1: Seed Everything (Recommended)

Run all seed scripts in the correct order:

```bash
npm run seed:all
```

This will sequentially run all seeding scripts and provide a comprehensive summary.

### Option 2: Individual Scripts

You can also run individual seed scripts:

```bash
# Seed recruiters first (required for jobs and questions)
npm run seed:recruiters

# Seed applicants (required for resumes)
npm run seed:applicants

# Seed job posts (requires recruiters)
npm run seed:jobs

# Seed interview question sets (requires recruiters)
npm run seed:questions

# Seed resumes (requires applicants)
npm run seed:resumes

# Seed courses (standalone)
npm run seed:courses
```

## Login Credentials

After seeding, you can login with any of these accounts:

### Recruiter Accounts
**Password for all recruiters**: `Recruiter123!`

- sarah.chen@atlassian.com (Atlassian)
- michael.rodriguez@canva.com (Canva)
- priya.sharma@google.com (Google)
- james.wilson@accenture.com (Accenture)
- emma.thompson@commbank.com.au (Commonwealth Bank)
- david.kim@bankwest.com.au (Bankwest)
- olivia.martinez@capgemini.com (Capgemini)
- robert.lee@atlassian.com (Atlassian)
- sophie.anderson@canva.com (Canva)
- daniel.brown@google.com (Google)

### Applicant Accounts
**Password for all applicants**: `Applicant123!`

- alex.johnson@email.com
- emily.zhang@email.com
- marcus.williams@email.com
- sophia.patel@email.com
- liam.oconnor@email.com
- aisha.rahman@email.com
- noah.chen@email.com
- isabella.garcia@email.com
- ethan.kumar@email.com
- olivia.thompson@email.com
- ryan.nguyen@email.com
- zoe.mitchell@email.com
- jacob.lee@email.com
- mia.anderson@email.com
- daniel.smith@email.com

## What Gets Seeded

### 1. Recruiters (`seedRecruiters.js`)
- Creates 10 recruiter accounts across 7 major companies
- All accounts are verified and ready to use
- Each recruiter is associated with their company

### 2. Applicants (`seedApplicants.js`)
- Creates 15 applicant accounts
- All accounts are verified
- Diverse names representing various backgrounds

### 3. Job Posts (`seedJobPosts.js`)
- 10 real job postings from Australian tech companies:
  - Software Engineer at Atlassian
  - Frontend Engineer at Canva
  - Graduate programs at Google, Accenture, Commonwealth Bank
  - Data Platform Engineer at Canva
  - DevOps Engineer at Atlassian
  - And more!
- All include realistic job descriptions, requirements, and working application links
- Jobs are automatically linked to appropriate recruiters

### 4. Interview Question Sets (`seedQuestionSets.js`)
- 10 question sets for different roles and experience levels
- Each set includes 3-4 questions covering:
  - **Technical**: System design, algorithms, architecture
  - **Behavioral**: Past experiences, problem-solving approach
  - **Problem-solving**: Real-world scenarios
  - **Culture-fit**: Company values alignment
- Includes suggested answers and evaluation criteria
- Varying visibility levels (private, company_template, public_sample)

### 5. Resumes (`seedResumes.js`)
- 10 comprehensive resumes with:
  - Education history
  - Work experience
  - Technical skills
  - Projects (for junior candidates)
  - Certifications (where applicable)
- Covers various roles:
  - Full Stack Developer
  - Data Engineer
  - Graduate Software Developer
  - Frontend Developer
  - DevOps Engineer
  - Backend Developer
  - Cyber Security Analyst
  - Mobile Developer
  - Machine Learning Engineer
  - QA Engineer

### 6. Courses (`seedCourses.js`)
- 20 training courses covering:
  - Frontend: React, TypeScript, CSS
  - Backend: Node.js, Python, APIs
  - DevOps: Docker, Kubernetes, CI/CD
  - Cloud: AWS, Terraform, Ansible
  - Data: SQL, Python for Data Analysis, Spark
  - Soft Skills: Agile, Communication, Leadership

## Dependencies Between Scripts

The scripts have dependencies and should be run in this order:

```
1. Recruiters ─┬─> 3. Job Posts
               └─> 4. Question Sets

2. Applicants ───> 5. Resumes

6. Courses (standalone)
```

The `seedAll.js` script handles these dependencies automatically.

## Clearing Data

Each seed script clears its respective collection before inserting new data:
- `seedRecruiters.js` removes all existing recruiters
- `seedApplicants.js` removes all existing applicants
- And so on...

**Warning**: Running these scripts will delete existing data in the respective collections.

## Troubleshooting

### MongoDB Connection Error
```
Error: Could not connect to MongoDB
```
**Solution**: Check your `.env` file and ensure `MONGO_URI` is set correctly.

### bcrypt/bcryptjs Error
```
Error: Cannot find module 'bcryptjs'
```
**Solution**: Install bcryptjs:
```bash
npm install bcryptjs
```

### No Recruiters Found
If `seedJobPosts.js` or `seedQuestionSets.js` reports "No recruiters found":
**Solution**: Run `npm run seed:recruiters` first.

### No Applicants Found
If `seedResumes.js` reports "No applicants found":
**Solution**: Run `npm run seed:applicants` first.

## Script Details

| Script | Creates | Dependencies | Runtime |
|--------|---------|--------------|---------|
| `seedRecruiters.js` | 10 recruiters | None | ~2s |
| `seedApplicants.js` | 15 applicants | None | ~2s |
| `seedJobPosts.js` | 10 job posts | Recruiters | ~2s |
| `seedQuestionSets.js` | 10 question sets | Recruiters | ~2s |
| `seedResumes.js` | 10 resumes | Applicants | ~2s |
| `seedCourses.js` | 20 courses | None | ~2s |
| `seedAll.js` | Everything | None | ~15s |

## Development Tips

1. **Quick Reset**: Run `npm run seed:all` to reset all data with fresh samples
2. **Partial Reset**: Run individual scripts to reset specific collections
3. **Custom Data**: Modify the data arrays in each script to customize the seed data
4. **Production**: Never run these scripts in production as they clear existing data

## Next Steps

After seeding:
1. Start your backend server: `npm start` or `npm run dev`
2. Login with any of the seeded accounts
3. Explore the features:
   - Recruiters can view and manage job posts
   - Recruiters can access interview question sets
   - Applicants can browse jobs and courses
   - Applicants can manage their resumes

## Support

If you encounter any issues or have questions about the seed scripts, please check:
1. MongoDB connection is working
2. All dependencies are installed
3. Scripts are run in the correct order (or use `npm run seed:all`)

---

Happy coding! 🚀
