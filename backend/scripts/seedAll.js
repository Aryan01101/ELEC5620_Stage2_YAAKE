/* eslint-disable no-console */
const path = require('path');
const { spawn } = require('child_process');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function runScript(scriptName) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, scriptName);
    const child = spawn('node', [scriptPath], {
      stdio: 'inherit',
      env: process.env
    });

    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`${scriptName} exited with code ${code}`));
      } else {
        resolve();
      }
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}

async function seedAll() {
  const startTime = Date.now();
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║          🌱 YAAKE Database Seeding - Master Script        ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log();

  try {
    console.log('This script will run all seeding scripts in the correct order:\n');
    console.log('  1. Recruiters (companies & accounts)');
    console.log('  2. Applicants (user accounts)');
    console.log('  3. Job Posts (from recruiters)');
    console.log('  4. Interview Question Sets (from recruiters)');
    console.log('  5. Resumes (for applicants)');
    console.log('  6. Courses (training resources)\n');

    // Step 1: Seed Recruiters
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 Step 1/6: Seeding Recruiters');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    await runScript('seedRecruiters.js');

    // Step 2: Seed Applicants
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 Step 2/6: Seeding Applicants');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    await runScript('seedApplicants.js');

    // Step 3: Seed Job Posts
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 Step 3/6: Seeding Job Posts');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    await runScript('seedJobPosts.js');

    // Step 4: Seed Interview Question Sets
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 Step 4/6: Seeding Interview Question Sets');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    await runScript('seedQuestionSets.js');

    // Step 5: Seed Resumes
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 Step 5/6: Seeding Resumes');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    await runScript('seedResumes.js');

    // Step 6: Seed Courses
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 Step 6/6: Seeding Courses');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    await runScript('seedCourses.js');

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    // Final Summary
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║                    🎉 Seeding Complete!                   ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    console.log('📊 All Data Successfully Seeded!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`   ⏱️  Total time:           ${duration}s\n`);

    console.log('🔑 Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('   Recruiters: any-recruiter-email / Recruiter123!');
    console.log('   Applicants: any-applicant-email / Applicant123!');
    console.log('\n   Example recruiter: sarah.chen@atlassian.com');
    console.log('   Example applicant: alex.johnson@email.com\n');

    console.log('💡 Next Steps:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('   1. Start your backend server');
    console.log('   2. Login with any of the seeded accounts');
    console.log('   3. Explore jobs, question sets, and resumes\n');

  } catch (error) {
    console.error('\n❌ Fatal error during seeding:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  seedAll();
}

module.exports = seedAll;
