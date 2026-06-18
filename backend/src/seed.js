const bcrypt = require('bcryptjs');
const User = require('./modules/users/user.model');

const SEED_USERS = [
  { name: 'HR Admin',    email: 'hr@reliance.com',       role: 'HR',        password: 'password123' },
  { name: 'Manager One', email: 'manager@reliance.com',  role: 'MANAGER',   password: 'password123' },
  { name: 'Tech Lead',   email: 'techlead@reliance.com', role: 'TECH_LEAD', password: 'password123' },
  { name: 'Buddy One',   email: 'buddy@reliance.com',    role: 'BUDDY',     password: 'password123' },
  { name: 'Intern One',  email: 'intern@reliance.com',   role: 'INTERN',    password: 'password123' },
];

async function seed() {
  let seeded = 0;
  for (const u of SEED_USERS) {
    const exists = await User.findOne({ email: u.email }).lean();
    if (!exists) {
      const passwordHash = await bcrypt.hash(u.password, 10);
      await User.create({ name: u.name, email: u.email, passwordHash, role: u.role, isActive: true });
      seeded++;
    }
  }
  if (seeded > 0) console.log(`  Seeded ${seeded} test account(s)`);
}

module.exports = seed;
