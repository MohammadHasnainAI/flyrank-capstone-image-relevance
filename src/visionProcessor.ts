import { GoogleGenAI } from "@google/genai";
import { ImageMetadataSchema, validateConfidence } from "./visionSchema.js";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

// Cost tracking: Gemini 1.5 Flash Free Tier / Low cost estimates
const ESTIMATED_COST_PER_VISION_CALL = 0.00005; // $0.00005 per call

export async function processImageWithVision(base64Image: string, mimeType: string = "image/jpeg") {
  const prompt = `Analyze this image and return JSON matching this exact structure:
{
  "subject": "main topic or animal in image",
  "category": "animal, tech, nature, etc.",
  "attributes": ["color", "environment", "key features"],
  "caption": "a clear descriptive caption",
  "confidence": score between 0.0 and 1.0
}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            {
              inlineData: {
                data: base64Image,
                mimeType: mimeType,
              },
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
      },
    });

    const rawText = response.text || "{}";
    const rawJson = JSON.parse(rawText);

    // 1. Zod Schema Validation
    const validatedData = ImageMetadataSchema.parse(rawJson);

    // 2. Low-Confidence Check & Flagging
    const checkedData = validateConfidence(validatedData);

    // 3. Cost Tracking Attribution
    return {
      ...checkedData,
      costMetrics: {
        estimatedCostUSD: ESTIMATED_COST_PER_VISION_CALL,
        modelUsed: "gemini-1.5-flash",
        timestamp: new Date().toISOString(),
      },
    };
  } catch (error: any) {
    console.error("Vision processing error:", error.message);
    throw new Error(`Failed to process image schema: ${error.message}`);
  }
}