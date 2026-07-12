import { GoogleGenerativeAI } from '@google/generative-ai';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("Error: GEMINI_API_KEY is missing from the .env file.");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);
//1.5 FLASH originally
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const inputDir = path.join(__dirname, '../input');
const outputDir = path.join(__dirname, '../output');

if (!fs.existsSync(inputDir)) fs.mkdirSync(inputDir, { recursive: true });
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

console.log(`🤖 Gemini Agent active. Listening for files in: ${inputDir}`);

fs.watch(inputDir, async (eventType, filename) => {
  if (eventType === 'rename' && filename && filename.endsWith('.txt')) {
    const filePath = path.join(inputDir, filename);

    if (!fs.existsSync(filePath)) return;

    console.log(`\nDoing the thing with: ${filename}...`);

    try {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      
      const prompt = `
        Analyze the following text and convert it into a structured JSON object. 
        Extract the core entities, provide a brief summary, and organize the key points.
        Return ONLY valid JSON without any markdown formatting blocks.
        
        Text:
        ${fileContent}
      `;
      
      const result = await model.generateContent(prompt);
      let responseText = result.response.text();
      
      // STRIP
      responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

      const outputFilename = filename.replace('.txt', '.json');
      const outputPath = path.join(outputDir, outputFilename);

      fs.writeFileSync(outputPath, responseText);
      console.log(`SUCCESS: Processed and saved to output/${outputFilename}`);

    } catch (error) {
      console.error(`Error ${filename}:`, error);
    }
  }
});