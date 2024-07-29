// This controller is used to for generative AI models

import { GoogleGenerativeAI } from "@google/generative-ai";
import download from "../utilities/download.js";
import { fileTypeFromBuffer } from "file-type";
import path from "path";
import dotenv from 'dotenv';

const envPath = path.resolve('.env.development')

dotenv.config({path: envPath})


const genAI = new GoogleGenerativeAI(process.env?.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });


// Function to convert a file to a generative part
function fileToGenerativePart(buffer: any, mimeType: string) {
    return {
      inlineData: {
        data: buffer.toString('base64'),
        mimeType,
      },
    };
}


// const prompt = "Just give me two lines for the meaning of the word developement and number the lines for me";

// // const result = await model.generateContent(prompt);

// // // console.log(result)
// // console.log(result.response.text());

// const result = await model.generateContentStream(prompt);

// // Print text as it comes in.
// for await (const chunk of result.stream) {
//   const chunkText = chunk.text();
//   process.stdout.write(chunkText);
// }

// Main function to execute the process
const main = async (uri: string,  prompt: string): Promise<any> => {
  download(uri, async (err: any, imageBuffer: any) => {
    if (err) {
    return console.log(err);
    }
  
    try {

    let fullText: string | undefined;

    const type = await fileTypeFromBuffer(imageBuffer);

    // Convert the downloaded image to a generative part
    const imagePart = fileToGenerativePart(imageBuffer, type?.mime ?? 'application/octet-stream');
  
    // Generate content stream
    const result = await model.generateContentStream([prompt, imagePart]);
  
    // Print text as it comes in
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      fullText += chunkText;
    }

    console.log(fullText);

    } catch (e) {
    console.log(e);
    }
  });
  };

  // const link =  "https://drive.google.com/uc?id=1adH6UFxy3sKfGZbWZsTfjy69vnrHOn20&export=download"


  // main(link, "Just give me two lines  of what you see in this image and number the lines for me");

export default main;