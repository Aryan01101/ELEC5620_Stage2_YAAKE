/* eslint-disable no-console */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const bcrypt = require('bcryptjs');
const db = require('../services/db.service');
const User = require('../models/userModel');

const applicants = [
  {
    name: 'Alex Johnson',
    email: 'alex.johnson@email.com',
    password: 'Applicant123!',
    role: 'applicant',
    isVerified: true
  },
  {
    name: 'Emily Zhang',
    email: 'emily.zhang@email.com',
    password: 'Applicant123!',
    role: 'applicant',
    isVerified: true
  },
  {
    name: 'Marcus Williams',
    email: 'marcus.williams@email.com',
    password: 'Applicant123!',
    role: 'applicant',
    isVerified: true
  },
  {
    name: 'Sophia Patel',
    email: 'sophia.patel@email.com',
    password: 'Applicant123!',
    role: 'applicant',
    isVerified: true
  },
  {
    name: 'Liam O\'Connor',
    email: 'liam.oconnor@email.com',
    password: 'Applicant123!',
    role: 'applicant',
    isVerified: true
  },
  {
    name: 'Aisha Rahman',
    email: 'aisha.rahman@email.com',
    password: 'Applicant123!',
    role: 'applicant',
    isVerified: true
  },
  {
    name: 'Noah Chen',
    email: 'noah.chen@email.com',
    password: 'Applicant123!',
    role: 'applicant',
    isVerified: true
  },
  {
    name: 'Isabella Garcia',
    email: 'isabella.garcia@email.com',
    password: 'Applicant123!',
    role: 'applicant',
    isVerified: true
  },
  {
    name: 'Ethan Kumar',
    email: 'ethan.kumar@email.com',
    password: 'Applicant123!',
    role: 'applicant',
    isVerified: true
  },
  {
    name: 'Olivia Thompson',
    email: 'olivia.thompson@email.com',
    password: 'Applicant123!',
    role: 'applicant',
    isVerified: true
  },
  {
    name: 'Ryan Nguyen',
    email: 'ryan.nguyen@email.com',
    password: 'Applicant123!',
    role: 'applicant',
    isVerified: true
  },
  {
    name: 'Zoe Mitchell',
    email: 'zoe.mitchell@email.com',
    password: 'Applicant123!',
    role: 'applicant',
    isVerified: true
  },
  {
    name: 'Jacob Lee',
    email: 'jacob.lee@email.com',
    password: 'Applicant123!',
    role: 'applicant',
    isVerified: true
  },
  {
    name: 'Mia Anderson',
    email: 'mia.anderson@email.com',
    password: 'Applicant123!',
    role: 'applicant',
    isVerified: true
  },
  {
    name: 'Daniel Smith',
    email: 'daniel.smith@email.com',
    password: 'Applicant123!',
    role: 'applicant',
    isVerified: true
  }
];

async function seedApplicants() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await db.connect();

    console.log('🗑️  Clearing existing applicants...');
    const deleteResult = await User.deleteMany({ role: 'applicant' });
    console.log(`   Deleted ${deleteResult.deletedCount} existing applicant(s)`);

    console.log('👤 Creating applicant accounts...');
    const applicantsWithHashedPasswords = await Promise.all(
      applicants.map(async (applicant) => {
        const hashedPassword = await bcrypt.hash(applicant.password, 10);
        return {
          ...applicant,
          password: hashedPassword
        };
      })
    );

    const insertedApplicants = await User.insertMany(applicantsWithHashedPasswords);
    console.log(`✅ Successfully created ${insertedApplicants.length} applicant accounts`);

    console.log('\n🔑 Login Credentials (all use password: Applicant123!):');
    insertedApplicants.forEach(applicant => {
      console.log(`   ${applicant.email} - ${applicant.name}`);
    });

    console.log('\n✨ Applicant seeding complete!');

    return insertedApplicants;
  } catch (error) {
    console.error('❌ Error seeding applicants:', error);
    process.exit(1);
  } finally {
    await db.disconnect();
    process.exit(0);
  }
}

// Run if executed directly
if (require.main === module) {
  seedApplicants();
}

module.exports = seedApplicants;
