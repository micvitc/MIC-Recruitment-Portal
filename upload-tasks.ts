import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

const bucketName = process.env.AWS_S3_BUCKET_NAME;

const uploadFile = async (localPath: string, s3Key: string) => {
  try {
    const fileContent = fs.readFileSync(localPath);
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: s3Key,
      Body: fileContent,
      ContentType: "application/pdf",
    });
    
    await s3Client.send(command);
    console.log(`✅ Successfully uploaded ${localPath} to s3://${bucketName}/${s3Key}`);
  } catch (error) {
    console.error(`❌ Failed to upload ${localPath}:`, error);
  }
};

async function main() {
  console.log("Uploading tasks to S3...");
  await uploadFile("./tasks/AIML recruitment.pdf", "tasks/aiml-task.pdf");
  await uploadFile("./tasks/MIC Dev Recruitment Assignment.pdf", "tasks/development-task.pdf");
  console.log("Uploads complete!");
}

main();
