const fs = require('fs');
const mongoose = require('mongoose');

const env = fs.readFileSync('.env.local', 'utf-8');
const match = env.match(/MONGO_URL=(.*)/);
if (!match) { console.error('No MONGO_URL'); process.exit(1); }
const uri = match[1].replace(/["']/g, '');

async function run() {
  await mongoose.connect(uri);
  const Application = mongoose.model('Application', new mongoose.Schema({}, { strict: false }));
  const app = await Application.findOne().sort({ createdAt: -1 }).lean();
  console.log(JSON.stringify({
    id: app._id,
    overallStatus: app.overallStatus,
    firstPrefStatus: app.firstPrefProgress.status,
    firstPrefCurrentStage: app.firstPrefProgress.currentStage,
    firstPrefStages: app.firstPrefProgress.stages,
  }, null, 2));
  process.exit(0);
}
run();
