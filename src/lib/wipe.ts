import mongoose from "mongoose";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function wipe() {
  const uri = process.env.MONGO_URL;
  if (!uri) throw new Error("Missing MONGO_URL");

  await mongoose.connect(uri);
  console.log("Connected to DB.");

  try {
    await mongoose.connection.collection("applications").drop();
    console.log("Dropped applications.");
  } catch (e) {
    console.log("Applications coll might not exist.");
  }
  
  try {
    await mongoose.connection.collection("departments").drop();
    console.log("Dropped departments.");
  } catch (e) {
    console.log("Departments coll might not exist.");
  }

  await mongoose.disconnect();
}

wipe();
