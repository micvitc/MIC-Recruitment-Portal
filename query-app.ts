import mongoose from 'mongoose';
import { dbConnect } from './src/lib/mongodb';
import Application from './src/models/Application';

async function run() {
  await dbConnect();
  const app = await Application.findOne().sort({ createdAt: -1 });
  console.log(JSON.stringify({
    overallStatus: app.overallStatus,
    firstPrefStatus: app.firstPrefProgress.status,
    firstPrefCurrentStage: app.firstPrefProgress.currentStage,
    firstPrefStages: app.firstPrefProgress.stages,
  }, null, 2));
  process.exit(0);
}
run();
