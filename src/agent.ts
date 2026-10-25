import { GoogleGenerativeAI } from '@google/generative-ai';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();


// SETUP 
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("Error: GEMINI_API_KEY is missing from the .env file.");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const inputDir = path.join(__dirname, '../input');
const outputDir = path.join(__dirname, '../output');

//Folder check
if (!fs.existsSync(inputDir)) fs.mkdirSync(inputDir, { recursive: true });
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

const allowedExtensions = ['.txt', '.pdf'];

console.log(`Wake up, Neo... `);
//Old message: Listening for files in: ${inputDir}


//ACTIONS
fs.watch(inputDir, async (eventType, fileName) => {
  if (eventType !== 'rename' || !fileName) return;



  // 1. Check if the file extension is supported
  const ext = path.extname(fileName).toLowerCase();
  if (!allowedExtensions.includes(ext)) return;

  const filePath = path.join(inputDir, fileName);

  //pdf copy timer
  await new Promise((resolve) => setTimeout(resolve, 250));

  //deletion or moved out
  if (!fs.existsSync(filePath)) return;

  console.log(`\nDoing the thing with: ${fileName}...`);

  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');

    const prompt = `
        Analyze the following text and convert it into a structured JSON object. 
        Extract the core entities, provide a brief summary, and organize the key points.
        Return ONLY valid JSON without any markdown formatting blocks.
      `;

    let result;

    //ROUTER
    if (ext == '.txt') {
      const textContent = fs.readFileSync(filePath, 'utf-8');
      result = await model.generateContent([prompt, textContent]);
    } else if (ext === '.pdf') {
      const fileBuffer = fs.readFileSync(filePath);
      const pdfPart = {
        inlineData: {
          data: fileBuffer.toString('base64'),
          mimeType: 'application/pdf',
        },
      };
      result = await model.generateContent([prompt, pdfPart]);
    }

    if (!result) return;

    let responseText = result.response.text();
    responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

    const baseName = path.parse(fileName).name;
    const outputFileName = `${baseName}.processed.json`;   
    const outputPath = path.join(outputDir, outputFileName);

    fs.writeFileSync(outputPath, responseText);
    console.log('Follow the white rabbit... File saved to output/${outputFilename}');
  } catch (error) {
    console.error('Error processing ${fileName}:', error);
  }
});








/* VANHAT VANHAT VANHAT
const result = await model.generateContent(prompt);
let responseText = result.response.text();
 
// STRIP
responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

const outputFilename = fileName.replace('.txt', '.json');
const outputPath = path.join(outputDir, outputFilename);

fs.writeFileSync(outputPath, responseText);
console.log(`SUCCESS: Processed and saved to output/${outputFilename}`);

} catch (error) {
console.error(`Error processing ${fileName}:`, error);
}
 
 
}); */