/**
 * One-time migration: aligns existing data with the v2 schema (spec-compliant).
 * Run with: node src/migrate.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');

async function migrate() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  console.log('Connected. Starting migration...');

  // ── Users ──────────────────────────────────────────────────────────────────
  // Rename: password → passwordHash, active → isActive
  await db.collection('users').updateMany(
    { password: { $exists: true } },
    { $rename: { password: 'passwordHash' } }
  );
  await db.collection('users').updateMany(
    { active: { $exists: true } },
    { $rename: { active: 'isActive' } }
  );

  const roleMap = { 'Intern': 'INTERN', 'Buddy': 'BUDDY', 'Tech Lead': 'TECH_LEAD', 'Manager': 'MANAGER' };
  for (const [from, to] of Object.entries(roleMap)) {
    const r = await db.collection('users').updateMany({ role: from }, { $set: { role: to } });
    if (r.modifiedCount) console.log(`  users: ${from} → ${to} (${r.modifiedCount})`);
  }

  // ── Interns ────────────────────────────────────────────────────────────────
  await db.collection('interns').updateMany(
    { joiningDate: { $exists: true } },
    { $rename: { joiningDate: 'startDate' } }
  );

  const statusMap = { 'Pending': 'ONBOARDING', 'Active': 'ACTIVE', 'Completed': 'COMPLETED', 'Withdrawn': 'TERMINATED' };
  for (const [from, to] of Object.entries(statusMap)) {
    const r = await db.collection('interns').updateMany({ status: from }, { $set: { status: to } });
    if (r.modifiedCount) console.log(`  interns: status ${from} → ${to} (${r.modifiedCount})`);
  }

  // Auto-generate employeeCode for interns that don't have one
  const interns = await db.collection('interns').find({ employeeCode: { $exists: false } }).toArray();
  for (let i = 0; i < interns.length; i++) {
    const code = `INT-${new Date().getFullYear()}-${String(i + 1).padStart(3, '0')}`;
    await db.collection('interns').updateOne({ _id: interns[i]._id }, { $set: { employeeCode: code, department: interns[i].department || 'New Energy Digital' } });
  }
  if (interns.length) console.log(`  interns: generated ${interns.length} employee codes`);

  // ── Assignments ────────────────────────────────────────────────────────────
  await db.collection('assignments').updateMany({ state: { $exists: false } }, { $set: { state: 'UNASSIGNED', history: [] } });
  await db.collection('assignments').updateMany({ managerId: { $ne: null }, techLeadId: null, state: 'UNASSIGNED' }, { $set: { state: 'MANAGER_ASSIGNED' } });
  await db.collection('assignments').updateMany({ managerId: { $ne: null }, techLeadId: { $ne: null }, buddyId: null }, { $set: { state: 'TECHLEAD_ASSIGNED' } });
  await db.collection('assignments').updateMany({ managerId: { $ne: null }, techLeadId: { $ne: null }, buddyId: { $ne: null } }, { $set: { state: 'ACTIVE' } });

  // ── Standups ───────────────────────────────────────────────────────────────
  await db.collection('standups').updateMany({ blocker: { $exists: true } }, { $rename: { blocker: 'blockers' } });
  await db.collection('standups').updateMany({ slaStatus: { $exists: false } }, { $set: { slaStatus: 'PENDING', responseMinutes: null } });
  // Assign buddyId snapshot from assignment if missing
  const standups = await db.collection('standups').find({ buddyId: { $exists: false } }).toArray();
  for (const s of standups) {
    const asgn = await db.collection('assignments').findOne({ internId: s.internId });
    if (asgn?.buddyId) {
      await db.collection('standups').updateOne({ _id: s._id }, { $set: { buddyId: asgn.buddyId } });
    }
  }

  // ── Notifications ──────────────────────────────────────────────────────────
  await db.collection('notifications').updateMany({ recipientId: { $exists: true } }, { $rename: { recipientId: 'userId', message: 'body' } });
  // Fix notification types
  await db.collection('notifications').updateMany({ type: { $nin: ['ASSIGNMENT', 'SLA_BREACH', 'REVIEW_STAGE', 'REVIEW_PUBLISHED', 'SYSTEM'] } }, { $set: { type: 'SYSTEM' } });

  console.log('\nMigration complete!');
  await mongoose.disconnect();
}

migrate().catch((err) => { console.error(err); process.exit(1); });
