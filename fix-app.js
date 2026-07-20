const fs = require('fs');
const mongoose = require('mongoose');

const env = fs.readFileSync('.env.local', 'utf-8');
const match = env.match(/MONGO_URL=(.*)/);
if (!match) { console.error('No MONGO_URL'); process.exit(1); }
const uri = match[1].replace(/["']/g, '');

async function run() {
  await mongoose.connect(uri);
  const Application = mongoose.model('Application', new mongoose.Schema({}, { strict: false }));
  
  // Find all applications where stages only contain stage 1 but currentStage is 2
  const result = await Application.updateMany(
    { 
      "firstPrefProgress.currentStage": 2, 
      "firstPrefProgress.stages": { $size: 1 } 
    },
    { 
      $set: { "firstPrefProgress.currentStage": 1 } 
    }
  );
  
  console.log("Updated applications:", result.modifiedCount);
  process.exit(0);
}
run();
