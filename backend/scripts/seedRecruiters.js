/* eslint-disable no-console */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const bcrypt = require('bcryptjs');
const db = require('../services/db.service');
const User = require('../models/userModel');

const recruiters = [
  {
    name: 'Sarah Chen',
    email: 'sarah.chen@atlassian.com',
    password: 'Recruiter123!',
    role: 'recruiter',
    companyName: 'Atlassian',
    companyId: 'atlassian-001',
    isVerified: true
  },
  {
    name: 'Michael Rodriguez',
    email: 'michael.rodriguez@canva.com',
    password: 'Recruiter123!',
    role: 'recruiter',
    companyName: 'Canva',
    companyId: 'canva-001',
    isVerified: true
  },
  {
    name: 'Priya Sharma',
    email: 'priya.sharma@google.com',
    password: 'Recruiter123!',
    role: 'recruiter',
    companyName: 'Google',
    companyId: 'google-001',
    isVerified: true
  },
  {
    name: 'James Wilson',
    email: 'james.wilson@accenture.com',
    password: 'Recruiter123!',
    role: 'recruiter',
    companyName: 'Accenture',
    companyId: 'accenture-001',
    isVerified: true
  },
  {
    name: 'Emma Thompson',
    email: 'emma.thompson@commbank.com.au',
    password: 'Recruiter123!',
    role: 'recruiter',
    companyName: 'Commonwealth Bank',
    companyId: 'commbank-001',
    isVerified: true
  },
  {
    name: 'David Kim',
    email: 'david.kim@bankwest.com.au',
    password: 'Recruiter123!',
    role: 'recruiter',
    companyName: 'Bankwest (Commonwealth Bank)',
    companyId: 'bankwest-001',
    isVerified: true
  },
  {
    name: 'Olivia Martinez',
    email: 'olivia.martinez@capgemini.com',
    password: 'Recruiter123!',
    role: 'recruiter',
    companyName: 'Capgemini Australia',
    companyId: 'capgemini-001',
    isVerified: true
  },
  {
    name: 'Robert Lee',
    email: 'robert.lee@atlassian.com',
    password: 'Recruiter123!',
    role: 'recruiter',
    companyName: 'Atlassian',
    companyId: 'atlassian-001',
    isVerified: true
  },
  {
    name: 'Sophie Anderson',
    email: 'sophie.anderson@canva.com',
    password: 'Recruiter123!',
    role: 'recruiter',
    companyName: 'Canva',
    companyId: 'canva-001',
    isVerified: true
  },
  {
    name: 'Daniel Brown',
    email: 'daniel.brown@google.com',
    password: 'Recruiter123!',
    role: 'recruiter',
    companyName: 'Google',
    companyId: 'google-001',
    isVerified: true
  }
];

async function seedRecruiters() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await db.connect();

    console.log('🗑️  Clearing existing recruiters...');
    const deleteResult = await User.deleteMany({ role: 'recruiter' });
    console.log(`   Deleted ${deleteResult.deletedCount} existing recruiter(s)`);

    console.log('👥 Creating recruiter accounts...');
    const recruitersWithHashedPasswords = await Promise.all(
      recruiters.map(async (recruiter) => {
        const hashedPassword = await bcrypt.hash(recruiter.password, 10);
        return {
          ...recruiter,
          password: hashedPassword
        };
      })
    );

    const insertedRecruiters = await User.insertMany(recruitersWithHashedPasswords);
    console.log(`✅ Successfully created ${insertedRecruiters.length} recruiter accounts`);

    console.log('\n📊 Recruiter Summary:');
    const companyCounts = {};
    insertedRecruiters.forEach(recruiter => {
      companyCounts[recruiter.companyName] = (companyCounts[recruiter.companyName] || 0) + 1;
    });

    Object.entries(companyCounts).forEach(([company, count]) => {
      console.log(`   ${company}: ${count} recruiter(s)`);
    });

    console.log('\n🔑 Login Credentials (all use password: Recruiter123!):');
    insertedRecruiters.forEach(recruiter => {
      console.log(`   ${recruiter.email} - ${recruiter.name} (${recruiter.companyName})`);
    });

    console.log('\n✨ Recruiter seeding complete!');

    return insertedRecruiters;
  } catch (error) {
    console.error('❌ Error seeding recruiters:', error);
    process.exit(1);
  } finally {
    await db.disconnect();
    process.exit(0);
  }
}

// Run if executed directly
if (require.main === module) {
  seedRecruiters();
}

module.exports = seedRecruiters;
