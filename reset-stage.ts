import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { MongoClient } from "mongodb";

async function resetStage() {
  const client = new MongoClient(process.env.MONGO_URL!);
  await client.connect();
  
  const db = client.db();
  const result = await db.collection("applications").updateMany(
    { cycleId: "2026-27" },
    {
      $set: {
        "firstPrefProgress.currentStage": 1,
        "secondPrefProgress.currentStage": 1,
      }
    }
  );
  
  console.log(`✅ Reset currentStage to 1 for ${result.modifiedCount} application(s).`);
  await client.close();
  process.exit(0);
}

resetStage();
