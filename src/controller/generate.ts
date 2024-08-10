// This controller is used to for generative AI models

import { GoogleGenerativeAI } from "@google/generative-ai";
import download from "../utilities/download.js";
import { fileTypeFromBuffer } from "file-type";
import path from "path";
import dotenv from 'dotenv';
import { downloadImage } from "./xController.js";

const envPath = path.resolve('.env.development')

dotenv.config({path: envPath})


const main = async (uris: string[], prompt: string) => {
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

  // return new Promise<string>((resolve, reject) => {
  //   download(uri, async (err: any, imageBuffer: any) => {
  //     if (err) {
  //       return reject(err);
  //     }

  //     try {
  //       let fullText = '';

  //       const type = await fileTypeFromBuffer(imageBuffer);
  //       const imagePart = fileToGenerativePart(imageBuffer, type?.mime ?? 'application/octet-stream');

  //       // Generate content stream
  //       const result = await model.generateContentStream([prompt, imagePart]);

  //       console.log("Generating content stream");

  //       // Print text as it comes in
  //       for await (const chunk of result.stream) {
  //         const chunkText = await chunk.text(); // Await chunk.text()
  //         fullText += chunkText;
  //       }

  //       console.log("Full text: ", fullText);
  //       resolve(fullText);

  //     } catch (e) {
  //       reject(e);
  //     }
  //   });
  // });

  try {
    // Download and process all images
    const imageParts = await Promise.all(
      uris.map(async (uri) => {
        const imageBuffer = await downloadImage(uri);
        const type = await fileTypeFromBuffer(imageBuffer as Buffer);
        return fileToGenerativePart(imageBuffer, type?.mime ?? 'application/octet-stream');
      })
    );

    let fullText = '';

    // Generate content stream with prompt and multiple images
    const result = await model.generateContentStream([prompt, ...imageParts]);

    console.log("Generating content stream");

    // Print text as it comes in
    for await (const chunk of result.stream) {
      const chunkText = await chunk.text(); // Await chunk.text()
      fullText += chunkText;
    }

    console.log("Full text: ", fullText);
    return fullText;

  } catch (e) {
    console.error("Error generating content:", e);
    throw e;
  }
};

export default main;