const cron = require('node-cron');
const { sweepSlaBreaches } = require('../modules/standups/standup.service');
const { recomputeCompliance } = require('../modules/attendance/attendance.service');

// Every 15 minutes: sweep for SLA breaches
cron.schedule('*/15 * * * *', async () => {
  try {
    const count = await sweepSlaBreaches();
    if (count > 0) console.log(`[cron] SLA sweep: ${count} breaches flagged`);
  } catch (err) {
    console.error('[cron] SLA sweep error:', err.message);
  }
});

// Nightly at 23:30 IST (18:00 UTC): recompute attendance/compliance
cron.schedule('0 18 * * *', async () => {
  try {
    const count = await recomputeCompliance();
    console.log(`[cron] Compliance recompute: ${count} absent records added`);
  } catch (err) {
    console.error('[cron] Compliance recompute error:', err.message);
  }
});

console.log('[cron] Jobs scheduled: SLA sweep (every 15min), Compliance recompute (nightly)');
