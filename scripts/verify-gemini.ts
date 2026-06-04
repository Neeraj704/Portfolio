import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("❌ No API key found in .env.local");
  process.exit(1);
}

console.log(`🔑 Testing API Key: ${apiKey.substring(0, 10)}...`);

async function testModel(modelName: string) {
  console.log(`\n🤖 Testing model: ${modelName}...`);
  try {
    const genAI = new GoogleGenerativeAI(apiKey!);
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent("Hello, are you working?");
    const response = await result.response;
    console.log(`✅ Success! Response: ${response.text()}`);
    return true;
  } catch (error: any) {
    console.error(`❌ Failed: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log("🔍 Checking available models for 2026...");

  const modelsToTest = [
    "gemini-3-flash-preview",
    "gemini-2.5-flash",
    "gemini-2.0-flash-exp",
    "gemini-2.0-flash",
    "gemini-1.5-flash-latest",
    "gemini-1.5-pro-latest",
  ];

  for (const modelName of modelsToTest) {
    if (await testModel(modelName)) {
      console.log(`\n🎉 Found working model: ${modelName}`);
      console.log(
        `PLEASE UPDATE src/app/api/chat/route.ts TO USE: "${modelName}"`,
      );
      process.exit(0);
    }
  }

  console.error("\n💥 All future model tests failed.");
  process.exit(1);
}

main();
