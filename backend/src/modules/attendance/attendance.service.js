const Attendance = require('./attendance.model');
const Standup = require('../standups/standup.model');
const Holiday = require('../holidays/holiday.model');
const Intern = require('../interns/intern.model');

const istMidnight = (d = new Date()) => {
  const ist = new Date(d.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  ist.setHours(0, 0, 0, 0);
  return ist;
};

const isWeekend = (date) => {
  const day = date.getDay();
  return day === 0 || day === 6;
};

const getHolidaySet = async () => {
  const holidays = await Holiday.find({}).select('date').lean();
  return new Set(holidays.map((h) => h.date.toISOString().split('T')[0]));
};

const getWorkingDaysBetween = async (start, end) => {
  const holidaySet = await getHolidaySet();
  let count = 0;
  const cur = new Date(start);
  while (cur <= end) {
    const dateStr = cur.toISOString().split('T')[0];
    if (!isWeekend(cur) && !holidaySet.has(dateStr)) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
};

const getAttendance = async (internId, from, to) => {
  const query = { internId };
  if (from || to) {
    query.date = {};
    if (from) query.date.$gte = new Date(from);
    if (to) query.date.$lte = new Date(to);
  }
  return Attendance.find(query).sort({ date: -1 }).lean();
};

const getCompliance = async (internId) => {
  const intern = await Intern.findById(internId);
  if (!intern) throw Object.assign(new Error('Intern not found'), { status: 404 });

  const today = istMidnight();
  const start = istMidnight(intern.startDate);
  const end = today < istMidnight(intern.endDate) ? today : istMidnight(intern.endDate);

  const [submitted, expected] = await Promise.all([
    Standup.countDocuments({ internId, date: { $gte: start, $lte: end } }),
    getWorkingDaysBetween(start, end),
  ]);

  return {
    internId,
    submitted,
    expected,
    compliance: expected > 0 ? Math.round((submitted / expected) * 100) : 100,
    startDate: intern.startDate,
    endDate: intern.endDate,
  };
};

const manualCorrection = async (internId, date, status) => {
  return Attendance.findOneAndUpdate(
    { internId, date: new Date(date) },
    { internId, date: new Date(date), status, source: 'MANUAL' },
    { upsert: true, new: true }
  );
};

// Nightly: backfill ABSENT for working days with no standup
const recomputeCompliance = async () => {
  const holidaySet = await getHolidaySet();
  const interns = await Intern.find({ status: { $in: ['ONBOARDING', 'ACTIVE'] } }).lean();
  let updated = 0;

  for (const intern of interns) {
    const start = istMidnight(intern.startDate);
    const today = istMidnight();
    const end = today < istMidnight(intern.endDate) ? today : istMidnight(intern.endDate);

    const cur = new Date(start);
    while (cur <= end) {
      const dateStr = cur.toISOString().split('T')[0];
      if (!isWeekend(cur) && !holidaySet.has(dateStr)) {
        const existing = await Attendance.findOne({ internId: intern._id, date: cur });
        if (!existing) {
          await Attendance.create({ internId: intern._id, date: new Date(cur), status: 'ABSENT', source: 'SYSTEM' });
          updated++;
        }
      }
      cur.setDate(cur.getDate() + 1);
    }
  }
  return updated;
};

module.exports = { getAttendance, getCompliance, manualCorrection, recomputeCompliance };
