import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

// Helper to convert file to base64
export const fileToGenerativePart = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Helper for delays
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const analyzeProduceImage = async (base64Image: string): Promise<AnalysisResult> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key not found");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Use a capable multimodal model for analysis (Vision -> JSON)
  const modelId = "gemini-3-flash-preview"; 

  const prompt = `
You are an expert agricultural quality control AI system designed to certify produce for fair-trade markets.
Analyze the provided image of harvested produce (e.g., tomatoes, lemons, apples, etc.) spread on a surface.

Internally, reason using a hybrid computer vision pipeline combining:
- Deep learning–based instance-aware segmentation (U-Net–style encoder–decoder reasoning for precise object boundaries)
- Classical post-processing (Watershed-style separation logic to accurately split touching or overlapping items)

Perform the following computer vision tasks conceptually:
1. **Instance Segmentation**:
   - Identify and count the number of distinct fruit items.
   - Accurately separate touching or overlapping produce using boundary-aware segmentation reasoning.

2. **Feature Extraction**:
   - Estimate the average diameter in millimeters (assume standard size ranges for the detected fruit type if no physical reference is visible).
   - Analyze color consistency and ripeness using illumination-robust color space reasoning; output a score from 0–100.
   - Detect visible surface defects (spots, rot, bruises) and estimate the percentage of the batch affected (0–100%).
   - Calculate a size consistency score (0–100), where 100 indicates highly uniform produce dimensions.

3. **Grading Logic**:
   - Grade A: Defects < 5% AND Size Consistency > 80 AND Color Score > 80.
   - Grade B: Defects < 15%.
   - Grade C: Anything else.

Return the result strictly as a JSON object.
  `;

  // Internal helper to handle retries for transient errors (429, 503)
  const generateWithRetry = async (attempt: number = 1, maxRetries: number = 5): Promise<any> => {
    try {
      return await ai.models.generateContent({
        model: modelId,
        contents: {
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
            { text: prompt }
          ]
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              fruitType: { type: Type.STRING, description: "Type of produce detected, e.g., 'Tomato', 'Lemon'" },
              itemCount: { type: Type.INTEGER, description: "Number of items counted" },
              avgDiameterMm: { type: Type.NUMBER, description: "Average diameter in mm" },
              defectPercentage: { type: Type.NUMBER, description: "Percentage of batch with defects (0-100)" },
              colorScore: { type: Type.NUMBER, description: "Score for color uniformity/ripeness (0-100)" },
              sizeConsistencyScore: { type: Type.NUMBER, description: "Score for size uniformity (0-100)" },
              grade: { type: Type.STRING, enum: ["A", "B", "C"] },
              reasoning: { type: Type.STRING, description: "Short explanation of the grading" },
              defectsDetected: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "List of defect types found, e.g., 'Dark spots', 'Bruising'" 
              },
              colorProfile: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING, description: "Color name (e.g. Red, Green)" },
                    percentage: { type: Type.NUMBER, description: "Percentage of surface area" }
                  }
                },
                description: "Rough color histogram data"
              }
            },
            required: ["fruitType", "itemCount", "grade", "defectPercentage", "reasoning"]
          }
        }
      });
    } catch (error: any) {
      // Robust error checking for various SDK error formats
      let statusCode = error.status;
      if (!statusCode && error.response) statusCode = error.response.status;
      if (!statusCode && error.error) statusCode = error.error.code;
      
      const errorMessage = error.message || JSON.stringify(error);
      
      const isRateLimit = 
        statusCode === 429 || 
        statusCode === 'RESOURCE_EXHAUSTED' ||
        errorMessage.includes('429') || 
        errorMessage.includes('quota') ||
        errorMessage.includes('RESOURCE_EXHAUSTED');
        
      const isServerOverload = statusCode === 503 || errorMessage.includes('503');

      if ((isRateLimit || isServerOverload) && attempt <= maxRetries) {
        // Increased base delay to 2s to handle stricter rate limits
        const delayMs = 2000 * Math.pow(2, attempt - 1); 
        console.warn(`Gemini API busy (Status ${statusCode}). Retrying in ${delayMs}ms... (Attempt ${attempt}/${maxRetries})`);
        await wait(delayMs);
        return generateWithRetry(attempt + 1, maxRetries);
      }
      
      throw error;
    }
  };

  try {
    const response = await generateWithRetry();

    if (response.text) {
      const parsed = JSON.parse(response.text);
      
      // Robustly construct the result object, handling missing fields
      const data: AnalysisResult = {
        fruitType: parsed.fruitType || "Unknown",
        itemCount: typeof parsed.itemCount === 'number' ? parsed.itemCount : 0,
        avgDiameterMm: typeof parsed.avgDiameterMm === 'number' ? parsed.avgDiameterMm : 0,
        defectPercentage: typeof parsed.defectPercentage === 'number' ? parsed.defectPercentage : 0,
        colorScore: typeof parsed.colorScore === 'number' ? parsed.colorScore : 0,
        sizeConsistencyScore: typeof parsed.sizeConsistencyScore === 'number' ? parsed.sizeConsistencyScore : 0,
        grade: ['A', 'B', 'C'].includes(parsed.grade) ? parsed.grade : 'C',
        reasoning: parsed.reasoning || "No reasoning provided by AI.",
        defectsDetected: Array.isArray(parsed.defectsDetected) ? parsed.defectsDetected : [],
        colorProfile: Array.isArray(parsed.colorProfile) ? parsed.colorProfile : []
      };

      return data;
    } else {
      throw new Error("No response text generated");
    }

  } catch (error: any) {
    console.error("Gemini Analysis Failed:", error);
    
    // Provide a more user-friendly message for quota errors
    const errorMessage = error.message || JSON.stringify(error);
    const isQuota = 
        errorMessage.includes('429') || 
        errorMessage.includes('quota') || 
        errorMessage.includes('RESOURCE_EXHAUSTED');

    if (isQuota) {
       throw new Error("Service quota exceeded. Please try again later. (Error 429)");
    }
    
    throw new Error("Failed to analyze image. Please ensure API key is valid and internet is connected.");
  }
};